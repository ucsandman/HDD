# HDD Marketing Tools - Project Status

**Generated:** 2026-02-01
**Total Projects:** 5 (4 tools + 1 dashboard)
**Overall Status:** 4 complete, 1 needs dependency install

---

## File Structure Overview

```
HDD/
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
│   ├── config.js
│   └── README.md
│
├── hdd-review-generator/     # Tool 2: React/Vite (COMPLETE)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── InputForm.tsx
│   │   │   ├── OutputSection.tsx
│   │   │   ├── MessageCard.tsx
│   │   │   ├── CopyButton.tsx
│   │   │   └── Header.tsx
│   │   ├── utils/
│   │   │   └── generateMessages.ts
│   │   ├── hooks/
│   │   │   └── useCopyToClipboard.ts
│   │   └── types/
│   │       └── index.ts
│   ├── dist/                 # Production build exists
│   ├── node_modules/         # Dependencies installed
│   └── package.json
│
├── hdd-gbp-poster/           # Tool 3: Next.js (COMPLETE - needs env)
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── posts/           # Posts CRUD
│   │   │   ├── images/          # Image library
│   │   │   ├── calendar/        # Calendar view
│   │   │   └── settings/        # Franchise settings
│   │   └── api/
│   │       ├── auth/            # NextAuth + Google OAuth
│   │       ├── posts/           # Posts CRUD + approve/publish
│   │       ├── generate/        # AI draft generation
│   │       ├── images/          # Image upload/manage
│   │       ├── franchise/       # Settings
│   │       ├── users/           # User management
│   │       └── cron/            # Scheduled jobs
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── anthropic/           # Claude API
│   │   ├── google/              # GBP API
│   │   └── crypto.ts            # Token encryption
│   ├── prisma/schema.prisma
│   ├── node_modules/            # Dependencies installed
│   ├── .next/                   # Build cache exists
│   └── .env.example
│
├── hdd-lead-response/        # Tool 4: Next.js (NEEDS npm install)
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── leads/           # Leads CRUD
│   │   │   ├── messages/        # Message inbox
│   │   │   ├── sequences/       # Sequence editor
│   │   │   └── settings/        # Settings
│   │   └── api/
│   │       ├── auth/            # NextAuth
│   │       ├── leads/           # Leads CRUD + webhook
│   │       ├── messages/        # Message sending
│   │       ├── sequences/       # Sequence config
│   │       ├── settings/        # Settings
│   │       ├── webhooks/        # Twilio + Cal.com
│   │       └── cron/            # Follow-up processing
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── phone.ts             # E.164 normalization
│   │   ├── templates.ts         # Message rendering
│   │   ├── sequence.ts          # Sequence engine
│   │   ├── twilio/              # SMS client
│   │   └── resend/              # Email client
│   ├── prisma/schema.prisma
│   ├── node_modules/            # NOT INSTALLED
│   └── .env.example
│
└── Spec files (root)
    ├── hdd-sentiment-router-spec.md
    ├── hdd-review-generator-spec.md
    ├── hdd-gbp-poster-spec.md
    └── hdd-lead-response-spec.md
```

---

## Dashboard

**Path:** `hdd-dashboard/`
**Stack:** Pure HTML, CSS, JavaScript (no build step)
**Status:** ✅ COMPLETE

### Files

| File | Purpose |
|------|---------|
| `index.html` | Dashboard page with tool cards |
| `styles.css` | All styling |
| `config.js` | Tool definitions and status |

### Entry Point

Open `hdd-dashboard/index.html` directly in browser. No server required.

### Features

- Shows all 4 tools with status badges (Ready/Needs Setup/Needs Install)
- Launch buttons open each tool's URL
- Setup Info panels expand with commands, env vars, and service requirements
- Responsive 2-column grid (single column on mobile)
- All content driven by `config.js` for easy updates

---

## Tool 1: Sentiment Router

**Path:** `hdd-sentiment-router/`
**Stack:** Pure HTML, CSS, JavaScript (no build step)
**Status:** ✅ COMPLETE

### Components Built

| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Sentiment check (Great!/Could be better) | ✅ Complete |
| `feedback.html` | Private feedback form | ✅ Complete |
| `thank-you.html` | Confirmation page | ✅ Complete |
| `styles.css` | Mobile-first responsive styling | ✅ Complete |
| `script.js` | Routing logic, validation, analytics hooks | ✅ Complete |
| `config.js` | Franchise-specific settings | ✅ Complete (placeholder values) |
| `README.md` | Setup instructions | ✅ Complete |

### Functional vs Stubbed

