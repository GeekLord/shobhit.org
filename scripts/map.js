/* =========================================================
   map.js — the actual world map (Leaflet + OpenStreetMap)
   Pins persist to the server's data/pins.json when available,
   otherwise to localStorage. Real coordinates throughout.
   ========================================================= */

window.ShobhitMap = (function () {
  'use strict';

  const S = window.Shobhit || { toast: function () {}, confetti: function () {}, sound: function () {}, achievement: function () {} };
  const LS_KEY = 'shobhit_pins_v2';

  // fallback seeds if neither server nor localStorage have data
  const SEED = [
    { id: 's1', lat: 28.6139, lon: 77.2090, place: 'New Delhi, India', msg: 'Namaste from where it all began! 🇮🇳', ts: 1700000000000, seed: true },
    { id: 's2', lat: 19.0760, lon: 72.8777, place: 'Mumbai, India', msg: 'City of dreams, full of Shobhits.', ts: 1700000001000, seed: true },
    { id: 's3', lat: 12.9716, lon: 77.5946, place: 'Bengaluru, India', msg: 'Coding and filter coffee. ☕', ts: 1700000002000, seed: true },
    { id: 's4', lat: 40.7128, lon: -74.0060, place: 'New York, USA', msg: 'Made it here, can make it anywhere!', ts: 1700000003000, seed: true },
    { id: 's5', lat: 51.5074, lon: -0.1278, place: 'London, UK', msg: 'Mind the gap, fellow Shobhits.', ts: 1700000006000, seed: true },
    { id: 's6', lat: 35.6762, lon: 139.6503, place: 'Tokyo, Japan', msg: 'こんにちは, Shobhit-san!', ts: 1700000010000, seed: true },
    { id: 's7', lat: -33.8688, lon: 151.2093, place: 'Sydney, Australia', msg: "G'day from down under! 🦘", ts: 1700000011000, seed: true }
  ];

  let map = null;
  let layer = null;
  let pins = [];
  let serverOk = false;
  let pending = null; // {lat, lon}

  /* ---------------- data ---------------- */
  function loadLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }
  function saveLocal() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(pins)); } catch (e) {}
  }

  function fetchPins() {
    return fetch('api/pins', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('bad'); return r.json(); })
      .then(function (data) { serverOk = true; return data.pins || []; })
      .catch(function () {
        serverOk = false;
        const local = loadLocal();
        return local && local.length ? local : SEED.slice();
      });
  }

  function persistNew(pin) {
    if (serverOk) {
      return fetch('api/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pin)
      }).then(function (r) { return r.json(); })
        .then(function (res) { if (res && res.pin) return res.pin; throw new Error('save failed'); })
        .catch(function () { serverOk = false; saveLocal(); return pin; });
    }
    saveLocal();
    return Promise.resolve(pin);
  }

  /* ---------------- markers ---------------- */
  function pinIcon(i) {
    const variant = i % 3;
    return L.divIcon({
      className: 'leaf-pin-wrap',
      html: '<span class="leaf-pin leaf-pin--' + variant + '"><span class="leaf-pin__pulse"></span><span class="leaf-pin__dot"></span></span>',
      iconSize: [26, 34],
      iconAnchor: [13, 32],
      popupAnchor: [0, -30]
    });
  }

  function popupHtml(pin) {
    const msg = pin.msg ? '<p class="pop__msg">' + esc(pin.msg) + '</p>' : '';
    return '<div class="pop"><strong class="pop__place">' + esc(pin.place) + '</strong>' + msg +
      '<span class="pop__time">' + timeAgo(pin.ts) + '</span></div>';
  }

  function addMarker(pin, i) {
    const m = L.marker([pin.lat, pin.lon], { icon: pinIcon(i), keyboard: false });
    m.bindPopup(popupHtml(pin));
    m.addTo(layer);
    return m;
  }

  function renderAll() {
    layer.clearLayers();
    pins.forEach(addMarker);
    renderFeed();
    updateStats();
  }

  /* ---------------- feed + stats ---------------- */
  function renderFeed() {
    const feed = document.getElementById('pinFeed');
    if (!feed) return;
    const recent = pins.slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); }).slice(0, 12);
    feed.innerHTML = recent.map(function (p) {
      return '<li class="feed__item"><span class="feed__dot"></span>' +
        '<div><strong>' + esc(p.place) + '</strong>' +
        (p.msg ? '<span class="feed__msg">' + esc(p.msg) + '</span>' : '') +
        '<span class="feed__time">' + timeAgo(p.ts) + '</span></div></li>';
    }).join('');
  }

  function updateStats() {
    const total = pins.length;
    const places = new Set(pins.map(function (p) { return p.place.toLowerCase().trim(); })).size;
    setText('mapCount', total);
    setText('mapPlaces', places);
    document.querySelectorAll('[data-stat="pins"]').forEach(function (el) { el.textContent = total; });
    document.querySelectorAll('[data-stat="places"]').forEach(function (el) { el.textContent = places; });
    if (places >= 5) S.achievement('globe-trotter');
  }

  /* ---------------- add pin flow ---------------- */
  function onMapClick(e) {
    pending = { lat: e.latlng.lat, lon: e.latlng.lng };
    openModal();
    reverseGeocode(pending.lat, pending.lon);
  }

  function reverseGeocode(lat, lon) {
    const input = document.getElementById('pinName');
    if (!input || input.value.trim()) return;
    input.placeholder = 'Finding your spot…';
    const url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=' + lat + '&lon=' + lon + '&zoom=10';
    const ctrl = ('AbortController' in window) ? new AbortController() : null;
    if (ctrl) window.setTimeout(function () { ctrl.abort(); }, 4000);
    fetch(url, { headers: { 'Accept': 'application/json' }, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        const a = d.address || {};
        const city = a.city || a.town || a.village || a.county || a.state || '';
        const country = a.country || '';
        const guess = [city, country].filter(Boolean).join(', ');
        if (guess && input && !input.value.trim()) input.value = guess;
        input.placeholder = 'e.g. Bengaluru, India';
      })
      .catch(function () { input.placeholder = 'e.g. Bengaluru, India'; });
  }

  function openModal() {
    const modal = document.getElementById('pinModal');
    const nameInput = document.getElementById('pinName');
    if (modal && typeof modal.showModal === 'function') {
      modal.showModal();
      if (nameInput) window.setTimeout(function () { nameInput.focus(); }, 50);
    }
  }

  function bindModal() {
    const modal = document.getElementById('pinModal');
    const form = document.getElementById('pinForm');
    const cancel = document.getElementById('pinCancel');
    if (!modal || !form) return;
    cancel && cancel.addEventListener('click', function () { modal.close(); pending = null; });
    form.addEventListener('submit', function () {
      const place = (document.getElementById('pinName').value || '').trim();
      const msg = (document.getElementById('pinMsg').value || '').trim();
      if (!place || !pending) return;
      const pin = {
        id: 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        lat: Math.round(pending.lat * 1e5) / 1e5,
        lon: Math.round(pending.lon * 1e5) / 1e5,
        place: place, msg: msg, ts: Date.now(), seed: false
      };
      pending = null;
      form.reset();
      persistNew(pin).then(function (saved) {
        pins.push(saved);
        addMarker(saved, pins.length - 1);
        if (!serverOk) saveLocal();
        renderFeed();
        updateStats();
        map.flyTo([saved.lat, saved.lon], Math.max(map.getZoom(), 4), { duration: 1.1 });
        S.toast('Welcome to the map, ' + saved.place + '! 🌟');
        S.confetti(70);
        S.sound('ding');
        S.achievement('map-pin');
      });
    });
  }

  /* ---------------- extras ---------------- */
  function flyRandom() {
    if (!pins.length) return;
    const p = pins[Math.floor(Math.random() * pins.length)];
    map.flyTo([p.lat, p.lon], 5, { duration: 1.4 });
    S.sound('pop');
    window.setTimeout(function () {
      layer.eachLayer(function (m) {
        const ll = m.getLatLng();
        if (Math.abs(ll.lat - p.lat) < 1e-4 && Math.abs(ll.lng - p.lon) < 1e-4) m.openPopup();
      });
    }, 1500);
  }

  function bindExports() { /* export buttons removed */ }

  /* ---------------- helpers ---------------- */
  function toCsv(arr) {
    const head = 'id,lat,lon,place,message,timestamp';
    const esc2 = function (v) { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    return head + '\n' + arr.map(function (p) {
      return [p.id, p.lat, p.lon, p.place, p.msg, new Date(p.ts || Date.now()).toISOString()].map(esc2).join(',');
    }).join('\n');
  }
  function downloadBlob(content, name, type) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    window.setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 100);
  }
  function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function timeAgo(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    if (diff < 0) return 'just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    if (days < 30) return days + 'd ago';
    return new Date(ts).toLocaleDateString();
  }

  /* ---------------- init ---------------- */
  function init() {
    const el = document.getElementById('leafmap');
    if (!el || typeof L === 'undefined') return;

    map = L.map('leafmap', {
      center: [22, 12],
      zoom: 2,
      minZoom: 2,
      maxZoom: 12,
      worldCopyJump: true,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    layer = L.layerGroup().addTo(map);

    bindModal();
    bindExports();

    const randBtn = document.getElementById('flyRandom');
    if (randBtn) randBtn.addEventListener('click', flyRandom);

    fetchPins().then(function (data) {
      pins = data;
      if (!serverOk) saveLocal();
      renderAll();
    });

    map.on('click', onMapClick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  return { flyRandom: flyRandom };
})();
