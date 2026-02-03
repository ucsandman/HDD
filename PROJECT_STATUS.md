# HDD Marketing Tools - Project Status

**Generated:** 2026-02-03
**Total Projects:** 11 (6 complete, 1 implemented, 4 scaffolded)
**Overall Status:** Production tools ready, supplementary tools in progress

---

## Summary

| Category | Tools | Status |
|----------|-------|--------|
| Production | Sentiment Router, Review Generator, GBP Post Scheduler, Lead Response | 4/4 Complete |
| Infrastructure | Dashboard, Quote Calculator | 2/2 Complete |
| Development | Photo Manager, Referral Tracker, Warranty Tracker, Weather Content, Competitor Monitor | 1/5 Implemented |

---

## File Structure Overview

```
HDD/
├── launcher.py               # Python CLI launcher
├── launch.bat                # Windows batch launcher
├── README.md                 # Main documentation
├── CLAUDE.md                 # Architecture for AI
├── PROJECT_STATUS.md         # This file
├── IMPLEMENTATION_GUIDE.md   # Testing checklists
├── EXTERNAL_SERVICES_SETUP.md # Nathan's setup guide
│
├── hdd-dashboard/            # Dashboard: Static HTML (COMPLETE)
│   ├── index.html
│   ├── styles.css
│   └── config.js
│
├── hdd-sentiment-router/     # Tool 1: Static HTML (COMPLETE)
│   ├── index.html
│   ├── feedback.html
│   ├── thank-you.html
│   ├── styles.css
│   ├── script.js
│   └── config.js
│
├── hdd-quote-calculator/     # Tool 2: Static HTML (COMPLETE)
│   ├── index.html
│   ├── styles.css
│   ├── config.js
│   └── calculator.js
│
├── hdd-review-generator/     # Tool 3: React/Vite (COMPLETE)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── utils/
│   │   ├── hooks/
│   │   └── types/
│   ├── dist/                 # Production build exists
│   └── node_modules/         # Dependencies installed
│
├── hdd-gbp-poster/           # Tool 4: Next.js (COMPLETE - needs env)
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   └── api/
│   ├── lib/
│   ├── prisma/schema.prisma
│   ├── node_modules/         # Dependencies installed
│   └── .env.example
│
├── hdd-lead-response/        # Tool 5: Next.js (COMPLETE - needs npm install + env)
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   └── api/
│   ├── lib/
│   ├── prisma/schema.prisma
│   └── .env.example
│
├── hdd-photo-manager/        # Tool 6: React/Vite (SCAFFOLDED)
│   ├── src/App.tsx           # Placeholder content
│   └── node_modules/         # Dependencies installed
│
├── hdd-referral-tracker/     # Tool 7: React/Vite (SCAFFOLDED)
│   ├── src/App.tsx           # Placeholder content
│   └── node_modules/         # Dependencies installed
│
├── hdd-warranty-tracker/     # Tool 8: React/Vite (SCAFFOLDED)
│   ├── src/App.tsx           # Placeholder content
│   └── node_modules/         # Dependencies installed
│
├── hdd-weather-content/      # Tool 9: React/Vite (SCAFFOLDED)
│   ├── src/App.tsx           # Placeholder content
│   └── node_modules/         # Dependencies installed
│
├── hdd-competitor-monitor/   # Tool 10: React/Vite (SCAFFOLDED)
│   ├── src/App.tsx           # Placeholder content
│   └── node_modules/         # Dependencies installed
│
└── Spec files
    ├── hdd-sentiment-router-spec.md
    ├── hdd-review-generator-spec.md
    ├── hdd-gbp-poster-spec.md
    └── hdd-lead-response-spec.md
```

---

## Production Tools

### Tool 1: Sentiment Router

**Path:** `hdd-sentiment-router/`
**Stack:** Pure HTML, CSS, JavaScript (no build step)
**Status:** ✅ COMPLETE

| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Sentiment check (Great!/Could be better) | ✅ Complete |
| `feedback.html` | Private feedback form | ✅ Complete |
| `thank-you.html` | Confirmation page | ✅ Complete |
| `styles.css` | Mobile-first responsive styling | ✅ Complete |
| `script.js` | Routing logic, validation | ✅ Complete |
| `config.js` | Franchise settings | ✅ Complete (placeholder values) |

**Entry Point:** Open `index.html` in browser
**Dependencies:** None

**Configuration Required:**
```javascript
googleReviewUrl: "https://g.page/r/YOUR-REVIEW-LINK/review"  // REQUIRED
feedbackEmail: "feedback@example.com"
formspreeId: "your-formspree-id"
websiteUrl: "https://www.hickorydickorydecks.com/location"
```

---

### Tool 2: Quote Calculator

**Path:** `hdd-quote-calculator/`
**Stack:** Pure HTML, CSS, JavaScript (no build step)
**Status:** ✅ COMPLETE

| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Calculator page | ✅ Complete |
| `styles.css` | All styling | ✅ Complete |
| `config.js` | Pricing configuration | ✅ Complete |
| `calculator.js` | Calculation logic | ✅ Complete |

**Entry Point:** Open `index.html` in browser
**Dependencies:** None

**Features:**
- Dimension input with live sqft calculation
- Material selection (Trex, TimberTech grades)
- Feature add-ons (railing, stairs, lighting, pergola)
- Height adjustment pricing
- Low-high range estimates

---

### Tool 3: Review Generator

**Path:** `hdd-review-generator/`
**Stack:** React 19, TypeScript, Vite 7, Tailwind CSS v4
**Status:** ✅ COMPLETE

| File | Purpose | Status |
|------|---------|--------|
| `src/App.tsx` | Main app with state | ✅ Complete |
| `src/components/InputForm.tsx` | Form with validation + localStorage | ✅ Complete |
| `src/components/OutputSection.tsx` | Messages container | ✅ Complete |
| `src/components/MessageCard.tsx` | Card with copy button | ✅ Complete |
| `src/components/CopyButton.tsx` | Clipboard feedback | ✅ Complete |
| `src/utils/generateMessages.ts` | Template generation | ✅ Complete |
| `src/hooks/useCopyToClipboard.ts` | Clipboard API wrapper | ✅ Complete |
| `src/types/index.ts` | TypeScript interfaces | ✅ Complete |

**Entry Point:**
```bash
cd hdd-review-generator
npm run dev     # http://localhost:5173
```

**Dependencies:** ✅ Installed (`node_modules/` exists)
**Production Build:** ✅ Exists (`dist/` folder)

---

### Tool 4: GBP Post Scheduler

**Path:** `hdd-gbp-poster/`
**Stack:** Next.js 14, Prisma, Neon PostgreSQL, NextAuth, Claude AI, GBP API
**Status:** ✅ STRUCTURE COMPLETE - Needs Environment Setup

#### Pages Built

| Route | Purpose | Status |
|-------|---------|--------|
| `/login` | Magic link authentication | ✅ Complete |
| `/` | Dashboard with stats | ✅ Complete |
| `/posts` | Posts list with filters | ✅ Complete |
| `/posts/new` | Create/generate post | ✅ Complete |
| `/posts/[id]` | Edit post | ✅ Complete |
| `/images` | Image library | ✅ Complete |
| `/calendar` | Calendar view | ✅ Complete |
| `/settings` | Franchise settings | ✅ Complete |

#### API Routes Built

| Route | Purpose | Status |
|-------|---------|--------|
| `/api/auth/[...nextauth]` | NextAuth handlers | ✅ Complete |
| `/api/auth/google` | Google OAuth initiation | ✅ Complete |
| `/api/auth/google/callback` | OAuth callback | ✅ Complete |
| `/api/posts` | List/Create posts | ✅ Complete |
| `/api/posts/[id]` | Get/Update/Delete | ✅ Complete |
| `/api/posts/[id]/approve` | Approve + schedule | ✅ Complete |
| `/api/posts/[id]/publish` | Publish now | ✅ Complete |
| `/api/generate` | AI draft generation | ✅ Complete |
| `/api/images` | List/Upload images | ✅ Complete |
| `/api/images/[id]` | Update/Delete | ✅ Complete |
| `/api/franchise` | Get/Update settings | ✅ Complete |
| `/api/users` | List/Invite users | ✅ Complete |
| `/api/cron/generate-drafts` | Weekly draft generation | ✅ Complete |
| `/api/cron/publish-scheduled` | 15-min publish check | ✅ Complete |

