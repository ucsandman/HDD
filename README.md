# HDD Marketing Tools

Marketing, customer feedback, and automation platform for Hickory Dickory Decks franchisees (Cincinnati).

**Quick Links:**
- [Implementation & Testing Guide](IMPLEMENTATION_GUIDE.md)
- [External Services Setup](EXTERNAL_SERVICES_SETUP.md) (for Nathan)
- [Project Status](PROJECT_STATUS.md)

---

## Overview

**11 total tools** organized into three tiers:

| Tier | Tools | Status |
|------|-------|--------|
| Production | Sentiment Router, Review Generator, GBP Post Scheduler, Lead Response | Complete |
| Infrastructure | Dashboard, Quote Calculator | Complete |
| Development | Photo Manager, Referral Tracker, Warranty Tracker, Weather Content, Competitor Monitor | Scaffolded |

---

## Quick Start

### Option 1: Python Launcher (Recommended)

```bash
python launcher.py
```

Interactive menu to launch any tool, group of tools, or all tools at once.

### Option 2: Manual Launch

```bash
# Static tools (no server needed)
# Open in browser: hdd-dashboard/index.html

# React tools
cd hdd-review-generator && npm run dev

# Next.js tools (need environment setup first)
cd hdd-gbp-poster && npm run dev
```

---

## Production Tools

### 1. Sentiment Router

**Path:** `hdd-sentiment-router/`
**Stack:** HTML, CSS, JavaScript (zero dependencies)
**Purpose:** Routes customers based on satisfaction. Happy customers → Google Reviews. Unhappy → private feedback form.

**Features:**
- Two-button sentiment check (Great! / Could be better)
- Private feedback form for unhappy customers
- Redirects happy customers to Google Reviews
- Mobile-first responsive design
- Supports Formspree, mailto, or Google Forms

**Quick Start:**
```bash
# Edit config.js with your franchise settings
# Open index.html in browser
```

---

### 2. Review Request Generator

**Path:** `hdd-review-generator/`
**Stack:** React 19, TypeScript, Tailwind CSS v4, Vite 7
**Purpose:** Generate personalized review request messages (SMS, email, thank you card) from customer details.

**Features:**
- Day 3 SMS, Day 7 Email, Day 14 Thank You Card
- One-click copy to clipboard
- Form validation with inline errors
- Franchisee data persists in localStorage
- SMS character count with segment warnings

**Quick Start:**
```bash
cd hdd-review-generator
npm run dev        # localhost:5173
```

---

### 3. GBP Post Scheduler

**Path:** `hdd-gbp-poster/`
**Stack:** Next.js 14, Prisma, Neon PostgreSQL, NextAuth.js, Claude AI, Google Business Profile API
**Purpose:** Create, review, and auto-publish posts to Google Business Profile.

**Features:**
- AI-powered post generation (project showcases, educational, seasonal)
- Human review workflow (draft → review → approve → schedule → publish)
- Image library with upload and metadata
- Calendar view for scheduled posts
- Google Business Profile OAuth integration
- Multi-user support (admin/editor roles)

**Quick Start:**
```bash
cd hdd-gbp-poster
cp .env.example .env   # Fill in environment variables
npx prisma db push
npx prisma db seed
npm run dev            # localhost:3000
```

**Environment Variables:** See `.env.example` or [External Services Setup](EXTERNAL_SERVICES_SETUP.md)

---

### 4. Lead Response System

**Path:** `hdd-lead-response/`
**Stack:** Next.js 14, Prisma, Neon PostgreSQL, NextAuth.js, Twilio, Resend, Cal.com
**Purpose:** Automated lead follow-up sequences via SMS and email.

**Features:**
- Instant SMS + email on lead creation
- 5-step follow-up sequence (instant, 4hr, 24hr, 72hr, 7 days)
- Twilio webhook: detects replies, pauses sequence
- Cal.com webhook: detects bookings, marks lead complete
- Dashboard for lead management
- Sequence template editor

**Quick Start:**
```bash
cd hdd-lead-response
npm install            # Required - not yet installed
cp .env.example .env   # Fill in environment variables
npx prisma db push
npx prisma db seed
npm run dev            # localhost:3000
```

**Environment Variables:** See `.env.example` or [External Services Setup](EXTERNAL_SERVICES_SETUP.md)

---

## Infrastructure Tools

### Dashboard

**Path:** `hdd-dashboard/`
**Stack:** HTML, CSS, JavaScript
**Purpose:** Central hub showing all tools with status, launch buttons, and setup info.

**Quick Start:**
```bash
# Open hdd-dashboard/index.html in browser
```

---

### Quote Calculator

**Path:** `hdd-quote-calculator/`
**Stack:** HTML, CSS, JavaScript
**Purpose:** Customer-facing deck estimate tool with dimensions, materials, and features.

**Features:**
- Dimension input with live square footage calculation
- Material selection (Trex, TimberTech grades)
- Feature add-ons (railing, stairs, lighting, pergola)
- Height adjustment pricing
- Instant low-high range estimates

**Quick Start:**
```bash
# Edit config.js to adjust pricing for your market
# Open index.html in browser
```

---

## Development Tools (Scaffolded)

These React/Vite projects have basic scaffolding but need feature implementation:

| Tool | Path | Port | Purpose |
|------|------|------|---------|
| Photo Manager | `hdd-photo-manager/` | 5174 | Organize before/after project photos |
| Referral Tracker | `hdd-referral-tracker/` | 5175 | Track leads and referral codes |
| Warranty Tracker | `hdd-warranty-tracker/` | 5176 | Track warranties, schedule checkups |
| Weather Content | `hdd-weather-content/` | 5177 | Weather-based content suggestions |
| Competitor Monitor | `hdd-competitor-monitor/` | 5178 | Track competitor Google ratings |

