# HDD Marketing Tools: Implementation & Testing Guide

Complete setup, testing checklists, and deployment instructions for all HDD marketing tools.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Static Tools](#static-tools)
3. [React/Vite Tools](#reactvite-tools)
4. [Next.js Tools](#nextjs-tools)
5. [Testing Checklists](#testing-checklists)
6. [Deployment Options](#deployment-options)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Node.js 20+ (for React and Next.js tools)
- Python 3.x (for launcher script)
- Web browser

### Recommended: Use the Launcher

```bash
python launcher.py
```

Interactive menu to launch any tool or group of tools.

### Manual Launch

```bash
# Static tools - open directly in browser
hdd-dashboard/index.html
hdd-sentiment-router/index.html
hdd-quote-calculator/index.html

# React tools
cd hdd-review-generator && npm run dev

# Next.js tools (need .env setup first)
cd hdd-gbp-poster && npm run dev
cd hdd-lead-response && npm install && npm run dev
```

---

## Static Tools

No build step required. Open HTML files directly in browser.

### Dashboard (`hdd-dashboard/`)

Central hub for all tools.

**Setup:** None required

**Files:**
- `index.html` - Main page
- `styles.css` - Styling
- `config.js` - Tool definitions

### Sentiment Router (`hdd-sentiment-router/`)

Routes customers by satisfaction level.

**Setup:**
1. Edit `config.js` with your franchise settings:
   ```javascript
   googleReviewUrl: "https://g.page/r/YOUR-REVIEW-LINK/review"
   feedbackEmail: "feedback@yourfranchise.com"
   formspreeId: "your-formspree-id"
   websiteUrl: "https://www.hickorydickorydecks.com/your-location"
   franchiseName: "Hickory Dickory Decks - Cincinnati"
   ```
2. Open `index.html` in browser to test

**Getting Your Google Review URL:**
1. Go to [Google Business Profile](https://business.google.com)
2. Select your business location
3. Click "Get more reviews" or find the share review link
4. Copy the URL (format: `https://g.page/r/XXXXX/review`)

**Setting Up Formspree:**
1. Create free account at [formspree.io](https://formspree.io)
2. Create a new form
3. Copy the form ID (the part after `/f/` in the URL)
4. Add to `config.js` as `formspreeId`

### Quote Calculator (`hdd-quote-calculator/`)

Customer-facing deck estimate tool.

**Setup:**
1. Edit `config.js` to adjust pricing for your market:
   - `basePricePerSqFt` - Base pricing
   - Material multipliers
   - Feature pricing
   - Height adjustments
2. Open `index.html` in browser

---

## React/Vite Tools

All use: React 19, TypeScript, Tailwind CSS v4, Vite 7

### Review Generator (`hdd-review-generator/`)

**Setup:**
```bash
cd hdd-review-generator
npm install    # Already done
npm run dev    # localhost:5173
```

**Build for Production:**
```bash
npm run build  # Output to dist/
```

### Scaffolded Tools

These tools have basic scaffolding but need feature implementation:

| Tool | Path | Port |
|------|------|------|
| Photo Manager | `hdd-photo-manager/` | 5174 |
| Referral Tracker | `hdd-referral-tracker/` | 5175 |
| Warranty Tracker | `hdd-warranty-tracker/` | 5176 |
| Weather Content | `hdd-weather-content/` | 5177 |
| Competitor Monitor | `hdd-competitor-monitor/` | 5178 |

**Setup (any):**
```bash
cd hdd-[tool-name]
npm install
npm run dev
```

---

## Next.js Tools

Both use: Next.js 14, Prisma, Neon PostgreSQL, NextAuth.js v5

### GBP Post Scheduler (`hdd-gbp-poster/`)

**Setup:**
```bash
cd hdd-gbp-poster
cp .env.example .env   # Edit with your values
npx prisma db push     # Create database tables
npx prisma db seed     # Seed Cincinnati franchise
npm run dev            # localhost:3000
```

**Environment Variables:**
See [EXTERNAL_SERVICES_SETUP.md](EXTERNAL_SERVICES_SETUP.md) for detailed instructions.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection |
| `DATABASE_URL_UNPOOLED` | Direct connection |
| `NEXTAUTH_SECRET` | Session encryption |
| `NEXTAUTH_URL` | App URL |
| `RESEND_API_KEY` | Magic link emails |
| `EMAIL_FROM` | Sender address |
| `ANTHROPIC_API_KEY` | Claude AI |
| `GOOGLE_CLIENT_ID` | GBP OAuth |
| `GOOGLE_CLIENT_SECRET` | GBP OAuth |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage |
| `CRON_SECRET` | Cron authentication |
| `ENCRYPTION_KEY` | Token encryption |

### Lead Response (`hdd-lead-response/`)

**Setup:**
```bash
cd hdd-lead-response
npm install            # REQUIRED - not yet done
cp .env.example .env   # Edit with your values
npx prisma db push     # Create database tables
npx prisma db seed     # Seed default sequence
npm run dev            # localhost:3000
```

**Environment Variables:**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection |
| `DATABASE_URL_UNPOOLED` | Direct connection |
| `NEXTAUTH_SECRET` | Session encryption |
| `NEXTAUTH_URL` | App URL |
| `RESEND_API_KEY` | Email delivery |
| `EMAIL_FROM` | Sender address |
| `TWILIO_ACCOUNT_SID` | Twilio account |
| `TWILIO_AUTH_TOKEN` | Twilio auth |
| `TWILIO_PHONE_NUMBER` | SMS sending number |
| `CAL_BOOKING_LINK` | Cal.com booking URL |
| `CAL_WEBHOOK_SECRET` | Webhook verification |
| `CRON_SECRET` | Cron authentication |
| `WEBHOOK_SECRET` | Lead webhook auth |

---

## Testing Checklists

### Dashboard

| Test | Expected | Pass? |
|------|----------|-------|
| Page loads | "HDD Marketing Tools" heading visible | ☐ |
| Tool cards display | All tools visible in grid | ☐ |
| Status badges show | Green/amber/red badges on cards | ☐ |
| Launch buttons work | Open correct URLs | ☐ |
| Setup Info expands | Panels expand/collapse | ☐ |
| Mobile responsive | Single column on narrow screens | ☐ |

### Sentiment Router

**Index Page:**
| Test | Expected | Pass? |
|------|----------|-------|
| Page loads | "How was your experience?" heading | ☐ |
| Buttons display | "Great!" and "Could be better" visible | ☐ |
| Click "Great!" | Redirects to Google Review URL | ☐ |
| Click "Could be better" | Navigates to feedback.html | ☐ |
| Buttons touch-friendly | At least 140x140px | ☐ |

**Feedback Page:**
| Test | Expected | Pass? |
|------|----------|-------|
| Form displays | Textarea and contact field visible | ☐ |
| Empty feedback | Error: "Please provide more detail..." | ☐ |
| 5 character feedback | Error (minimum 10 required) | ☐ |
| Valid feedback, no contact | Error: "Please provide contact info" | ☐ |
| Valid submission | Redirects to thank-you.html | ☐ |

**Thank You Page:**
| Test | Expected | Pass? |
|------|----------|-------|
| Confirmation shows | Checkmark and thank you message | ☐ |
| Return link works | Opens configured websiteUrl | ☐ |

### Quote Calculator

| Test | Expected | Pass? |
|------|----------|-------|
| Page loads | Calculator form visible | ☐ |
| Enter dimensions | Square footage calculates live | ☐ |
| Select material | Price range updates | ☐ |
| Add features | Price range increases | ☐ |
| Change height | Price range adjusts | ☐ |
| Calculate button | Full estimate displays | ☐ |
| Mobile responsive | Form usable on phones | ☐ |

### Review Generator

**Form:**
| Test | Expected | Pass? |
|------|----------|-------|
| All fields display | 6 form fields visible | ☐ |
| Empty submit | Validation errors appear | ☐ |
| Invalid URL | "Please enter a valid URL" error | ☐ |
| Valid submit | Messages appear below | ☐ |
| Page refresh | Franchisee name persists | ☐ |
| Page refresh | Review link persists | ☐ |

**Generated Messages:**
| Test | Expected | Pass? |
|------|----------|-------|
| SMS shows name | "Hi [FirstName]!" format | ☐ |
| SMS includes link | Google Review link at end | ☐ |
| SMS character count | Count displayed below card | ☐ |
| Email subject | Includes project type | ☐ |
| Email body | City mentioned twice | ☐ |
| Thank you card | Full name format | ☐ |

**Copy Function:**
| Test | Expected | Pass? |
|------|----------|-------|
| Click Copy | Button shows "Copied!" | ☐ |
| Paste content | Correct text in clipboard | ☐ |
| Button resets | Returns to "Copy" after 2s | ☐ |

### GBP Post Scheduler

**Prerequisites:**
- `.env` configured
- Database pushed and seeded
- User email added to database

| Test | Expected | Pass? |
|------|----------|-------|
| App loads | Redirects to /login | ☐ |
| Enter valid email | Magic link sent | ☐ |
| Click magic link | Redirected to dashboard | ☐ |
| Dashboard loads | Stats cards visible | ☐ |
| Click "New Post" | Post editor opens | ☐ |
| Select post type | Type-specific fields appear | ☐ |
| Click "Generate Draft" | AI generates content | ☐ |
| Save as draft | Appears in posts list | ☐ |
| Approve and schedule | Status changes | ☐ |
| View calendar | Scheduled posts visible | ☐ |
| Upload image | Image appears in library | ☐ |

### Lead Response

**Prerequisites:**
- `npm install` completed
- `.env` configured
- Database pushed and seeded
- User email added to database

| Test | Expected | Pass? |
|------|----------|-------|
| App loads | Redirects to /login | ☐ |
| Login works | Magic link authentication | ☐ |
| Dashboard loads | Stats cards visible | ☐ |
| Click "New Lead" | Lead form opens | ☐ |
| Submit lead | Lead appears in list | ☐ |
| Click lead | Detail view with messages | ☐ |
| Send manual message | Message sends | ☐ |
| Sequence starts | First messages sent | ☐ |
| Pause sequence | Sequence pauses | ☐ |
| Resume sequence | Sequence resumes | ☐ |

---

## Deployment Options

### Static Tools (Dashboard, Sentiment Router, Quote Calculator)

**Option 1: Vercel**
```bash
# Drag folder to vercel.com/new
```

**Option 2: Netlify**
Same as Vercel - drag and drop.

**Option 3: GitHub Pages**
1. Push to GitHub
2. Settings > Pages > Select branch

**Option 4: FTP**
Upload files to any web host.

### React Tools (Review Generator, etc.)

```bash
npm run build
# Deploy dist/ folder to any static host
```

### Next.js Tools (GBP Poster, Lead Response)

**Recommended: Vercel**
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Cron Jobs:**
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-drafts",
      "schedule": "0 5 * * 0"
    },
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## Troubleshooting

### Static Tools

**"Great!" button does nothing**
- Check `config.js` has valid `googleReviewUrl`
- Open browser console for errors

**Feedback form doesn't send email**
- Verify `formspreeId` is correct
- Check Formspree dashboard for submissions

### React Tools

**"npm install" fails**
- Ensure Node.js 20+ installed: `node --version`

**Styles look broken**
- Verify `postcss.config.js` exists
- Contains `@tailwindcss/postcss`

**Copy button doesn't work**
- Clipboard API requires HTTPS or localhost
- Deploy to HTTPS host

### Next.js Tools

**"Module not found" errors**
- Run `npm install`
- Delete `node_modules` and reinstall

**Database connection fails**
- Check `DATABASE_URL` in `.env`
- Verify Neon database is running

**Magic link not received**
- Check `RESEND_API_KEY` is valid
- Verify `EMAIL_FROM` domain is configured in Resend

**Google OAuth fails**
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Verify redirect URI in Google Cloud Console

---

## Franchisee Handoff Checklist

### Before Handoff

| Item | Done? |
|------|-------|
| All tools tested locally | ☐ |
| Environment variables configured | ☐ |
| Databases seeded | ☐ |
| User accounts created | ☐ |
| Deployed to production | ☐ |

### Documentation Provided

| Item | Done? |
|------|-------|
| URLs for each tool | ☐ |
| Login credentials | ☐ |
| Quick reference guide | ☐ |
| Support contact | ☐ |

### Training Completed

| Item | Done? |
|------|-------|
| Review Generator demo | ☐ |
| Sentiment Router demo | ☐ |
| Quote Calculator demo | ☐ |
| GBP Post Scheduler demo | ☐ |
| Lead Response demo | ☐ |

---

## Support

If issues arise:

1. Check browser console for JavaScript errors
2. Check Network tab for failed requests
3. Verify config files for typos
4. Run `npm run lint` for React/Next.js tools
5. Check Prisma logs: `npx prisma studio`

---

*Last updated: 2026-02-03*
