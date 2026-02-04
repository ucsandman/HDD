# HDD Marketing Tools

Marketing, customer feedback, and automation platform for Hickory Dickory Decks franchisees.

## Overview

**18 total tools** in 3 categories:
- **10 Production Tools**: Sentiment Router, Review Generator, GBP Post Scheduler, Lead Response, Quote Tracker, Project Messenger, Permit Tracker, Job Costing, Supplier Tracker, Customer Portal
- **3 Infrastructure Tools**: Dashboard, Quote Calculator, Material Calculator
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
| Quote Tracker | `hdd-quote-tracker/` | 5179 | Track quotes and follow-ups |
| Project Messenger | `hdd-project-messenger/` | 5180 | Automated project milestone communications |
| Permit Tracker | `hdd-permit-tracker/` | 5184 | Track permits and inspections |
| Material Calculator | `hdd-material-calculator/` | 5181 | Calculate deck materials |
| Job Costing | `hdd-job-costing/` | 5182 | Track project costs and profitability |
| Supplier Tracker | `hdd-supplier-tracker/` | 5183 | Compare prices across suppliers |
| Customer Portal | `hdd-customer-portal/` | 5185 | Customer-facing project status portal |

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
- `/api/external/create-draft` - External draft creation (Weather Content)
- `/api/cron/generate-drafts` - Weekly (Sundays 5:00 UTC)
- `/api/cron/publish-scheduled` - Every 15 minutes

**Environment Variables** (13):
```
DATABASE_URL, DATABASE_URL_UNPOOLED
NEXTAUTH_SECRET, NEXTAUTH_URL
RESEND_API_KEY, EMAIL_FROM
ANTHROPIC_API_KEY
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
BLOB_READ_WRITE_TOKEN
CRON_SECRET, ENCRYPTION_KEY, EXTERNAL_API_KEY
```

**External API Integration**:
Weather Content tool can create drafts via `/api/external/create-draft`. Requires API key authentication and franchise ID header. See Weather Content `INTEGRATION.md` for setup.

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

### 5. Quote Tracker (`hdd-quote-tracker/`)

Track quotes from Quote Calculator and automate follow-up sequences.

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, status enums |
| `src/utils/templates.ts` | Follow-up message templates |
| `src/utils/dateUtils.ts` | Date calculations, next follow-up logic |
| `src/utils/storage.ts` | localStorage persistence, CSV export |
| `src/hooks/useQuotes.ts` | Quote CRUD operations |
| `src/components/Dashboard.tsx` | Stats cards |
| `src/components/QuoteList.tsx` | Table view with status badges |
| `src/components/QuoteDetail.tsx` | Detail modal with tabs |

**Follow-Up Sequence**:
1. **24 hours** - SMS check-in
2. **72 hours** - Email with full quote details
3. **7 days** - Final SMS
4. **14 days** - Auto-close as lost

**Status Workflow**: `sent` → `viewed` → `followup1` → `followup2` → `followup3` → `closed_won/closed_lost`

**Features**:
- Dashboard with metrics (total quotes, pending follow-ups, conversion rate, avg value)
- Conversion funnel visualization
- Quote management with search and filters
- Follow-up templates (SMS/email) with variable substitution
- CSV export for reporting
- localStorage persistence (no backend)

---

### 6. Project Messenger (`hdd-project-messenger/`)

Automated milestone communication for active deck construction projects.

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, status enums, constants |
| `src/hooks/useProjects.ts` | Project CRUD operations, status management |
| `src/hooks/useCopyToClipboard.ts` | Clipboard API wrapper |
| `src/utils/messageTemplates.ts` | Auto-generated message templates |
| `src/utils/storage.ts` | localStorage persistence layer |
| `src/utils/helpers.ts` | Utility functions, validation, stats |
| `src/components/Header.tsx` | App header with branding |
| `src/components/StatsBar.tsx` | Dashboard statistics (5 cards) |
| `src/components/ProjectCard.tsx` | Project list item with status badge |
| `src/components/ProjectForm.tsx` | Create project form with validation |
| `src/components/ProjectDetail.tsx` | Detail modal with status updates |
| `src/components/MessageCard.tsx` | Reusable message display with copy |

**Project Status Workflow**: `quoted` → `sold` → `materials_ordered` → `materials_received` → `scheduled` → `in_progress` → `inspection_scheduled` → `complete`

**Auto-Generated Messages**:
- **Sold**: Project confirmed, next steps coming
- **Materials Ordered**: Materials on order with arrival date
- **Materials Received**: Materials arrived, scheduling build
- **Scheduled**: Build date confirmed, crew arrival time
- **In Progress**: Work underway, progress updates
- **Inspection Scheduled**: Build complete, inspection date
- **Complete**: Project ready, thank you, review request

