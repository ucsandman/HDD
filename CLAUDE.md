# HDD Marketing Tools

Marketing, customer feedback, and automation platform for Hickory Dickory Decks franchisees.

## Overview

**11 total tools** in 3 categories:
- **4 Production Tools**: Sentiment Router, Review Generator, GBP Post Scheduler, Lead Response
- **2 Infrastructure Tools**: Dashboard, Quote Calculator
- **5 Development Tools**: Photo Manager, Referral Tracker, Warranty Tracker, Weather Content, Competitor Monitor

**Target Franchise**: Cincinnati (Nathan & Brinton Ricke)

---

## Architecture Tiers

### Tier 1: Static HTML (No Build)

| Project | Path | Purpose |
|---------|------|---------|
| Dashboard | `hdd-dashboard/` | Central hub for all tools |
| Sentiment Router | `hdd-sentiment-router/` | Routes feedback by satisfaction |
| Quote Calculator | `hdd-quote-calculator/` | Customer-facing deck estimates |

**Stack**: HTML, CSS, JavaScript. Zero dependencies. Open `index.html` in browser.

### Tier 2: React/Vite (Frontend Only)

| Project | Path | Port | Purpose |
|---------|------|------|---------|
| Review Generator | `hdd-review-generator/` | 5173 | Generate review request messages |
| Photo Manager | `hdd-photo-manager/` | 5174 | Organize project photos |
| Referral Tracker | `hdd-referral-tracker/` | 5175 | Track leads and referral codes |
| Warranty Tracker | `hdd-warranty-tracker/` | 5176 | Track warranties |
| Weather Content | `hdd-weather-content/` | 5177 | Weather-based suggestions |
| Competitor Monitor | `hdd-competitor-monitor/` | 5178 | Track competitor ratings |

**Stack**: React 19, TypeScript, Tailwind CSS v4, Vite 7

