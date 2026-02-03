# Quote Follow-Up Tracker

Track quotes and automate follow-up sequences for Hickory Dickory Decks.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5179](http://localhost:5179) in your browser.

## Features

- **Dashboard** with key metrics (total quotes, pending follow-ups, conversion rate)
- **Quote Management** with status tracking
- **Automated Follow-Up Sequences** (24h, 72h, 7d templates)
- **Conversion Funnel** visualization
- **CSV Export** for reporting
- **localStorage** persistence (no backend required)

## Follow-Up Timeline

1. **24 hours** - SMS check-in
2. **72 hours** - Email with full quote details
3. **7 days** - Final SMS
4. **14 days** - Auto-close as lost

## Project Type

This is a Vite + React + TypeScript project using Tailwind CSS v4.

All data is stored locally in your browser using localStorage.

## Build

```bash
npm run build
```

Output goes to `dist/` directory.