**Entry Point:**
```bash
cd hdd-gbp-poster
cp .env.example .env   # Fill in values
npx prisma db push
npx prisma db seed
npm run dev            # http://localhost:3000
```

**Dependencies:** ✅ Installed

#### Environment Variables Required

| Variable | Purpose | Status |
|----------|---------|--------|
| `DATABASE_URL` | Neon PostgreSQL connection | ⚠️ Placeholder |
| `DATABASE_URL_UNPOOLED` | Direct connection | ⚠️ Placeholder |
| `NEXTAUTH_SECRET` | Session encryption | ✅ Set |
| `NEXTAUTH_URL` | App URL | ✅ Set |
| `RESEND_API_KEY` | Magic link emails | ⚠️ Placeholder |
| `EMAIL_FROM` | Sender address | ✅ Set |
| `ANTHROPIC_API_KEY` | Claude AI | ⚠️ Placeholder |
| `GOOGLE_CLIENT_ID` | GBP OAuth | ⚠️ Placeholder |
| `GOOGLE_CLIENT_SECRET` | GBP OAuth | ⚠️ Placeholder |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage | ⚠️ Empty |
| `CRON_SECRET` | Cron authentication | ✅ Set |
| `ENCRYPTION_KEY` | Token encryption | ✅ Set |

---

### Tool 5: Lead Response

**Path:** `hdd-lead-response/`
**Stack:** Next.js 14, Prisma, Neon PostgreSQL, NextAuth, Twilio, Resend, Cal.com
**Status:** ⚠️ STRUCTURE COMPLETE - Needs `npm install` + Environment Setup

#### Pages Built

| Route | Purpose | Status |
|-------|---------|--------|
| `/login` | Magic link authentication | ✅ Complete |
| `/` | Dashboard with stats | ✅ Complete |
| `/leads` | Leads list with filters | ✅ Complete |
| `/leads/new` | Manual lead entry | ✅ Complete |
| `/leads/[id]` | Lead detail + messages | ✅ Complete |
| `/messages` | All messages inbox | ✅ Complete |
| `/sequences` | Sequence template editor | ✅ Complete |
| `/settings` | Business settings | ✅ Complete |

#### API Routes Built

| Route | Purpose | Status |
|-------|---------|--------|
| `/api/auth/[...nextauth]` | NextAuth handlers | ✅ Complete |
| `/api/leads` | List/Create leads | ✅ Complete |
| `/api/leads/webhook` | External lead intake | ✅ Complete |
| `/api/leads/[id]` | Get/Update/Delete | ✅ Complete |
| `/api/leads/[id]/messages` | Lead messages | ✅ Complete |
| `/api/leads/[id]/pause` | Pause sequence | ✅ Complete |
| `/api/leads/[id]/resume` | Resume sequence | ✅ Complete |
| `/api/leads/[id]/close` | Close lead | ✅ Complete |
| `/api/messages` | List/Send messages | ✅ Complete |
| `/api/sequences` | Get/Update sequence | ✅ Complete |
| `/api/settings` | Get/Update settings | ✅ Complete |
| `/api/webhooks/twilio` | Inbound SMS | ✅ Complete |
| `/api/webhooks/cal` | Cal.com bookings | ✅ Complete |
| `/api/cron/process-followups` | 5-min followup check | ✅ Complete |

**Entry Point:**
```bash
cd hdd-lead-response
npm install              # REQUIRED - not yet done
cp .env.example .env     # Fill in values
npx prisma db push
npx prisma db seed
npm run dev              # http://localhost:3000
```

