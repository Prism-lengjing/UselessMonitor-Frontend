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
The interface currently relies on mocked telemetry and does not require external services. If you later connect it to real APIs, create a `.env.local` file and load any needed keys via Vite's `import.meta.env` mechanism.