**Commands**:
```bash
npm run dev      # Dev server
npm run build    # Production build to dist/
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Tier 3: Next.js Full-Stack

| Project | Path | Port | Purpose |
|---------|------|------|---------|
| GBP Post Scheduler | `hdd-gbp-poster/` | 3000 | AI-powered GBP posts |
| Lead Response | `hdd-lead-response/` | 3001 | Automated lead follow-up |

**Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS v4, Prisma ORM, Neon PostgreSQL, NextAuth.js v5

**Commands**:
```bash
npm run dev           # Dev server
npm run build         # Production build
npx prisma db push    # Push schema to database
npx prisma db seed    # Seed initial data
npx prisma generate   # Generate Prisma client
npx prisma studio     # Database GUI
```

---

## Project Details

### 1. Sentiment Router (`hdd-sentiment-router/`)

Routes customer feedback to protect public Google ratings.

| File | Purpose |
|------|---------|
| `index.html` | Sentiment check (Great!/Could be better buttons) |
| `feedback.html` | Private feedback form |
| `thank-you.html` | Confirmation page |
| `styles.css` | Mobile-first responsive styling |
| `script.js` | Routing logic, form validation |
| `config.js` | Franchise settings (Google URL, email, colors) |

**Configuration** (`config.js`):
- `googleReviewUrl` - Google Business review link (required)
- `feedbackEmail` - Fallback email for mailto
- `formspreeId` - Formspree form ID
- `websiteUrl` - Return link on thank you page

---

### 2. Review Generator (`hdd-review-generator/`)

Generates personalized review request messages from customer details.

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main component with state |
| `src/components/InputForm.tsx` | Form with validation + localStorage |
| `src/components/MessageCard.tsx` | Reusable card with copy button |
| `src/components/OutputSection.tsx` | Messages container |
| `src/utils/generateMessages.ts` | Message template logic |
| `src/hooks/useCopyToClipboard.ts` | Clipboard API wrapper |
| `src/types/index.ts` | TypeScript interfaces |

**Message Templates**:
1. **Day 3 SMS** (max 320 chars) - Short with review link
2. **Day 7 Email** - Subject line + body with city references
3. **Day 14 Thank You Card** - Full name, no link (physical card)

---

### 3. GBP Post Scheduler (`hdd-gbp-poster/`)

AI-powered Google Business Profile post creation with human review workflow.

**Database Schema** (6 tables):
```
franchises     - Multi-franchise support, Google tokens, settings
users          - Auth with roles (admin/editor)
images         - Image library with metadata
posts          - Post content + status workflow
post_images    - Many-to-many relationship
generation_queue - AI draft generation queue
```

**Post Status Workflow**: `draft` → `pending_review` → `approved` → `scheduled` → `published`

**Post Types**:
- Project Showcase (completed projects)
- Educational (20 predefined topics)
- Seasonal (time-appropriate content)

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `lib/auth.ts` | NextAuth + Resend magic links |
| `lib/db.ts` | Prisma client singleton |
| `lib/anthropic/prompts.ts` | AI prompt templates |
| `lib/google/client.ts` | GBP API integration |
| `lib/crypto.ts` | AES-256-GCM token encryption |
| `middleware.ts` | Route protection, cron auth |

**Routes**:
- `/login` - Magic link auth
- `/` - Dashboard with stats
- `/posts` - Posts list with filters
- `/posts/new` - Create/generate post
- `/posts/[id]` - Edit post
- `/images` - Image library
- `/calendar` - Calendar view
- `/settings` - Franchise settings

**API Routes**:
- `/api/auth/*` - NextAuth handlers
- `/api/posts/*` - CRUD + approve/publish
- `/api/generate` - AI draft generation
- `/api/images/*` - Upload/manage
- `/api/franchise` - Settings
- `/api/cron/generate-drafts` - Weekly (Sundays 5:00 UTC)
- `/api/cron/publish-scheduled` - Every 15 minutes

**Environment Variables** (12):
```
DATABASE_URL, DATABASE_URL_UNPOOLED
NEXTAUTH_SECRET, NEXTAUTH_URL
RESEND_API_KEY, EMAIL_FROM
ANTHROPIC_API_KEY
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
BLOB_READ_WRITE_TOKEN
CRON_SECRET, ENCRYPTION_KEY
```

---

### 4. Lead Response (`hdd-lead-response/`)

Automated lead follow-up via SMS and email.

**Database Schema** (5 main + 3 NextAuth tables):
```
users          - Auth with roles
leads          - Contact info, status, sequence tracking
messages       - Communication log (SMS/email, in/out)
sequence_steps - Configurable follow-up templates
settings       - Key-value business config
```

**Lead Status Workflow**: `new` → `contacted` → `engaged` → `qualified` → `booked` → `won/lost`

**Default Sequence** (5 steps):
1. Instant - SMS + Email on creation
2. 4 hours - Follow-up SMS
3. 24 hours - Follow-up email
4. 72 hours - Final SMS
5. 7 days - Closing email

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema |
| `lib/auth.ts` | NextAuth + Resend |
| `lib/db.ts` | Prisma client |
| `lib/phone.ts` | E.164 normalization |
| `lib/templates.ts` | Message rendering |
| `lib/sequence.ts` | Sequence engine |
| `lib/twilio/client.ts` | SMS client |
| `lib/resend/client.ts` | Email client |

**Routes**:
- `/login` - Magic link auth
- `/` - Dashboard with stats
- `/leads` - Lead list
- `/leads/new` - Manual entry
- `/leads/[id]` - Detail + messages
- `/messages` - Inbox
- `/sequences` - Template editor
- `/settings` - Business settings

**Webhooks**:
- `POST /api/leads/webhook` - External lead intake (HMAC verified)
- `POST /api/webhooks/twilio` - Inbound SMS (signature verified)
- `POST /api/webhooks/cal` - Booking notifications

**Environment Variables** (13):
```
DATABASE_URL, DATABASE_URL_UNPOOLED
NEXTAUTH_SECRET, NEXTAUTH_URL
RESEND_API_KEY, EMAIL_FROM
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
CAL_BOOKING_LINK, CAL_WEBHOOK_SECRET
CRON_SECRET, WEBHOOK_SECRET
```

---

### 5. Quote Calculator (`hdd-quote-calculator/`)

Customer-facing deck estimate tool.

| File | Purpose |
|------|---------|
| `index.html` | Main calculator page |
| `styles.css` | All styling |
| `config.js` | Pricing configuration |
| `calculator.js` | Calculation logic |

**Pricing Model**:
```
Total = (SqFt × BasePrice × MaterialMultiplier) + HeightAdjustment + Features
```

---

### 6. Dashboard (`hdd-dashboard/`)

Central hub for all tools.

| File | Purpose |
|------|---------|
| `index.html` | Dashboard page with tool cards |
| `styles.css` | Responsive grid styling |
| `config.js` | Tool definitions and status |

---

## Development Tools (Scaffolded)

These Vite/React projects have basic scaffolding but need feature implementation:

| Tool | Purpose | Status |
|------|---------|--------|
| Photo Manager | Organize before/after photos | Scaffolded |
| Referral Tracker | Track leads and referral codes | Scaffolded |
| Warranty Tracker | Track warranties, schedule checkups | Scaffolded |
| Weather Content | Weather-based content suggestions | Scaffolded |
| Competitor Monitor | Track competitor Google ratings | Scaffolded |

All share: React 19, TypeScript, Tailwind CSS v4, Vite 7

---

## Launcher Tools

### launcher.py

Python CLI to launch all tools interactively.

```bash
python launcher.py
```

Features:
- 11 tools organized by type (Static/Vite/Next.js)
- Launch individual, groups, or all
- Auto npm install if needed
- Process tracking
- Environment check

### launch.bat

Windows batch file launcher (minimal).

---

## External Services

### GBP Post Scheduler

| Service | Purpose |
|---------|---------|
| Neon | PostgreSQL database |
| Resend | Magic link emails |
| Anthropic | Claude AI for content |
| Google Cloud | GBP API OAuth |
| Vercel Blob | Image storage |
| Vercel Cron | Scheduled publishing |

### Lead Response

| Service | Purpose |
|---------|---------|
| Neon | PostgreSQL database |
| Resend | Email delivery |
| Twilio | SMS messaging |
| Cal.com | Booking webhooks |
| Vercel Cron | Follow-up processing |

---

## Current Status

| Tool | Status | Notes |
|------|--------|-------|
| Dashboard | Complete | Static HTML |
| Sentiment Router | Complete | Static HTML |
| Quote Calculator | Complete | Static HTML |
| Review Generator | Complete | Dependencies installed, dist/ exists |
| GBP Post Scheduler | Complete | Needs env setup |
| Lead Response | Complete | Needs `npm install` + env setup |
| Photo Manager | Scaffolded | App.tsx empty |
| Referral Tracker | Scaffolded | App.tsx empty |
| Warranty Tracker | Scaffolded | App.tsx empty |
| Weather Content | Scaffolded | App.tsx empty |
| Competitor Monitor | Scaffolded | App.tsx empty |

---

## Quick Reference

```bash
# Static tools (open in browser)
hdd-dashboard/index.html
hdd-sentiment-router/index.html
hdd-quote-calculator/index.html

# React tools
cd hdd-review-generator && npm run dev  # :5173

# Next.js tools
cd hdd-gbp-poster && npm run dev        # :3000
cd hdd-lead-response && npm run dev     # :3001

# Database
cd hdd-gbp-poster && npx prisma studio

# Python launcher
python launcher.py
```

---

## Security Notes

- Google tokens encrypted with AES-256-GCM at rest
- Franchise isolation on all queries
- Rate limiting on AI generation (10/hour/user)
- Cron endpoints protected by secret
- Webhook endpoints use HMAC/signature verification
- No secrets committed (all use .env)
