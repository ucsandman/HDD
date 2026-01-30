# HDD GBP Post Scheduler

A web application for Hickory Dickory Decks franchisees to create, review, and automatically publish posts to Google Business Profile.

## Features

- **AI-Powered Drafts**: Generate post content using Claude AI for project showcases, educational content, and seasonal posts
- **Human Review Workflow**: Draft → Review → Approve → Schedule → Publish
- **Image Library**: Upload and manage images for posts
- **Scheduled Publishing**: Automatic posting at configured times via Vercel Cron
- **Multi-User Support**: Admin and editor roles per franchise

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Google Cloud project with Business Profile API enabled
- Resend account for email
- Anthropic API key
- Vercel account (for Blob storage and Cron)

## Setup

1. **Clone and install**
   ```bash
   cd hdd-gbp-poster
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Fill in all required values
   ```

3. **Set up database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000**

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string (pooled) |
| `DATABASE_URL_UNPOOLED` | Direct connection for migrations |
| `NEXTAUTH_SECRET` | Random secret for session encryption |
| `NEXTAUTH_URL` | Application URL (http://localhost:3000 for dev) |
| `RESEND_API_KEY` | Resend API key for magic link emails |
| `EMAIL_FROM` | Sender email address |
| `ANTHROPIC_API_KEY` | Claude API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token |
| `CRON_SECRET` | Secret for authenticating cron endpoints |
| `ENCRYPTION_KEY` | 32-byte hex key for token encryption |

## Generate Secrets

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET and ENCRYPTION_KEY
openssl rand -hex 32
```

## Deployment

Deploy to Vercel:

1. Connect repository to Vercel
2. Add all environment variables
3. Deploy

Cron jobs are configured in `vercel.json` and will run automatically.

## Usage

1. **Login**: Enter your registered email to receive a magic link
2. **Generate Post**: Choose post type and parameters, click "Generate Draft"
3. **Edit**: Modify the generated content, add images
4. **Approve**: Schedule for later or publish immediately
5. **Monitor**: View calendar for scheduled posts

## Project Structure

```
app/
├── (auth)/login/          # Login page
├── (dashboard)/           # Protected dashboard routes
│   ├── page.tsx           # Dashboard home
│   ├── posts/             # Post management
│   ├── images/            # Image library
│   ├── calendar/          # Calendar view
│   └── settings/          # Franchise settings
├── api/                   # API routes
│   ├── auth/              # Auth endpoints
│   ├── posts/             # Post CRUD
│   ├── images/            # Image CRUD
│   ├── generate/          # AI generation
│   └── cron/              # Scheduled tasks
components/
├── ui/                    # Base UI components
└── layout/                # Layout components
lib/
├── auth.ts                # NextAuth config
├── db.ts                  # Prisma client
├── anthropic/             # Claude AI
└── google/                # GBP API
```

## License

Private - Hickory Dickory Decks