- **Functional:** All core functionality complete
- **Stubbed:** Logo shows "HDD Logo" placeholder text

### Missing vs Spec

Nothing missing. All spec requirements implemented.

### Entry Point

Open `index.html` directly in browser. No server required.

### Dependencies

None. Zero external dependencies.

### Configuration Required

Edit `config.js` before use:
```javascript
googleReviewUrl: "https://g.page/r/YOUR-REVIEW-LINK/review"  // REQUIRED
feedbackEmail: "feedback@example.com"                        // For mailto fallback
formspreeId: "your-formspree-id"                            // For form submission
websiteUrl: "https://www.hickorydickorydecks.com/location"  // Return link
```

---

## Tool 2: Review Generator

**Path:** `hdd-review-generator/`
**Stack:** React 19, TypeScript, Vite 7, Tailwind CSS v4
**Status:** ✅ COMPLETE

### Components Built

| File | Purpose | Status |
|------|---------|--------|
| `src/App.tsx` | Main app with state | ✅ Complete |
| `src/components/InputForm.tsx` | Form with validation + localStorage | ✅ Complete |
| `src/components/OutputSection.tsx` | Container for message cards | ✅ Complete |
| `src/components/MessageCard.tsx` | Reusable card with copy button | ✅ Complete |
| `src/components/CopyButton.tsx` | Clipboard with "Copied!" feedback | ✅ Complete |
| `src/components/Header.tsx` | App header | ✅ Complete |
| `src/utils/generateMessages.ts` | Template generation logic | ✅ Complete |
| `src/hooks/useCopyToClipboard.ts` | Clipboard API wrapper | ✅ Complete |
| `src/types/index.ts` | TypeScript interfaces | ✅ Complete |

### Functional vs Stubbed

- **Functional:** All core functionality complete
- **Production build exists** in `dist/` folder

### Missing vs Spec

Nothing missing. All spec requirements implemented including:
- SMS character limit with fallback template
- localStorage persistence for franchisee fields
- Auto-scroll to output on generation

### Entry Point

```bash
cd hdd-review-generator
npm run dev     # Dev server at http://localhost:5173
npm run build   # Production build
npm run preview # Preview production
```

### Dependencies

```bash
cd hdd-review-generator
npm install     # Already done - node_modules exists
```

No environment variables required.

---

## Tool 3: GBP Post Scheduler

**Path:** `hdd-gbp-poster/`
**Stack:** Next.js 14, Prisma, Neon PostgreSQL, NextAuth, Claude API, Google Business Profile API
**Status:** ✅ STRUCTURE COMPLETE - Needs Environment Setup

### Pages Built

| Route | Purpose | Status |
|-------|---------|--------|
| `/login` | Magic link authentication | ✅ Complete |
| `/` | Dashboard with stats | ✅ Complete |
| `/posts` | Posts list with filters | ✅ Complete |
| `/posts/new` | Create/generate new post | ✅ Complete |
| `/posts/[id]` | Edit post | ✅ Complete |
| `/images` | Image library | ✅ Complete |
| `/calendar` | Calendar view | ✅ Complete |
| `/settings` | Franchise settings | ✅ Complete |

### API Routes Built

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
| `/api/images/upload` | Upload handler | ✅ Complete |
| `/api/images/[id]` | Update/Delete | ✅ Complete |
| `/api/franchise` | Get/Update settings | ✅ Complete |
| `/api/users` | List/Invite users | ✅ Complete |
| `/api/users/[id]` | Delete user | ✅ Complete |
| `/api/cron/generate-drafts` | Weekly draft generation | ✅ Complete |
| `/api/cron/publish-scheduled` | 15-min publish check | ✅ Complete |

### Database Schema

6 tables defined in `prisma/schema.prisma`:
- `franchises` - Multi-franchise support
- `users` - Auth with roles
- `images` - Image library
- `posts` - Post content + status workflow
- `post_images` - Many-to-many
- `generation_queue` - AI draft queue

### Entry Point

```bash
cd hdd-gbp-poster
npm install              # Already done
cp .env.example .env     # Create .env
# Fill in env vars
npx prisma db push       # Create tables
npx prisma db seed       # Seed Cincinnati franchise
npm run dev              # http://localhost:3000
```

### Dependencies

```bash
cd hdd-gbp-poster
npm install     # Already done - node_modules exists
```