**Stack (all):** React 19, TypeScript, Tailwind CSS v4, Vite 7

**Quick Start (any):**
```bash
cd hdd-[tool-name]
npm install
npm run dev
```

---

## Project Structure

```
HDD/
├── launcher.py                    # Python CLI to launch all tools
├── launch.bat                     # Windows batch launcher
├── CLAUDE.md                      # Project architecture for AI
├── README.md                      # This file
├── PROJECT_STATUS.md              # Detailed completion status
├── IMPLEMENTATION_GUIDE.md        # Testing checklists
├── EXTERNAL_SERVICES_SETUP.md     # Guide for Nathan (external accounts)
│
├── hdd-dashboard/                 # Central hub (static)
├── hdd-sentiment-router/          # Feedback routing (static)
├── hdd-quote-calculator/          # Deck estimates (static)
├── hdd-review-generator/          # Message generator (React/Vite)
├── hdd-gbp-poster/                # GBP post scheduler (Next.js)
├── hdd-lead-response/             # Lead automation (Next.js)
│
├── hdd-photo-manager/             # Photo organization (React/Vite)
├── hdd-referral-tracker/          # Referral tracking (React/Vite)
├── hdd-warranty-tracker/          # Warranty management (React/Vite)
├── hdd-weather-content/           # Weather suggestions (React/Vite)
├── hdd-competitor-monitor/        # Competition tracking (React/Vite)
│
└── Spec files (root)
    ├── hdd-sentiment-router-spec.md
    ├── hdd-review-generator-spec.md
    ├── hdd-gbp-poster-spec.md
    └── hdd-lead-response-spec.md
```

---

## Deployment

| Tool Type | Hosting | Backend |
|-----------|---------|---------|
| Static (Dashboard, Quote, Sentiment) | Any static host, GitHub Pages | None |
| React/Vite (Review Generator, etc.) | Any static host (deploy `dist/`) | None |
| Next.js (GBP Poster, Lead Response) | Vercel (recommended) | Neon PostgreSQL |

### Deploy Static Tools

Drag folder to Vercel/Netlify, or upload via FTP.

### Deploy React Tools

```bash
npm run build
# Deploy dist/ folder to any static host
```

### Deploy Next.js Tools

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Configure cron jobs in `vercel.json`

---

## External Services Required

### For GBP Post Scheduler

| Service | Purpose | Cost |
|---------|---------|------|
| Neon | PostgreSQL database | Free tier |
| Resend | Magic link emails | Free 3k/month |
| Anthropic | Claude AI for content | ~$10-30/month |
| Google Cloud | GBP API OAuth | Free |
| Vercel Blob | Image storage | Free tier |

### For Lead Response

| Service | Purpose | Cost |
|---------|---------|------|
| Neon | PostgreSQL database | Free tier |
| Resend | Email delivery | Free 3k/month |
| Twilio | SMS messaging | ~$5-15/month |
| Cal.com | Booking webhooks | Free |

See [EXTERNAL_SERVICES_SETUP.md](EXTERNAL_SERVICES_SETUP.md) for step-by-step setup instructions.

---

## For Franchisees

**Review Generator:** Go to the app URL, fill in customer details, click Generate, copy the messages you need. SMS goes out Day 3, email Day 7, thank you card Day 14.

**Sentiment Router:** After completing a project, send customers this link instead of your Google Review link directly. Happy customers still get to Google Reviews. Unhappy customers send feedback to you privately.

**Quote Calculator:** Embed on your website or share directly. Customers get instant estimates, then request a full consultation.

**GBP Post Scheduler:** Log in with your email, generate AI drafts or write posts manually, attach images, schedule for publishing. Posts automatically publish to your Google Business Profile.

**Lead Response:** Leads come in via webhook from your website. System sends instant SMS + email, then follows up automatically until the lead responds or books.

---

## Technology Summary

| Component | Technology |
|-----------|------------|
| Static Sites | HTML, CSS, JavaScript |
| React Apps | React 19, TypeScript, Tailwind CSS v4, Vite 7 |
| Full-Stack Apps | Next.js 14 (App Router), Prisma ORM |
| Database | Neon PostgreSQL |
| Auth | NextAuth.js v5 (email magic links) |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| SMS | Twilio |
| Email | Resend |
| Scheduling | Vercel Cron |
| Storage | Vercel Blob |

---

## Commands Reference

```bash
# Run all commands from project root

# Dashboard (static)
start hdd-dashboard/index.html

# Sentiment Router (static)
start hdd-sentiment-router/index.html

# Quote Calculator (static)
start hdd-quote-calculator/index.html

# Review Generator (Vite)
cd hdd-review-generator && npm run dev

# GBP Post Scheduler (Next.js)
cd hdd-gbp-poster && npm run dev

# Lead Response (Next.js)
cd hdd-lead-response && npm install && npm run dev

# Build React for production
cd hdd-review-generator && npm run build

# Database operations
cd hdd-gbp-poster && npx prisma db push
cd hdd-gbp-poster && npx prisma db seed
cd hdd-gbp-poster && npx prisma studio  # Database GUI

# Linting
cd hdd-review-generator && npm run lint
```

---

*Built for Hickory Dickory Decks Cincinnati (Nathan & Brinton Ricke)*
