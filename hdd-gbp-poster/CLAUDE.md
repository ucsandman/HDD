# HDD Google Business Profile Post Scheduler

## Overview

Full-stack Next.js 14 application for Hickory Dickory Decks franchisees to create, review, and automatically publish posts to Google Business Profile. Features AI-powered draft generation, human review workflow, image management, and scheduled publishing.

## Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS v4 |
| UI Components | Custom shadcn/ui style components |
| Database | Neon PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 beta with email magic links (Resend) |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Publishing | Google Business Profile API (OAuth 2.0) |
| Storage | Vercel Blob (images) |
| Scheduling | Vercel Cron Jobs |
| Hosting | Vercel |

## Key Files

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema (6 tables) |
| `lib/auth.ts` | NextAuth configuration with Resend provider |
| `lib/db.ts` | Prisma client singleton |
| `lib/anthropic/prompts.ts` | AI prompt templates for post types |
| `lib/google/client.ts` | Google OAuth and GBP API integration |
| `lib/crypto.ts` | AES-256-GCM encryption for tokens |
| `middleware.ts` | Route protection and cron authentication |

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed Cincinnati franchise

# Demo mode
npm run demo         # One-command demo setup and start
npm run demo:reset   # Reset demo data to fresh state
```

## Demo Mode

Demo mode allows running the full application locally without any external services (no database, no API keys, no Google OAuth). Perfect for:
- Sales demos to franchise owners
- Development without credentials
- Testing the UI/UX flow

### Quick Start

```bash
npm run demo
```

This single command:
1. Backs up existing `.env` and `schema.prisma`
2. Configures SQLite database (no PostgreSQL needed)
3. Seeds realistic Cincinnati franchise data
4. Starts the dev server with auto-authentication

### Demo Features

| Feature | Behavior |
|---------|----------|
| Authentication | Auto-logged in as Nathan Ricke (admin) |
| AI Generation | Returns sample Cincinnati-focused content |
| Publishing | Simulates GBP API with mock URLs |
| Images | Saved locally to `public/demo-uploads/` |
| Google Connection | Shows "Connected" status |

### Demo Data

- **1 Franchise**: Hickory Dickory Decks - Cincinnati
- **1 User**: Nathan Ricke (admin)
- **6 Images**: Placeholder images for various project types
- **8 Posts**: Across all statuses (draft, pending, approved, scheduled, published)
- **3 Queue Entries**: For dashboard stats

### Restore Production Mode

```bash
copy .env.backup .env
copy prisma/schema.prisma.backup prisma/schema.prisma
npx prisma generate
```

### Demo Files

| File | Purpose |
|------|---------|
| `lib/demo.ts` | Demo mode utilities and constants |
| `lib/anthropic/demo-posts.ts` | Sample post content (12 posts) |
| `prisma/schema.demo.prisma` | SQLite schema |
| `prisma/seed-demo.ts` | Demo data seeder |
| `.env.demo` | Minimal demo configuration |
| `scripts/demo-setup.js` | Setup automation |
| `scripts/demo-reset.js` | Reset automation |

## Database Schema

Six tables: `franchises`, `users`, `images`, `posts`, `post_images`, `generation_queue`

Posts have status workflow: draft → pending_review → approved → scheduled → published

## Authentication Flow

1. Magic link via Resend to pre-registered email
2. Session includes userId, franchiseId, role
3. Role-based access: admin (full), editor (limited)

## Post Generation

Three post types with Claude AI:
- **Project Showcase**: Completed deck projects
- **Educational**: 20 predefined topics about decking
- **Seasonal**: Content appropriate for current season

## Cron Jobs

- `/api/cron/generate-drafts`: Sundays 5:00 UTC (generates weekly drafts)
- `/api/cron/publish-scheduled`: Every 15 minutes (publishes scheduled posts)

Both require `Authorization: Bearer {CRON_SECRET}` header.

## Environment Variables

See `.env.example` for required variables:
- Database: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`
- Auth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`
- AI: `ANTHROPIC_API_KEY`
- Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Storage: `BLOB_READ_WRITE_TOKEN`
- Security: `CRON_SECRET`, `ENCRYPTION_KEY`

## Security

- Google tokens encrypted with AES-256-GCM at rest
- Franchise isolation on all queries
- Rate limiting on AI generation (10/hour/user)
- Cron endpoints protected by secret
