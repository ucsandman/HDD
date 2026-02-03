# HDD Photo Manager

Project photo organization tool for Hickory Dickory Decks Cincinnati.

## Features

- Upload and organize before/after project photos
- Cloud storage via Vercel Blob (no localStorage limits)
- Filter projects by type, material, and neighborhood
- Project metadata: customer name, date, type, material, notes
- Automatic migration from base64 to cloud storage
- Delete photos from cloud when removing projects

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS v4
- Vercel Blob Storage

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Get Vercel Blob token:
   - Go to https://vercel.com/dashboard/stores
   - Create or select a Blob store
   - Copy the `BLOB_READ_WRITE_TOKEN`
   - Add to `.env`

4. Start dev server:
```bash
npm run dev
```

## Commands

```bash
npm run dev      # Start dev server (port 5174)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Storage

- **Cloud**: Photos stored in Vercel Blob
- **Local**: Project metadata (name, date, type, etc.) in localStorage
- **Migration**: Existing base64 photos auto-migrated on first load

## Deployment

This app includes Vercel serverless functions in `/api`:
- `/api/upload.ts` - Upload photos to Blob
- `/api/delete.ts` - Delete photos from Blob

Deploy to Vercel for full functionality. Add `BLOB_READ_WRITE_TOKEN` to environment variables.

## Project Data

Projects include:
- Customer name/address
- Completion date
- Project type (Deck, Pergola, etc.)
- Material (Trex Select, TimberTech, etc.)
- Neighborhood
- Before/after photos (cloud URLs)
- Notes

## Security

- `.env` never committed (listed in `.gitignore`)
- Blob storage uses public access (safe for customer photos)
- Photos organized in `/hdd-photos` folder with timestamps