**Dependencies:** ❌ NOT INSTALLED (`node_modules/` missing)

#### Environment Variables Required

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection | Yes |
| `DATABASE_URL_UNPOOLED` | Direct connection | Yes |
| `NEXTAUTH_SECRET` | Session encryption | Yes |
| `NEXTAUTH_URL` | App URL | Yes |
| `RESEND_API_KEY` | Emails | Yes |
| `EMAIL_FROM` | Sender address | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio auth | Yes |
| `TWILIO_PHONE_NUMBER` | Sending number | Yes |
| `CAL_BOOKING_LINK` | Cal.com link | Yes |
| `CAL_WEBHOOK_SECRET` | Webhook verification | Yes |
| `CRON_SECRET` | Cron authentication | Yes |
| `WEBHOOK_SECRET` | Lead webhook auth | Yes |

---

## Infrastructure Tools

### Dashboard

**Path:** `hdd-dashboard/`
**Stack:** Pure HTML, CSS, JavaScript
**Status:** ✅ COMPLETE

| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Dashboard page with tool cards | ✅ Complete |
| `styles.css` | Responsive grid styling | ✅ Complete |
| `config.js` | Tool definitions and status | ✅ Complete |

**Features:**
- 10 tool cards with status badges
- Launch buttons (URLs or disabled with tooltip)
- Expandable Setup Info panels
- Responsive 2-column grid

---

## Development Tools (Scaffolded)

All share: React 19, TypeScript, Tailwind CSS v4, Vite 7

| Tool | Path | Port | Purpose | Status |
|------|------|------|---------|--------|
| Photo Manager | `hdd-photo-manager/` | 5174 | Organize project photos | Implemented (localStorage only, not production-ready) |
| Referral Tracker | `hdd-referral-tracker/` | 5175 | Track leads and referral codes | Scaffolded |
| Warranty Tracker | `hdd-warranty-tracker/` | 5176 | Track warranties | Scaffolded |
| Weather Content | `hdd-weather-content/` | 5177 | Weather-based suggestions | Scaffolded |
| Competitor Monitor | `hdd-competitor-monitor/` | 5178 | Track competitor ratings | Scaffolded |

**Dependencies:** ✅ All installed (`node_modules/` exists)
**Feature Implementation:** Photo Manager has working UI with localStorage persistence; other 4 have placeholder content only

---

## Action Items

### Critical

1. **Lead Response missing `node_modules`**
   ```bash
   cd hdd-lead-response && npm install
   ```

### Configuration Required

2. **Sentiment Router `config.js`** has placeholder values:
   - `googleReviewUrl` needs real Google Review link
   - `feedbackEmail` needs real email
   - `formspreeId` needs Formspree form ID

3. **GBP Post Scheduler** needs external services:
   - See [EXTERNAL_SERVICES_SETUP.md](EXTERNAL_SERVICES_SETUP.md)

4. **Lead Response** needs external services:
   - See [EXTERNAL_SERVICES_SETUP.md](EXTERNAL_SERVICES_SETUP.md)

### Future Development

5. **Scaffolded tools** need feature implementation:
   - Photo Manager
   - Referral Tracker
   - Warranty Tracker
   - Weather Content
   - Competitor Monitor

---

## Quick Start Commands

```bash
# Python launcher (recommended)
python launcher.py

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
```

---

## External Service Setup

### For GBP Poster

1. **Neon Database** - neon.tech
2. **Resend** - resend.com
3. **Anthropic** - console.anthropic.com
4. **Google Cloud** - console.cloud.google.com (Business Profile API)
5. **Vercel Blob** - Vercel project settings

### For Lead Response

1. **Neon Database** - neon.tech
2. **Resend** - resend.com
3. **Twilio** - twilio.com (purchase 513 area code number)
4. **Cal.com** - cal.com (booking page + webhook)

See [EXTERNAL_SERVICES_SETUP.md](EXTERNAL_SERVICES_SETUP.md) for detailed step-by-step instructions.

---

*Last updated: 2026-02-03*