Each status change generates:
1. SMS message (short, mobile-friendly)
2. Email message (subject + detailed body)

**Features**:
- Dashboard with stats (total, active, starting/completing this week, pending notifications)
- Filter projects by status
- Project management (create, view, update, delete)
- Status update interface with date parameters
- Pending notifications queue with copy buttons
- Mark sent tracking (SMS/email/both)
- Full status history timeline
- Customer info management
- Project notes and dates
- localStorage persistence

**Data Model**:
- Projects with customer info, status, dates, photos
- Status history with notification tracking
- Message templates with variable substitution
- Stats calculations (active, weekly counts)

---

### 7. Permit Tracker (`hdd-permit-tracker/`)

Track building permits and inspections for deck construction projects.

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, status enums, constants |
| `src/hooks/usePermits.ts` | Permit CRUD, inspection and document management |
| `src/hooks/useMunicipalities.ts` | Municipality management |
| `src/utils/storage.ts` | localStorage persistence, CSV export |
| `src/utils/dates.ts` | Date calculations, expiration checks |
| `src/data/municipalities.ts` | 14 pre-loaded Cincinnati area municipalities |
| `src/components/Header.tsx` | App header with branding |
| `src/components/StatsBar.tsx` | Dashboard statistics |
| `src/components/PermitList.tsx` | Permit list with filters |
| `src/components/PermitForm.tsx` | Create/edit permit form |
| `src/components/PermitDetail.tsx` | Detail view with tabs |
| `src/components/InspectionForm.tsx` | Add/edit inspection form |
| `src/components/MunicipalityManager.tsx` | Manage municipality info |
| `src/components/StatusBadge.tsx` | Status badge components |

**Permit Status Workflow**: `not_started` → `application_submitted` → `pending_review` → `revisions_required` → `approved` → `expired`

**Inspection Types**: Footing, Framing, Final, Electrical

**Inspection Status**: `not_scheduled` → `scheduled` → `completed` / `failed_reschedule`

**Features**:
- Dashboard with stats (total, in progress, pending review, needs attention, scheduled inspections)
- Filter permits by status
- Permit management (create, view, update, delete)
- Municipality info lookup (fees, requirements, contacts, approval times)
- Inspection scheduling and tracking
- Document attachment (placeholder for future upload)
- Status history timeline
- Estimated approval date calculation
- Expiration warnings (30-day alert)
- Pending too long warnings (>14 days)
- CSV export for reporting
- localStorage persistence

**Pre-loaded Municipalities**:
Cincinnati, Mason, West Chester, Liberty Township, Fairfield, Hamilton, Loveland, Blue Ash, Montgomery, Sharonville, Anderson Township, Indian Hill, Milford, Hamilton County (unincorporated)

**Data Model**:
- Permits with customer info, status, dates, fees, contacts
- Status history with timestamps and notes
- Inspections with type, status, result, corrections
- Documents with metadata
- Municipalities with fees, requirements, contacts, avg approval time

---

### 8. Material Calculator (`hdd-material-calculator/`)

Calculate lumber, hardware, concrete, and materials needed for deck construction.

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, material categories, pricing |
| `src/utils/calculations.ts` | Core calculation logic for all materials |
| `src/utils/storage.ts` | localStorage persistence, clipboard/CSV export |
| `src/components/Header.tsx` | App header with navigation |
| `src/components/DeckConfigForm.tsx` | Configuration form (dimensions, materials, options) |
| `src/components/MaterialsList.tsx` | Results display with copy/save/export |
| `src/components/SavedCalculations.tsx` | Saved calculations manager |

