# shobhit.org ✨

A playful, visually rich web experience built exclusively for people named **Shobhit**. Pin yourself on a real world map, decode the meaning of the name, collect quotes, beat three mini-games, and hunt down hidden Easter eggs.

The whole thing is a self-contained static site with an optional zero-dependency Node backend that saves map pins to a file. No frameworks, no build step, no tracking.

---

## Table of contents

- [Features](#features)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Pages](#pages)
- [The backend & data persistence](#the-backend--data-persistence)
- [API reference](#api-reference)
- [Achievements & Easter eggs](#achievements--easter-eggs)
- [Design system](#design-system)
- [Accessibility](#accessibility)
- [Customizing](#customizing)
- [Tech & credits](#tech--credits)

---

## Features

- 🗺️ **Real interactive world map** — Leaflet + OpenStreetMap tiles. Click anywhere to drop a pin on true coordinates and leave a message. Reverse geocoding pre-fills your city.
- 💾 **File-based persistence** — pins are saved to `data/pins.json` through a tiny Node server, with automatic `localStorage` fallback when the server isn't running.
- 📨 **Live "Latest hellos" feed** — recent messages from fellow Shobhits, with relative timestamps.
- ✨ **The Name, decoded** — letter-by-letter breakdown of S-H-O-B-H-I-T, fun facts, and a "What kind of Shobhit are you?" vibe generator.
- 💬 **Quotes** — an auto-rotating quote stage with copy-to-clipboard, plus a full masonry quote wall.
- 🎮 **Playground** — three mini-games: Catch the Mascot, Emoji Memory Match, and the Shobhit Quiz, all with saved best scores.
- 🏆 **Achievements & Easter eggs** — 10 unlockable surprises tracked across pages and visits.
- 🎨 **Pastel-meets-vibrant design** — soft palette with spirited accents, performant micro-interactions, a sparkle cursor, optional sound, and full `prefers-reduced-motion` support.
- 📱 **Responsive** — works from phone to desktop, including a collapsible mobile menu.

---

## Quick start

### Option A — full experience (recommended)

Runs the Node server so map pins persist to a file.

```bash
node server.js
```

Then open <http://localhost:8899>.

> Requires Node.js. No `npm install` needed — the server uses only built-in modules.

You can change the port:

```bash
# macOS/Linux
PORT=3000 node server.js

# Windows (PowerShell)
$env:PORT=3000; node server.js
```

### Option B — static only

Open `index.html` directly in a browser, or serve the folder with any static server (e.g. `python -m http.server`). The map still works fully, but pins are saved to your browser's `localStorage` instead of a file.

---

## Project structure

```
shobhit.org/
├── index.html            # Home
├── map.html              # Interactive world map (Leaflet)
├── name.html             # The Name: meaning, letters, persona generator
├── quotes.html           # Quote stage + quote wall
├── play.html             # Playground: games + achievements board
├── server.js             # Zero-dependency static + API server
├── README.md             # This file
├── shobhit.org.md        # Original product brief
├── assets/
│   ├── favicon.svg        # Site icon
│   ├── logo.svg           # Wordmark logo
│   ├── mascot.svg         # The mascot character
│   └── hero-scene.svg     # Dreamy hero backdrop
├── data/
│   └── pins.json          # Saved map pins (seeded with 12 cities)
├── scripts/
│   ├── site.js            # Shared chrome: nav/footer, sound, sparkle cursor,
│   │                      #   achievements, global Easter eggs, scroll reveals
│   ├── map.js             # Leaflet map, pin add/persist, message feed
│   ├── quotes.js          # Facts, quotes, name letters, persona generator
│   ├── play.js            # The three mini-games + achievements board
│   └── home.js            # Home-only: animated stats + mascot pats
└── styles/
    └── main.css           # The entire design system
```

> **Load order matters:** every page loads `scripts/site.js` first (it defines the global `window.Shobhit` toolkit and injects the nav/footer), then its page-specific scripts.

---

## Pages

| Page | File | What's there |
|------|------|--------------|
| Home | `index.html` | Hero, live stats, "explore" cards, quote + facts teasers |
| World Map | `map.html` | Leaflet map, add-pin modal, live message feed |
| The Name | `name.html` | Letter breakdown, persona generator, fun facts |
| Quotes | `quotes.html` | Rotating quote stage (copy/shuffle) + quote wall |
| Playground | `play.html` | Catch the Mascot, Memory Match, Quiz, achievements |

The nav bar and footer are not hard-coded in each page — they're injected by `site.js` from the `PAGES` array, so adding or renaming a page is a one-line change there.

---

## The backend & data persistence

`server.js` is a small HTTP server built only on Node's `http`, `fs`, and `path` modules:

- Serves all static files (HTML, CSS, JS, SVG) with correct MIME types and basic path-traversal protection.
- Exposes a JSON API for reading and adding map pins.
- Persists pins to `data/pins.json`, creating the file/folder if missing.
- Validates and sanitizes incoming pins (coordinate ranges, string length, control-character stripping).

When `map.js` loads, it tries the API first; if that fails (for example when the page is opened directly without the server), it transparently falls back to `localStorage` (`shobhit_pins_v2`).

---

## API reference

Base URL: `http://localhost:8899`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/pins` | Returns `{ "pins": [...] }` |
| `POST` | `/api/pins` | Adds a pin. Body: `{ lat, lon, place, msg }`. Returns `{ pin, count }` |
| `GET` | `/api/pins.csv` | Download all pins as CSV |
| `GET` | `/api/pins.download` | Download all pins as JSON |

A pin record looks like:

```json
{
  "id": "p_xxxxx",
  "lat": 28.6139,
  "lon": 77.2090,
  "place": "New Delhi, India",
  "msg": "Namaste from where it all began!",
  "ts": 1700000000000,
  "seed": false
}
```

> Note: the CSV/JSON download endpoints still exist on the server but are no longer linked from the UI.

> ⚠️ **Security note:** `POST /api/pins` is open and unauthenticated. That's fine for local/personal use, but add rate-limiting or moderation before exposing it publicly.

---

## Achievements & Easter eggs

There are **10** achievements, tracked in `localStorage` (`shobhit_eggs_v1`) and shown on the Playground board and in the footer counter.

| How to unlock | Achievement |
|---------------|-------------|
| Enter the Konami code (`↑ ↑ ↓ ↓ ← → ← → b a`) | 🕹️ Konami Coder |
| Type `party` anywhere | 🌈 Party Animal |
| Pat the home-page mascot 7 times | 🤖 Mascot Whisperer |
| Drop your first map pin | 📍 On The Map |
| Reach 5+ unique places on the map | 🌍 Globe Trotter |
| Spin the rare unicorn mood (legacy) | 🦄 Unicorn Spotter |
| Catch 18+ mascots in one game | ⚡ Lightning Reflexes |
| Clear Emoji Memory Match | 🧠 Memory Master |
| Score 4+ on the Shobhit Quiz | 🎯 Quiz Whiz |
| Shuffle through 5 quotes | 📜 Quote Collector |

Sound effects are **off by default** — toggle the 🔇 button in the nav for the full experience.

---

## Design system

All styling lives in `styles/main.css`, driven by CSS custom properties:

- **Palette:** pastel pink/lavender/cyan/mint/peach bases with vibrant gradient accents (`--grad-hero`, `--grad-warm`, `--grad-cool`, `--grad-candy`).
- **Type:** Baloo 2 (display) + Quicksand (body), loaded from Google Fonts.
- **Motion:** transforms/opacity only, bouncy `cubic-bezier` easings, scroll-reveal via `IntersectionObserver`.
- **Assets:** all illustrations are hand-authored SVG (no raster images), so they stay crisp at any size.

---

## Accessibility

- Honors `prefers-reduced-motion` — disables confetti, the sparkle cursor, pin pulses, and reveal transitions.
- Keyboard-accessible interactive zones and visible focus styles.
- Semantic landmarks, ARIA labels on the map and icon-only controls, and live regions for toasts.

---

## Customizing

- **Add a page:** create the HTML file, add it to the `PAGES` array in `scripts/site.js`.
- **Change the palette:** edit the `:root` custom properties at the top of `styles/main.css`.
- **Edit content:** facts, quotes, and the letter breakdown live in `scripts/quotes.js`; seed pins live in `data/pins.json`.
- **Add a game or achievement:** games are in `scripts/play.js`; register new achievements in the `ACHIEVEMENTS` map in `scripts/site.js`.

---

## Tech & credits

- [Leaflet](https://leafletjs.com/) for the interactive map (loaded from a CDN with SRI integrity hashes).
- [OpenStreetMap](https://www.openstreetmap.org/copyright) for map tiles.
- [Nominatim](https://nominatim.org/) for optional reverse geocoding.
- Fonts: Baloo 2 & Quicksand via Google Fonts.

A fan-made celebration of a great name. Made with 💜 by a [Shobhit](https://shobhit.net/) for every Shobhit, everywhere.