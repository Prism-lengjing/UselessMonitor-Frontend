# Useless Monitor Frontend

A single-page Vite + React experience that renders an interstellar operations console with a bilingual user interface, animated starfield backdrop, and live-updating telemetry widgets. The app focuses on presenting system availability, regional performance, and recent events in a sci-fi monitoring theme.

## Features
- **System integrity dashboard** with animated progress indicator and bilingual labels (English/Chinese).
- **Service grid** showing latency, uptime, and status per subsystem, complete with localized status chips.
- **Terminal-style event stream** that continuously emits randomized INFO/WARN/CRIT events with auto-scroll controls.
- **Ambient visualization** powered by a canvas-based starfield and subtle data-visual overlays.
- **Language toggle** that switches every on-screen label between English and Chinese without reloading.

## Getting Started
### Prerequisites
- Node.js 18+

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
This starts Vite in development mode. Open the printed local URL to explore the dashboard.

### Production Build
```bash
npm run build
```
Outputs an optimized bundle to `dist/`.

## Configuration
Create `public/config.json` to let the dashboard know how to reach the backend API. A starter file is provided at `public/config.example.json`:

```json
{
  "apiBaseUrl": "http://localhost:8080",
  "readKey": "CHANGE_ME_READ_KEY"
}
```

- `apiBaseUrl`: The base URL of the UselessMonitor backend (for example `https://monitor.example.com`).
- `readKey`: The `READ_KEY` value configured on the backend; it will be sent as the `Authorization` header for every request.

Copy the example file, update the values, and restart Vite:

```bash
cp public/config.example.json public/config.json
# edit public/config.json and insert your keys
npm run dev
```

The frontend will automatically fetch `/monitor` and `/status` from the configured backend at runtime.
