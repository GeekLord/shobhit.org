# Deploying shobhit.org on CentOS Web Panel (CWP)

This guide documents the production deployment of shobhit.org on CWP using the built-in Node.js Manager (`mod_nodejs`).

**Repository:** [https://github.com/GeekLord/shobhit.org](https://github.com/GeekLord/shobhit.org)

---

## Current Production Setup

| Setting | Value |
|---------|-------|
| **User account** | `shobhito` |
| **Server path** | `/home/shobhito/public_html/` |
| **Node.js version** | 18.x |
| **Startup file** | `server.js` |
| **Application mode** | Production |
| **URL** | `shobhit.org` |
| **Port** | `8899` |
| **Mail server** | Postfix (sendmail) |
| **Source control** | GitHub (GeekLord/shobhit.org) |

> **Note:** Node.js 22 is not compatible with this CWP setup. Use Node 14 or 18.

---

## Server File Structure

```
/home/shobhito/public_html/
├── .git/                  # Git repository
├── .kiro/                 # Kiro IDE config
├── assets/                # SVG images (mascot, logo, hero, favicon)
├── data/                  # Persistent data storage
│   └── pins.json          # Map pins database
├── scripts/               # Frontend JavaScript
│   ├── site.js            # Shared nav/footer, achievements, Easter eggs
│   ├── map.js             # Leaflet map, pins, message feed
│   ├── quotes.js          # Facts, quotes, name decoder
│   ├── play.js            # Mini-games
│   ├── home.js            # Home page animations
│   └── contact.js         # Floating contact button & modal
├── styles/
│   └── main.css           # Design system
├── index.html             # Home page
├── map.html               # World map page
├── name.html              # The Name page
├── quotes.html            # Quotes page
├── play.html              # Playground page
├── server.js              # Node.js API server
├── README.md              # Project documentation
└── deploy.md              # This file
```

---

## CWP Node.js Manager Setup

The site uses CWP's built-in **mod_nodejs** module to manage the Node.js application.

### Accessing Node.js Manager

1. Log into **CWP Admin Panel**
2. Navigate to **mod_nodejs** (or **Node.js Manager**)
3. Click on the **Applications** tab

### Current Application Configuration

| Field | Value |
|-------|-------|
| User account | `shobhito` |
| NodeJS Version | `18.x` |
| Descriptive name | `Shobhit.org` |
| Application mode | `Production` |
| Path | `/home/shobhito/public_html/` |
| Startup file | `server.js` |
| URL | `shobhit.org` |
| Port | `8899` |

### Management Actions

From the mod_nodejs interface, you can:

- **NPM Install** — Install dependencies from package.json (not needed for this project)
- **Stop** — Stop the Node.js application
- **Restart** — Restart the application after code changes
- **View log** — Check application logs for errors

---

## API Endpoints

The Node.js server exposes these API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/pins` | Get all map pins |
| `POST` | `/api/pins` | Add a new map pin |
| `GET` | `/api/pins.csv` | Download pins as CSV |
| `GET` | `/api/pins.download` | Download pins as JSON |
| `POST` | `/api/contact` | Send contact form email |

### Contact Form Email

The `/api/contact` endpoint sends emails using Postfix:

- **To:** `shobhit@shobhit.net`
- **From:** `noreply@shobhit.org`
- **Reply-To:** User's email address

---

## Updating the Site

### After Code Changes

1. Upload new files to `/home/shobhito/public_html/`
2. Go to **mod_nodejs** in CWP
3. Click **Restart** to reload the Node.js application

### Using Git (if configured)

```bash
cd /home/shobhito/public_html
git pull origin main
```

Then restart the Node.js app from CWP.

---

## Extending the Backend

When adding new features to `server.js`:

### Adding a New API Endpoint

Edit `server.js` and add your route in the `handleApi()` function:

```javascript
// Example: Add a new endpoint
if (pathname === '/api/your-feature' && req.method === 'GET') {
  // Your logic here
  return sendJson(res, 200, { data: 'your response' });
}

if (pathname === '/api/your-feature' && req.method === 'POST') {
  let body = '';
  req.on('data', function (chunk) {
    body += chunk;
    if (body.length > 1e5) req.destroy(); // 100kb guard
  });
  req.on('end', function () {
    let data;
    try { data = JSON.parse(body || '{}'); } catch (e) { return sendJson(res, 400, { error: 'bad json' }); }
    
    // Process data and respond
    return sendJson(res, 200, { success: true });
  });
  return;
}
```

### Adding Data Persistence

For new data files, follow the pattern used for pins:

```javascript
const YOUR_FILE = path.join(DATA_DIR, 'your-data.json');

function readYourData() {
  try {
    const raw = fs.readFileSync(YOUR_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return []; // or {} for objects
  }
}

function writeYourData(data) {
  fs.writeFileSync(YOUR_FILE, JSON.stringify(data, null, 2), 'utf8');
}
```

### Sending Emails

Use the existing `sendMail()` function:

```javascript
sendMail(
  'recipient@example.com',  // to
  'noreply@shobhit.org',    // from
  'user@example.com',       // reply-to
  'Subject Line',           // subject
  'Email body text'         // body
).then(function() {
  console.log('Email sent');
}).catch(function(err) {
  console.error('Failed:', err.message);
});
```

---

## Logs & Debugging

### View Application Logs

1. Go to **mod_nodejs** in CWP
2. Click **View log** button

### Check Postfix Mail Logs

```bash
sudo tail -f /var/log/maillog
```

### Test Email Manually

```bash
echo "Test message" | sendmail -v shobhit@shobhit.net
```

---

## Troubleshooting

### Node.js App Won't Start

1. Check logs via **View log** in mod_nodejs
2. Verify `server.js` syntax: `node --check server.js`
3. Check port 8899 isn't in use: `netstat -tlnp | grep 8899`

### API Returns 502/503

1. Node.js app not running → Click **Restart** in mod_nodejs
2. Check if the app crashed → View logs

### Contact Form Not Sending

1. Verify Postfix is running: `systemctl status postfix`
2. Check mail logs: `tail -f /var/log/maillog`
3. Test sendmail: `echo "test" | sendmail -v your@email.com`

### Data Not Saving

1. Check `data/` directory permissions: should be writable
2. Verify `data/pins.json` exists and is writable
3. Check disk space: `df -h`

---

## Security Notes

- The API endpoints are open (no authentication). For a personal site this is fine, but consider adding rate limiting if traffic increases.
- Input is sanitized (max lengths, control characters stripped).
- Path traversal protection prevents accessing files outside public_html.

---

## CI/CD Pipeline with GitHub Actions

Automate deployments from GitHub to your CWP server using GitHub Actions and SSH.

### Prerequisites

1. SSH access to your server
2. SSH key pair for authentication
3. GitHub repository secrets configured

### Step 1: Generate SSH Key (if needed)

On your local machine or server:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
```

Add the public key to your server:

```bash
# On the server
cat ~/.ssh/github_deploy.pub >> /home/shobhito/.ssh/authorized_keys
chmod 600 /home/shobhito/.ssh/authorized_keys
```

### Step 2: Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `SSH_PRIVATE_KEY` | Contents of `~/.ssh/github_deploy` (private key) |
| `SSH_HOST` | Your server IP or hostname |
| `SSH_USER` | `shobhito` |
| `SSH_PORT` | `22` (or your SSH port) |

### Step 3: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to CWP Server

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Allow manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Add host key
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -p ${{ secrets.SSH_PORT }} -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy to server
        run: |
          ssh -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'ENDSSH'
            cd /home/shobhito/public_html
            
            # Pull latest changes
            git fetch origin main
            git reset --hard origin/main
            
            # Preserve data directory (don't overwrite pins)
            # Data is in .gitignore so git pull won't affect it
            
            echo "Deployment complete at $(date)"
          ENDSSH

      - name: Restart Node.js app via API (optional)
        run: |
          # If you have a restart endpoint or webhook, call it here
          # Otherwise, manually restart from CWP panel
          echo "Remember to restart the Node.js app in CWP if server.js changed"
```

### Step 4: Ensure Data Directory is Gitignored

Make sure `data/pins.json` isn't overwritten on deploy. Add to `.gitignore`:

```
data/pins.json
```

Keep the directory structure by adding `data/.gitkeep`:

```bash
touch data/.gitkeep
git add data/.gitkeep
```

### Alternative: Webhook-Based Deployment

If you prefer webhooks over SSH:

1. Create a simple webhook endpoint in `server.js`
2. Configure GitHub webhook to POST on push
3. The webhook triggers `git pull` on the server

Add to `server.js`:

```javascript
// Webhook for GitHub deployments (add secret validation in production)
if (pathname === '/api/deploy-webhook' && req.method === 'POST') {
  const { execSync } = require('child_process');
  try {
    execSync('git fetch origin main && git reset --hard origin/main', { 
      cwd: ROOT,
      timeout: 30000 
    });
    console.log('[deploy] Git pull successful');
    return sendJson(res, 200, { success: true, message: 'Deployed' });
  } catch (err) {
    console.error('[deploy] Failed:', err.message);
    return sendJson(res, 500, { error: 'Deploy failed' });
  }
}
```

### Manual Deployment (Current Method)

```bash
# SSH into server
ssh shobhito@your-server

# Navigate to site
cd /home/shobhito/public_html

# Pull changes
git pull origin main

# Then restart via CWP panel: mod_nodejs → Restart
```

---

## Quick Reference

| Task | How |
|------|-----|
| Restart Node.js | CWP → mod_nodejs → Restart |
| View logs | CWP → mod_nodejs → View log |
| Stop server | CWP → mod_nodejs → Stop |
| Check mail | `tail -f /var/log/maillog` |
| Test email | `echo "test" \| sendmail -v email@example.com` |
| Manual deploy | `ssh` → `git pull` → CWP restart |
| Auto deploy | Push to `main` branch (with CI/CD configured) |

---

*Server running since: June 2026*  
*Last updated: June 2026*
