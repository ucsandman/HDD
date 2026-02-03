# Weather Content → GBP Post Scheduler Integration

## Overview

Weather Content can now create draft posts directly in GBP Post Scheduler. When a weather-based content suggestion is generated, users can click "Create GBP Draft" to send it to the post scheduler for review and scheduling.

## Setup

### 1. Configure GBP Post Scheduler

First, add the external API key to GBP Post Scheduler:

```bash
cd C:\Projects\HDD\hdd-gbp-poster
```

Edit `.env` and add:
```
EXTERNAL_API_KEY=your-secure-api-key-here
```

Generate a secure API key:
```bash
openssl rand -hex 32
```

### 2. Configure Weather Content

Create `.env` file in Weather Content:

```bash
cd C:\Projects\HDD\hdd-weather-content
cp .env.example .env
```

Edit `.env`:
```
VITE_GBP_POSTER_URL=http://localhost:3000
VITE_GBP_POSTER_API_KEY=your-secure-api-key-here
VITE_GBP_FRANCHISE_ID=your-franchise-uuid
```

**Important:** Use the same API key from step 1.

### 3. Get Franchise ID

To get your franchise ID, run GBP Post Scheduler and check the database:

```bash
cd C:\Projects\HDD\hdd-gbp-poster
npm run dev
```

Then in another terminal:
```bash
npx prisma studio
```

Open the `franchises` table and copy the `id` field (UUID format).

### 4. Start Both Applications

Terminal 1 - GBP Post Scheduler:
```bash
cd C:\Projects\HDD\hdd-gbp-poster
npm run dev
# Runs on http://localhost:3000
```

Terminal 2 - Weather Content:
```bash
cd C:\Projects\HDD\hdd-weather-content
npm run dev
# Runs on http://localhost:5177
```

## Usage

1. Open Weather Content at http://localhost:5177
2. Weather data loads automatically for Cincinnati
3. Content suggestions appear based on weather conditions
4. For GBP-type suggestions, click **"Create GBP Draft"**
5. Review/edit the content in the modal
6. Click **"Create Draft"**
7. A new browser tab opens with the draft post in GBP Post Scheduler
8. Edit, schedule, and publish from there

## Features

### Weather Content Side
- **Create GBP Draft button** - Only shown on GBP-type suggestions
- **Modal editor** - Review and edit content before sending
- **Success toast** - Confirms creation and opens edit page
- **Error handling** - Clear error messages if API fails
- **Configuration check** - Warns if .env not configured

### GBP Post Scheduler Side
- **External API endpoint** - `/api/external/create-draft`
- **API key authentication** - Validates requests
- **Franchise isolation** - Each franchise can only create their own drafts
- **Draft creation** - Posts created with status "draft"
- **Metadata tracking** - Records source as "weather-content"

## API Details

### Endpoint
```
POST /api/external/create-draft
```

### Headers
```
Content-Type: application/json
x-api-key: your-api-key
x-franchise-id: franchise-uuid
```

### Request Body
```json
{
  "body": "Post content here...",
  "title": "Optional title",
  "postType": "seasonal",
  "suggestedDate": "2025-01-15T14:00:00Z",
  "source": "weather-content"
}
```

### Response
```json
{
  "success": true,
  "postId": "uuid",
  "message": "Draft created successfully",
  "editUrl": "/posts/{postId}"
}
```

## Security

- **API Key Authentication** - All requests require valid API key
- **Franchise Validation** - Franchise ID must exist in database
- **Character Limits** - Body limited to 1500 characters (GBP limit)
- **HTTPS** - Use HTTPS in production
- **Environment Variables** - Never commit `.env` files

## Troubleshooting

### "GBP integration not configured"
- Check `.env` exists in `hdd-weather-content/`
- Verify all three variables are set: URL, API_KEY, FRANCHISE_ID
- Variable names must start with `VITE_`

### "Unable to connect to GBP Post Scheduler"
- Verify GBP Post Scheduler is running on port 3000
- Check `VITE_GBP_POSTER_URL` matches the running server
- Check firewall/network settings

### "Unauthorized" error
- Verify API keys match in both `.env` files
- Check `EXTERNAL_API_KEY` is set in GBP Post Scheduler
- Ensure no extra spaces or quotes in `.env`

### "Franchise not found"
- Verify franchise UUID is correct
- Check franchise exists in database (use Prisma Studio)
- Ensure UUID format is correct (with hyphens)

## Production Deployment

For production use:

1. **Use HTTPS** - Set `VITE_GBP_POSTER_URL=https://your-domain.com`
2. **Secure API Keys** - Use strong random keys (32+ characters)
3. **Environment Variables** - Set via hosting platform (Vercel, etc.)
4. **Rate Limiting** - Consider adding rate limits to external API
5. **Monitoring** - Log external API usage

## Files Changed

### New Files (GBP Post Scheduler)
- `app/api/external/create-draft/route.ts` - External API endpoint

### New Files (Weather Content)
- `src/lib/gbpApi.ts` - API client
- `src/components/CreateDraftModal.tsx` - Draft creation modal
- `src/components/CreateDraftModal.css` - Modal styles
- `src/components/Toast.tsx` - Toast notifications
- `src/components/Toast.css` - Toast styles
- `src/types/index.ts` - TypeScript types
- `.env.example` - Environment template
- `INTEGRATION.md` - This file

### Modified Files (Weather Content)
- `src/App.tsx` - Added modal/toast/integration logic
- `src/App.css` - Added button styles and config warning

### Modified Files (GBP Post Scheduler)
- `.env.example` - Added `EXTERNAL_API_KEY`

## Architecture

```
┌─────────────────────┐
│  Weather Content    │
│  (React/Vite)       │
│  localhost:5177     │
└──────────┬──────────┘
           │
           │ POST /api/external/create-draft
           │ Headers: x-api-key, x-franchise-id
           │
           ▼
┌─────────────────────┐
│ GBP Post Scheduler  │
│  (Next.js)          │
│  localhost:3000     │
└──────────┬──────────┘
           │
           │ CREATE draft post
           │
           ▼
┌─────────────────────┐
│  Neon PostgreSQL    │
│  (Database)         │
└─────────────────────┘
```

## Future Enhancements

Potential improvements:
- [ ] Auto-suggest post scheduling based on weather forecast
- [ ] Attach weather data as metadata to posts
- [ ] AI enhancement of weather content before sending
- [ ] Batch create multiple drafts at once
- [ ] Image suggestions based on weather
- [ ] Direct publishing (skip draft state)
