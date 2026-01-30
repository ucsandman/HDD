# HDD Marketing Tools

## Overview

Marketing, customer feedback, and automation tools for Hickory Dickory Decks franchisees. Four projects:

1. **Sentiment Router** - Static HTML page for routing customer feedback
2. **Review Generator** - React app for generating review request messages
3. **GBP Post Scheduler** - Next.js app for AI-powered Google Business Profile posts
4. **Lead Response** - Next.js app for automated lead follow-up sequences

## Architecture

Projects 1-2 are frontend-only. Projects 3-4 are full-stack Next.js with Neon PostgreSQL.

---

## Project 1: Sentiment Router (`hdd-sentiment-router/`)

### Purpose
Intercepts customer feedback to protect public Google ratings. Happy customers → Google Reviews, unhappy → private feedback form.

### Stack
- Pure HTML, CSS, JavaScript
- No build step required
- No external dependencies

### Key Files

| File | Purpose |
|------|---------|
| `index.html` | Sentiment check page with Great!/Could be better buttons |
| `feedback.html` | Private feedback form with validation |
| `thank-you.html` | Confirmation page after feedback submission |
| `styles.css` | Mobile-first responsive styling |
| `script.js` | Routing logic, form validation, analytics hooks |
| `config.js` | Franchise-specific settings (Google Review URL, email, colors) |

### Configuration

Edit `config.js` to customize:
- `googleReviewUrl` - Google Business review link (required)
- `feedbackEmail` - Fallback email for mailto
- `formspreeId` - Formspree form ID for reliable delivery
- `websiteUrl` - Return link on thank you page
- `colors` - Custom brand colors

### Form Submission Options
1. **Formspree** (recommended) - Set `formspreeId` in config
2. **mailto** fallback - Set `feedbackEmail` in config
3. **Google Forms** - Replace form with embed code

---

## Project 2: Review Generator (`hdd-review-generator/`)

### Purpose
Generate personalized review request messages (SMS, email, thank you card) from customer/project details.

### Stack
- React 19 with TypeScript
- Tailwind CSS v4 via @tailwindcss/postcss
- Vite 7 build tool

### Key Files

| File | Purpose |
|------|---------|
| `src/utils/generateMessages.ts` | Message template logic with SMS fallback for length |
| `src/components/InputForm.tsx` | Form with validation and localStorage persistence |
| `src/components/MessageCard.tsx` | Reusable card with copy buttons and character count |
| `src/hooks/useCopyToClipboard.ts` | Clipboard API wrapper with error handling |
| `src/types/index.ts` | FormData, GeneratedMessages interfaces, PROJECT_TYPES |

### Commands

```bash
npm run dev     # Development server at localhost:5173
npm run build   # Production build to dist/
npm run lint    # ESLint check
npm run preview # Preview production build
```

### Message Templates

Three touchpoints from single form submission:

1. **Day 3: SMS** (max 320 chars) - Short with review link
2. **Day 7: Email** - Subject line + body with city references
3. **Day 14: Thank You Card** - Full name, no link (physical card)

### Form Persistence

Franchisee name and Google Review link saved to localStorage.

---

## Project 3: GBP Post Scheduler (`hdd-gbp-poster/`)

### Purpose
Create, review, and automatically publish posts to Google Business Profile. Features AI-powered draft generation, human review workflow, and scheduled publishing.

### Stack
- Next.js 14 (App Router) with TypeScript
- Neon PostgreSQL + Prisma ORM
- NextAuth.js v5 (email magic links via Resend)
- Anthropic Claude API for AI generation
- Google Business Profile API
- Vercel Blob for image storage
- Vercel Cron for scheduling

### Key Features
- AI-generated post drafts (project showcase, educational, seasonal)
- Human review workflow (draft → pending_review → approved → scheduled → published)
- Image library management
- Calendar view for scheduling
- Franchise settings and Google OAuth integration

### Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed Cincinnati franchise
```

---

## Project 4: Lead Response (`hdd-lead-response/`)

### Purpose
Automated lead response system. Sends instant SMS/email when leads arrive, then follows up automatically until lead responds or books a consultation.

### Stack
- Next.js 14 (App Router) with TypeScript
- Neon PostgreSQL + Prisma ORM
- NextAuth.js v5 (email magic links via Resend)
- Twilio for SMS
- Resend for email
- Cal.com for booking webhooks
- Vercel Cron (every 5 minutes)

### Key Features
- Instant SMS + email response on lead creation
- 5-step follow-up sequence (instant, 4hr, 24hr, 72hr, 7 days)
- Twilio webhook: detects replies, pauses sequence
- Cal.com webhook: detects bookings, marks lead complete
- Dashboard for lead management and message history
- Sequence template editor

### Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed default sequence + settings
```

---

## Backend Projects

Projects 3 and 4 require environment variables. See `.env.example` in each project directory.