**Input Configuration**:
- Dimensions (length, width, height)
- Deck style (ground level, elevated, freestanding)
- Decking material (PT pine, cedar, composite standard/premium)
- Framing material (PT pine, cedar)
- Joist spacing (12", 16", 24" O.C.)
- Decking direction (parallel/perpendicular to house)
- Railing style (none, wood, composite, aluminum, cable)
- Stairs (optional, width options)
- Waste factor (5-20%)

**Calculated Materials**:
- **Decking**: Deck boards, fascia
- **Framing**: Joists, rim joists, ledger, beam, posts, blocking
- **Hardware**: Joist hangers, post brackets, lag bolts, flashing, screws
- **Concrete**: Sono tubes, concrete bags, gravel
- **Railing**: Posts, rails, balusters, brackets
- **Stairs**: Stringers, treads, railing kits, landing pads

**Features**:
- Real-time calculation as you adjust settings
- Summary stats (joists, posts, footings, estimated cost)
- Copy full material list to clipboard
- Export to CSV for supplier ordering
- Save calculations with customer/project info
- Load saved calculations
- Material quantity includes waste factor
- Automatic railing requirement (height > 30")
- Proper lumber sizing based on span

---

### 9. Job Costing (`hdd-job-costing/`)

Track project costs, expenses, and profitability for deck construction projects.

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, cost categories, status enums |
| `src/utils/storage.ts` | localStorage persistence, project/expense calculations, CSV export |
| `src/hooks/useProjects.ts` | Project CRUD, expense management |
| `src/components/Header.tsx` | App header with navigation |
| `src/components/StatsBar.tsx` | Dashboard statistics (6 cards) |
| `src/components/StatusBadge.tsx` | Project and category badges |
| `src/components/ProjectList.tsx` | Project list with filters, cost bars |
| `src/components/ProjectForm.tsx` | Create/edit project form |
| `src/components/ProjectDetail.tsx` | Detail modal with tabs |
| `src/components/ExpenseForm.tsx` | Add/edit expense form |
| `src/components/CostBreakdown.tsx` | Visual cost breakdown by category |

**Project Status Workflow**: `estimating` → `quoted` → `in_progress` → `completed` / `cancelled`

**Cost Categories**:
- Materials (green)
- Labor (blue)
- Permits & Fees (purple)
- Equipment (amber)
- Subcontractor (pink)
- Overhead (gray)
- Other (teal)

**Features**:
- Dashboard with stats (total projects, active, revenue, costs, profit, avg margin)
- Filter projects by status and search
- Project management (create, view, update, delete)
- Cost breakdown visualization (colored bar chart)
- Expense tracking with category, vendor, quantity, unit cost
- Auto-calculated totals and profit margins
- Profit/loss indicators with color coding
- Quick status change from detail view
- Export projects to CSV
- Export individual project expenses to CSV
- localStorage persistence

**Data Model**:
- Projects with customer info, quote amount, status, dates
- Expenses with category, description, vendor, quantity, unit cost
- Auto-calculated: total costs, profit, profit margin
- Category summaries with percentages

---

### 10. Supplier Tracker (`hdd-supplier-tracker/`)

Compare material prices across multiple suppliers.

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, categories, default data |
| `src/utils/storage.ts` | localStorage, calculations, CSV export |
| `src/hooks/useSupplierData.ts` | Supplier, material, price CRUD operations |
| `src/components/Header.tsx` | App header with navigation |
| `src/components/StatsBar.tsx` | Dashboard statistics (5 cards) |
| `src/components/PriceComparisonTable.tsx` | Main price matrix view |
| `src/components/SupplierList.tsx` | Manage suppliers |
| `src/components/MaterialList.tsx` | Manage materials |
| `src/components/PriceForm.tsx` | Add/edit price modal |

**Pre-loaded Data**:
- 5 suppliers: Home Depot, Lowe's, 84 Lumber, Carter Lumber, ABC Supply
- 24 materials: Decking, framing, hardware, concrete, railing, fasteners

**Material Categories**:
- Decking (PT pine, Trex, TimberTech)
- Framing Lumber (joists, beams, posts)
- Hardware (hangers, brackets, bolts)
- Concrete & Footings (bags, sono tubes, gravel)
- Railing (posts, rails, balusters)
- Fasteners & Screws (deck screws, hidden fasteners)

**Features**:
- Price comparison table (materials × suppliers)
- Lowest price highlighting with checkmark
- Preferred supplier marking (star)
- Price history tracking with change percentage
- Add/edit prices with effective date
- Filter by category and search
- Supplier management (CRUD, preferred flag)
- Material management (CRUD, categories, units)
- Dashboard stats (materials, suppliers, price entries, savings opportunity)
- Export to CSV
- localStorage persistence

---

### 11. Customer Portal (`hdd-customer-portal/`)

Customer-facing portal for viewing project status, photos, documents, and communicating with the team.

| File | Purpose |
|------|---------|
| `src/types/index.ts` | TypeScript interfaces, status enums, demo data |
| `src/utils/storage.ts` | localStorage persistence, session management |
| `src/hooks/usePortalData.ts` | Customer and admin portal hooks |
| `src/components/CustomerLogin.tsx` | Access code login form |
| `src/components/CustomerDashboard.tsx` | Main customer view |
| `src/components/ProjectCard.tsx` | Project summary card |
| `src/components/ProjectDetail.tsx` | Full project detail with tabs |
| `src/components/ProjectTimeline.tsx` | Visual status progress |
| `src/components/PhotoGallery.tsx` | Photo viewer with lightbox |
| `src/components/DocumentList.tsx` | Document list by type |
| `src/components/UpdatesList.tsx` | Status updates timeline |
| `src/components/ContactCard.tsx` | Contact info and message form |
| `src/components/Header.tsx` | Portal header with user info |
| `src/components/StatusBadge.tsx` | Status badge component |

**Project Status Workflow**: `quote_sent` → `quote_accepted` → `permit_pending` → `permit_approved` → `materials_ordered` → `scheduled` → `in_progress` → `inspection_scheduled` → `complete`

**Customer Features**:
- Access code login (no password required)
- Project overview with status badge
- Visual progress timeline (9 steps)
- Status updates feed with dates
- Photo gallery with before/during/after filtering
- Document list (quote, contract, permit, warranty)
- Send messages to the team
- Contact info with phone, email, website

**Data Model**:
- Customers with access codes
- Projects with status, dates, crew info
- Photos with stages and captions
- Documents with types
- Updates/messages with timestamps
- Session persistence

**Demo Data**:
- Demo code: `SMITH2024`
- Demo customer: John Smith, Cincinnati
- Demo project: Smith Composite Deck (scheduled status)

---

### 12. Quote Calculator (`hdd-quote-calculator/`)

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

### 13. Dashboard (`hdd-dashboard/`)

Central hub for all tools.

| File | Purpose |
|------|---------|
| `index.html` | Dashboard page with tool cards |
| `styles.css` | Responsive grid styling |
| `config.js` | Tool definitions and status |

---

## Development Tools (Enhanced)

These Vite/React projects were enhanced with production features:

| Tool | Purpose | Status |
|------|---------|--------|
| Photo Manager | Organize before/after photos | **Production** - Vercel Blob cloud storage |
| Referral Tracker | Track leads and referral codes | **Production** - CSV import/export, rewards, analytics |
| Warranty Tracker | Track warranties, schedule checkups | **Production** - Resend email, anniversary engine |
| Weather Content | Weather-based content suggestions + GBP integration | Ready |
| Competitor Monitor | Track competitor Google ratings | Scaffolded |

All share: React 19, TypeScript, Tailwind CSS v4, Vite 7

### Recent Enhancements (2026-02-03)

**Photo Manager** - Cloud storage upgrade:
- Vercel Blob integration (unlimited storage vs 5MB localStorage)
- Automatic migration from base64 to cloud URLs
- Upload/delete API endpoints

**Referral Tracker** - Full feature completion:
- CSV import/export with validation
- Referral Reward Manager (configurable tiers, payout tracking)
- Enhanced analytics (date filters, conversion funnel)
- Duplicate detection
- Lead Response JSON integration ready

**Warranty Tracker** - Email + lifecycle marketing:
- Resend API integration for email delivery
- Customer Anniversary Engine (4 milestones)
- 30-day review, 6-month maintenance, 1-year anniversary, annual check-in
- Email history tracking per customer

**Lead Response** - Production hardening:
- Webhook idempotency (24hr MessageSid dedup)
- SMS rate limiting (1min interval, 5/day per lead)
- Sequence expiration (30-day auto-close)

#### Weather Content Details

Generates smart content suggestions based on Cincinnati weather (NWS API).

**Features**:
- Real-time weather data from National Weather Service
- 7-day forecast display
- Context-aware content generation (temperature, conditions, season)
- Suggestion types: GBP posts, social media, email campaigns
- **GBP Post Scheduler integration** - Create drafts with one click

**Weather-Triggered Content**:
- Perfect weather (65-85°F, sunny) → Deck weather posts
- Nice weekend ahead → Weekend preview posts
- Rainy days → Planning/indoor activity posts
- Cold weather (<45°F) → Winter planning campaigns
- Hot weather (>85°F) → Composite decking benefits
- Spring/Fall seasons → Seasonal booking pushes

**GBP Integration**:
- "Create GBP Draft" button on GBP-type suggestions
- Modal to review/edit before sending
- Direct creation in GBP Post Scheduler as draft
- Auto-opens edit page in new tab
- Requires `.env` configuration (see `INTEGRATION.md`)

**Files**:
- `src/App.tsx` - Main component with weather fetching
- `src/lib/gbpApi.ts` - GBP Post Scheduler API client
- `src/components/CreateDraftModal.tsx` - Draft creation modal
- `src/components/Toast.tsx` - Toast notifications
- `src/types/index.ts` - TypeScript types
- `INTEGRATION.md` - Setup and usage guide

---

## Launcher Tools

### launcher.py

Python CLI to launch all tools interactively.

```bash
python launcher.py
```

Features:
- 12 tools organized by type (Static/Vite/Next.js)
- Launch individual, groups, or all
- **Production mode** (`P`) - launches only 5 essential tools
- **Resource warnings** - confirms before launching all 8 servers
- **Staggered startup** - waits for each server to be ready
- **Browser toggle** (`B`) - option to start servers without opening tabs
- Auto npm install if needed
- Process tracking

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

### Weather Content

| Service | Purpose |
|---------|---------|
| NWS API | Real-time weather data (no API key needed) |
| GBP Post Scheduler | Draft creation via internal API |

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
| Dashboard | Ready | Static HTML |
| Sentiment Router | Ready | Static HTML |
| Quote Calculator | Ready | Static HTML |
| Review Generator | Ready | Dependencies installed |
| Quote Tracker | Ready | Dependencies installed, fully functional |
| Project Messenger | Ready | Dependencies installed, fully functional |
| Photo Manager | Ready | Dependencies installed, localStorage-based |
| Referral Tracker | Ready | Dependencies installed, scaffolded |
| Warranty Tracker | Ready | Dependencies installed, scaffolded |
| Weather Content | Ready | Fully functional, GBP integration ready |
| Competitor Monitor | Ready | Dependencies installed, scaffolded |
| Permit Tracker | Ready | Dependencies installed, fully functional |
| Material Calculator | Ready | Dependencies installed, fully functional |
| Job Costing | Ready | Dependencies installed, fully functional |
| Supplier Tracker | Ready | Dependencies installed, fully functional |
| Customer Portal | Ready | Dependencies installed, fully functional |
| GBP Post Scheduler | Needs Setup | Requires .env configuration |
| Lead Response | Needs Setup | Requires .env configuration |

---

## Quick Reference

```bash
# Static tools (open in browser)
hdd-dashboard/index.html
hdd-sentiment-router/index.html
hdd-quote-calculator/index.html

# React tools
cd hdd-review-generator && npm run dev  # :5173
cd hdd-quote-tracker && npm run dev     # :5179
cd hdd-project-messenger && npm run dev # :5180
cd hdd-material-calculator && npm run dev # :5181
cd hdd-job-costing && npm run dev       # :5182
cd hdd-supplier-tracker && npm run dev  # :5183
cd hdd-permit-tracker && npm run dev    # :5184
cd hdd-customer-portal && npm run dev   # :5185

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

### Encryption & Authentication
- Google tokens encrypted with AES-256-GCM at rest
- Franchise isolation on all queries
- API endpoints protected with Bearer token authentication
- Magic link authentication via Resend (no passwords stored)

### Rate Limiting & Protection
- Rate limiting on AI generation (10/hour/user)
- External API rate limiting (20/hour/franchise)
- SMS rate limiting (1min interval, 5/day per lead)
- Webhook idempotency (24hr deduplication)

### Input Validation
- Zod schema validation on all API inputs
- Magic byte validation for image uploads (prevents MIME spoofing)
- File extension validation on uploads
- RFC 5322 compliant email validation
- CSV injection prevention on exports

### Security Headers
- Content-Security-Policy on all static HTML pages
- X-Content-Type-Options, X-Frame-Options headers
- HSTS, Referrer-Policy on Next.js apps
- Permissions-Policy restricting camera/microphone/geolocation

### Webhook Security
- HMAC signature verification (timing-safe comparison)
- Twilio signature verification
- OAuth state parameter with cryptographic nonce

### Other
- Cron endpoints protected by secret
- No secrets committed (all use .env)
- Demo mode disabled in production
- Client-side console logging disabled in production builds

### Security Audit (2026-02-03)

Comprehensive security audit completed with fixes across all severity levels:

| Severity | Issues Found | Fixed |
|----------|--------------|-------|
| Critical | 4 | 4 |
| High | 6 | 6 |
| Medium | 8 | 8 |
| Low | 6 | 6 |
| Informational | 5 | 5 |

**Critical fixes**: API endpoint authentication (Photo Manager, Warranty Tracker)
**High fixes**: Demo mode bypass, CSV injection, Next.js CVEs, API key exposure, MIME validation
**Medium fixes**: Rate limiting, input validation, timing attacks, OAuth CSRF, error leakage
**Low fixes**: CSP headers, email regex, file extensions, console logging, demo credentials
**Informational fixes**: security.txt, robots.txt, placeholder phone documentation, localhost fallback removal
