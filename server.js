/* =========================================================
   shobhit.org — zero-dependency static + API server
   Run:  node server.js   (then open http://localhost:8899)
   Persists pins to data/pins.json. Exports CSV at /api/pins.csv
   ========================================================= */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 8899;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const PINS_FILE = path.join(DATA_DIR, 'pins.json');

// Contact form config
const CONTACT_TO = 'shobhit@shobhit.net';
const CONTACT_FROM = 'noreply@shobhit.org';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.md': 'text/markdown; charset=utf-8'
};

/* ----------------------- data helpers ----------------------- */
function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PINS_FILE)) fs.writeFileSync(PINS_FILE, '[]', 'utf8');
}

function readPins() {
  try {
    const raw = fs.readFileSync(PINS_FILE, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function writePins(arr) {
  fs.writeFileSync(PINS_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

function sanitize(str, max) {
  return String(str == null ? '' : str).replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

function toCsv(pins) {
  const head = ['id', 'lat', 'lon', 'place', 'message', 'timestamp'];
  const esc = function (v) {
    const s = String(v == null ? '' : v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const rows = pins.map(function (p) {
    return [p.id, p.lat, p.lon, p.place, p.msg, new Date(p.ts || Date.now()).toISOString()].map(esc).join(',');
  });
  return head.join(',') + '\n' + rows.join('\n') + '\n';
}

/* ----------------------- email via sendmail ----------------------- */
function sendMail(to, from, replyTo, subject, body) {
  return new Promise(function (resolve, reject) {
    // Build raw email message
    const headers = [
      'To: ' + to,
      'From: ' + from,
      'Reply-To: ' + replyTo,
      'Subject: ' + subject,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      ''
    ].join('\r\n');
    const message = headers + '\r\n' + body;

    // Use sendmail (provided by Postfix)
    const sendmail = spawn('sendmail', ['-t', '-oi']);
    let stderr = '';

    sendmail.stderr.on('data', function (chunk) { stderr += chunk; });

    sendmail.on('close', function (code) {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error('sendmail exited with code ' + code + ': ' + stderr));
      }
    });

    sendmail.on('error', function (err) {
      reject(new Error('Failed to spawn sendmail: ' + err.message));
    });

    sendmail.stdin.write(message);
    sendmail.stdin.end();
  });
}

/* ----------------------- response helpers ----------------------- */
function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function sendText(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
  res.end(body);
}

/* ----------------------- API ----------------------- */
function handleApi(req, res, pathname) {
  // list pins
  if (pathname === '/api/pins' && req.method === 'GET') {
    return sendJson(res, 200, { pins: readPins() });
  }

  // CSV export
  if (pathname === '/api/pins.csv' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="shobhits.csv"',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(toCsv(readPins()));
  }

  // JSON export (download)
  if (pathname === '/api/pins.download' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="shobhits.json"',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify(readPins(), null, 2));
  }

  // add a pin
  if (pathname === '/api/pins' && req.method === 'POST') {
    let body = '';
    req.on('data', function (chunk) {
      body += chunk;
      if (body.length > 1e5) req.destroy(); // 100kb guard
    });
    req.on('end', function () {
      let data;
      try { data = JSON.parse(body || '{}'); } catch (e) { return sendJson(res, 400, { error: 'bad json' }); }

      const lat = Number(data.lat);
      const lon = Number(data.lon);
      if (!isFinite(lat) || !isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return sendJson(res, 400, { error: 'invalid coordinates' });
      }
      const place = sanitize(data.place, 80);
      if (!place) return sendJson(res, 400, { error: 'place required' });

      const pin = {
        id: 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        lat: Math.round(lat * 1e5) / 1e5,
        lon: Math.round(lon * 1e5) / 1e5,
        place: place,
        msg: sanitize(data.msg, 160),
        ts: Date.now(),
        seed: false
      };
      const pins = readPins();
      pins.push(pin);
      try { writePins(pins); } catch (e) { return sendJson(res, 500, { error: 'could not save' }); }
      return sendJson(res, 201, { pin: pin, count: pins.length });
    });
    return;
  }

  // contact form
  if (pathname === '/api/contact' && req.method === 'POST') {
    let body = '';
    req.on('data', function (chunk) {
      body += chunk;
      if (body.length > 1e5) req.destroy();
    });
    req.on('end', function () {
      let data;
      try { data = JSON.parse(body || '{}'); } catch (e) { return sendJson(res, 400, { error: 'bad json' }); }

      const name = sanitize(data.name, 80);
      const email = sanitize(data.email, 120);
      const message = sanitize(data.message, 2000);

      if (!name || !email || !message) {
        return sendJson(res, 400, { error: 'name, email, and message are required' });
      }

      // Basic email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return sendJson(res, 400, { error: 'invalid email format' });
      }

      const subject = '[shobhit.org] Message from ' + name;
      const emailBody = [
        'New message from shobhit.org contact form',
        '==========================================',
        '',
        'Name: ' + name,
        'Email: ' + email,
        '',
        'Message:',
        '--------',
        message,
        '',
        '==========================================',
        'Sent at: ' + new Date().toISOString()
      ].join('\n');

      sendMail(CONTACT_TO, CONTACT_FROM, email, subject, emailBody)
        .then(function () {
          console.log('[contact] Email sent from ' + email);
          return sendJson(res, 200, { success: true });
        })
        .catch(function (err) {
          console.error('[contact] Failed to send email:', err.message);
          return sendJson(res, 500, { error: 'failed to send email' });
        });
    });
    return;
  }

  return sendJson(res, 404, { error: 'not found' });
}

/* ----------------------- static files ----------------------- */
function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/') rel = '/index.html';
  // prevent path traversal
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) return sendText(res, 403, 'Forbidden');

  fs.stat(filePath, function (err, stat) {
    if (err || !stat.isFile()) {
      return sendText(res, 404, 'Not found: ' + rel);
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ----------------------- server ----------------------- */
ensureData();

const server = http.createServer(function (req, res) {
  const u = new URL(req.url, 'http://localhost');
  const pathname = u.pathname;

  if (pathname.startsWith('/api/')) {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      return res.end();
    }
    return handleApi(req, res, pathname);
  }
  return serveStatic(req, res, pathname);
});

server.listen(PORT, function () {
  console.log('✨ shobhit.org running at http://localhost:' + PORT);
  console.log('   Pins are saved to ' + path.relative(ROOT, PINS_FILE));
});