### Environment Variables Required

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection | Yes |
| `DATABASE_URL_UNPOOLED` | Direct connection | Yes |
| `NEXTAUTH_SECRET` | Session encryption | Yes |
| `NEXTAUTH_URL` | App URL | Yes |
| `RESEND_API_KEY` | Magic link emails | Yes |
| `EMAIL_FROM` | Sender address | Yes |
| `ANTHROPIC_API_KEY` | Claude AI | Yes |
| `GOOGLE_CLIENT_ID` | GBP OAuth | Yes |
| `GOOGLE_CLIENT_SECRET` | GBP OAuth | Yes |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage | Yes |
| `CRON_SECRET` | Cron authentication | Yes |
| `ENCRYPTION_KEY` | Token encryption | Yes |

---

## Tool 4: Lead Response

**Path:** `hdd-lead-response/`
**Stack:** Next.js 14, Prisma, Neon PostgreSQL, NextAuth, Twilio, Resend, Cal.com
**Status:** ⚠️ STRUCTURE COMPLETE - Needs `npm install` + Environment Setup

### Pages Built

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

### API Routes Built

| Route | Purpose | Status |
|-------|---------|--------|
| `/api/auth/[...nextauth]` | NextAuth handlers | ✅ Complete |
| `/api/leads` | List/Create leads | ✅ Complete |
| `/api/leads/webhook` | External lead intake | ✅ Complete |
| `/api/leads/[id]` | Get/Update/Delete | ✅ Complete |
| `/api/leads/[id]/messages` | Lead messages | ✅ Complete |
| `/api/leads/[id]/pause` | Pause sequence | ✅ Complete |
| `/api/leads/[id]/resume` | Resume sequence | ✅ Complete |
| `/api/leads/[id]/skip` | Skip to next step | ✅ Complete |
| `/api/leads/[id]/close` | Close lead | ✅ Complete |
| `/api/messages` | List/Send messages | ✅ Complete |
| `/api/sequences` | Get/Update sequence | ✅ Complete |
| `/api/settings` | Get/Update settings | ✅ Complete |
| `/api/webhooks/twilio` | Inbound SMS | ✅ Complete |
| `/api/webhooks/cal` | Cal.com bookings | ✅ Complete |
| `/api/cron/process-followups` | 5-min followup check | ✅ Complete |

### Database Schema

5 tables + 3 NextAuth tables in `prisma/schema.prisma`:
- `users` - Auth with roles
- `leads` - Contact info + sequence tracking
- `messages` - Communication log
- `sequence_steps` - Followup templates
- `settings` - Key-value config
- `accounts`, `sessions`, `verification_tokens` - NextAuth

### Entry Point

```bash
cd hdd-lead-response
npm install              # REQUIRED - not yet done
cp .env.example .env     # Create .env
# Fill in env vars
npx prisma db push       # Create tables
npx prisma db seed       # Seed default sequence
npm run dev              # http://localhost:3000
```

### Dependencies

```bash
cd hdd-lead-response
npm install     # REQUIRED - node_modules NOT present
```

### Environment Variables Required

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

## Red Flags / Issues

### Critical

1. **Lead Response missing `node_modules`**
   - Run `cd hdd-lead-response && npm install`

### Configuration Placeholders

2. **Sentiment Router `config.js`** has placeholder values:
   - `googleReviewUrl` = `"https://g.page/r/YOUR-REVIEW-LINK/review"`
   - `feedbackEmail` = `"feedback@example.com"`
   - `formspreeId` = `"your-formspree-id"`
   - `franchiseName` = `"Hickory Dickory Decks - [Location]"`

### Missing Assets

3. **Logo placeholders** in Sentiment Router show "HDD Logo" text instead of image

### No Critical Code Issues

- No broken imports detected
- No TODO/FIXME comments in code
- No hardcoded secrets (all use env vars)

---

## Test Checklists

### Dashboard

**Happy Path**
- [ ] Open `hdd-dashboard/index.html` in browser
- [ ] Page loads with "HDD Marketing Tools" heading
- [ ] Four tool cards visible in 2-column grid
- [ ] Status badges show correct colors (green/amber/red)
- [ ] Click "Launch" on Sentiment Router → opens `../hdd-sentiment-router/index.html`
- [ ] Click "Setup Info" → panel expands below card
- [ ] Click "Setup Info" again → panel collapses
- [ ] Click different "Setup Info" → previous panel closes, new one opens
- [ ] Lead Response "Launch" button is disabled with tooltip
- [ ] Footer shows "4 tools · 3 ready · Built for Cincinnati"

**Edge Cases**
- [ ] Resize to mobile width → cards stack to single column
- [ ] GBP Poster and Lead Response show env vars tables
- [ ] Commands show comments in italic/muted style

### Tool 1: Sentiment Router

