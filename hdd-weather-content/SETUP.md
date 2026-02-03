# Weather Content - Quick Setup Guide

## Prerequisites

1. Node.js installed
2. GBP Post Scheduler running (optional, for draft creation feature)

## Local Development Setup

### 1. Install Dependencies

```bash
cd C:\Projects\HDD\hdd-weather-content
npm install
```

### 2. Configure Environment (Optional)

If you want to enable GBP draft creation:

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env`:
```
VITE_GBP_POSTER_URL=http://localhost:3000
VITE_GBP_POSTER_API_KEY=your-api-key-here
VITE_GBP_FRANCHISE_ID=your-franchise-id-here
```

**To get these values:**
- API key: Generate with `openssl rand -hex 32` and add to GBP Poster `.env` as `EXTERNAL_API_KEY`
- Franchise ID: Run GBP Poster, open Prisma Studio (`npx prisma studio`), get UUID from `franchises` table

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5177

## Features

### Weather Display
- Shows current Cincinnati weather (NWS API)
- 5-day forecast
- Updates on demand

### Content Suggestions
The app generates weather-based content suggestions:
- **GBP Posts** - Google Business Profile posts
- **Social Media** - Facebook/Instagram content
- **Email Campaigns** - Email marketing

### Draft Creation (requires .env setup)
1. Click **"Create GBP Draft"** on any GBP suggestion
2. Review/edit content in modal
3. Click **"Create Draft"**
4. New tab opens with draft in GBP Post Scheduler

## Standalone Usage

The app works **without** GBP integration:
- Weather data always loads (no API key needed)
- Suggestions are generated
- Copy button works
- Draft creation button is disabled with warning

## Build for Production

```bash
npm run build
npm run preview
```

Files are output to `dist/` directory.

## Troubleshooting

### Weather not loading
- Check internet connection
- NWS API may be temporarily down
- Check browser console for errors

### Draft button disabled
- Verify `.env` file exists
- Check all three variables are set (URL, API_KEY, FRANCHISE_ID)
- Variable names must start with `VITE_`

### Draft creation fails
- Verify GBP Post Scheduler is running
- Check API key matches in both `.env` files
- Verify franchise ID is correct UUID
- Check browser console for detailed error

## Tech Stack

- React 19
- TypeScript
- Vite 7
- NWS Weather API (no key required)
- Custom CSS (no frameworks)

## Files

```
src/
├── App.tsx                    - Main component
├── App.css                    - Main styles
├── components/
│   ├── CreateDraftModal.tsx   - Draft creation modal
│   ├── CreateDraftModal.css
│   ├── Toast.tsx              - Toast notifications
│   └── Toast.css
├── lib/
│   └── gbpApi.ts              - GBP API client
└── types/
    └── index.ts               - TypeScript types
```