**Happy Path**
- [ ] Open `index.html` in browser
- [ ] Page loads with "How was your experience?" heading
- [ ] Two buttons visible: "Great!" and "Could be better"
- [ ] Click "Great!" → redirects (will fail without valid Google URL in config)
- [ ] Return to index, click "Could be better" → goes to feedback.html
- [ ] Fill feedback form (10+ chars in feedback, contact info)
- [ ] Submit → goes to thank-you.html
- [ ] Click "Return to our website" link

**Edge Cases**
- [ ] Submit feedback with < 10 characters → shows error
- [ ] Submit without contact info → shows error
- [ ] Test on mobile device → responsive layout works
- [ ] Test with custom colors in config → colors apply

### Tool 2: Review Generator

**Happy Path**
- [ ] Run `npm run dev` → opens at localhost:5173
- [ ] Form shows all 6 fields
- [ ] Fill all fields with valid data
- [ ] Click "Generate Messages" → output section appears
- [ ] Three message cards appear: SMS, Email, Thank You Card
- [ ] SMS shows character count
- [ ] Click "Copy" on SMS → shows "Copied!" feedback
- [ ] Paste in text editor → content matches
- [ ] Refresh page → Franchisee name and Review link persist

**Edge Cases**
- [ ] Submit with empty required field → shows validation error
- [ ] Enter very long Google Review URL → SMS uses fallback template
- [ ] Test all 12 project types from dropdown
- [ ] Mobile: form stacks vertically, cards readable

### Tool 3: GBP Post Scheduler

**Prerequisites**
- [ ] `.env` file created with all variables
- [ ] Database pushed: `npx prisma db push`
- [ ] Seeded: `npx prisma db seed`
- [ ] User email added to database

**Happy Path**
- [ ] Run `npm run dev` → opens at localhost:3000
- [ ] Redirects to /login
- [ ] Enter valid email → magic link sent
- [ ] Click magic link → redirected to dashboard
- [ ] Dashboard shows stats cards
- [ ] Click "New Post" → post editor opens
- [ ] Select post type, fill details
- [ ] Click "Generate Draft" → AI generates content
- [ ] Edit content, attach image
- [ ] Save as draft → appears in posts list
- [ ] Approve and schedule post
- [ ] View in calendar

**Edge Cases**
- [ ] Post body > 1500 chars → warning shown
- [ ] Login with unregistered email → denied
- [ ] Google not connected → publish fails gracefully

### Tool 4: Lead Response

**Prerequisites**
- [ ] Run `npm install`
- [ ] `.env` file created with all variables
- [ ] Database pushed: `npx prisma db push`
- [ ] Seeded: `npx prisma db seed`
- [ ] User email added to database
- [ ] Twilio phone number configured

**Happy Path**
- [ ] Run `npm run dev` → opens at localhost:3000
- [ ] Login with magic link
- [ ] Dashboard shows stats
- [ ] Click "New Lead" → lead form opens
- [ ] Fill lead details, submit
- [ ] Lead appears in list
- [ ] Click lead → detail view with message history
- [ ] Compose manual message → sends
- [ ] Webhook: POST to `/api/leads/webhook` creates lead
- [ ] Twilio webhook: inbound SMS matches lead, pauses sequence

**Edge Cases**
- [ ] Lead without phone → SMS skipped, email only
- [ ] Invalid phone format → normalized or rejected
- [ ] Sequence completes → status changes to "completed"
- [ ] Cal.com webhook → marks lead as booked

---

## Quick Start Commands

```bash
# Dashboard (no install needed)
# Open hdd-dashboard/index.html in browser - links to all tools

# Tool 1: Sentiment Router (no install needed)
# Just open hdd-sentiment-router/index.html in browser

# Tool 2: Review Generator
cd hdd-review-generator
npm run dev

# Tool 3: GBP Post Scheduler
cd hdd-gbp-poster
cp .env.example .env
# Edit .env with your values
npx prisma db push
npm run dev

# Tool 4: Lead Response
cd hdd-lead-response
npm install              # REQUIRED
cp .env.example .env
# Edit .env with your values
npx prisma db push
npm run dev
```

---

## External Service Setup Required

### For GBP Poster

1. **Neon Database** - Create project at neon.tech
2. **Resend** - Create account at resend.com for magic links
3. **Anthropic** - Get API key from console.anthropic.com
4. **Google Cloud** - Enable Business Profile API, create OAuth credentials
5. **Vercel Blob** - Enable in Vercel project settings

### For Lead Response

1. **Neon Database** - Create project at neon.tech
2. **Resend** - Create account at resend.com for emails
3. **Twilio** - Create account, purchase 513 area code number
4. **Cal.com** - Create booking page, configure webhook

---

*Last updated: 2026-02-01*
