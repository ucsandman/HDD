# HDD Marketing Tools - Overview & Testing Guide

A comprehensive guide to all 21 marketing and automation tools for Hickory Dickory Decks franchisees.

---

## Quick Reference

| Category | Tools | Tech Stack |
|----------|-------|------------|
| Static HTML | 3 | HTML/CSS/JS (no build) |
| React/Vite | 16 | React 19, TypeScript, Tailwind v4 |
| Next.js Full-Stack | 2 | Next.js 14, Prisma, PostgreSQL |

---

## Tier 1: Static HTML Tools

These tools require no build step. Simply open the HTML file in a browser.

### 1. Dashboard (`hdd-dashboard/`)

**Purpose**: Central hub that links to all other tools in the suite.

**What it does**:
- Displays tool cards organized by category
- Shows tool status (ready, needs setup, in development)
- Provides quick access to all HDD marketing tools

**How to test**:
```bash
# Open directly in browser
start hdd-dashboard/index.html
```

**Test checklist**:
- [ ] All tool cards display correctly
- [ ] Links to static tools work (open in same tab)
- [ ] Links to dev server tools show correct ports
- [ ] Responsive layout works on mobile/tablet/desktop

---

### 2. Sentiment Router (`hdd-sentiment-router/`)

**Purpose**: Routes customer feedback based on satisfaction level to protect Google ratings.

**What it does**:
- Shows two buttons: "Great!" and "Could be better"
- Happy customers → Google Review page
- Unhappy customers → Private feedback form
- Prevents negative reviews from reaching Google

**How to test**:
```bash
# Open directly in browser
start hdd-sentiment-router/index.html
```

**Test checklist**:
- [ ] "Great!" button redirects to Google review URL (check config.js)
- [ ] "Could be better" button goes to feedback.html
- [ ] Feedback form validates required fields
- [ ] Form submission works (Formspree or mailto fallback)
- [ ] Thank you page displays after submission
- [ ] Mobile responsive design works

---

### 3. Quote Calculator (`hdd-quote-calculator/`)

**Purpose**: Customer-facing deck estimate calculator for website embedding.

**What it does**:
- Takes deck dimensions (length, width, height)
- Selects material type and features
- Calculates instant price estimate
- Shows breakdown of costs

**How to test**:
```bash
# Open directly in browser
start hdd-quote-calculator/index.html
```

**Test checklist**:
- [ ] Dimension inputs accept valid numbers
- [ ] Material selection updates price multiplier
- [ ] Height adjustment adds to total correctly
- [ ] Features (railing, stairs) add correctly
- [ ] Total calculation matches formula in config.js
- [ ] Mobile layout works for form inputs

---

## Tier 2: React/Vite Tools

These tools require `npm run dev` to start a local development server.

### 4. Review Generator (`hdd-review-generator/`) - Port 5173

**Purpose**: Generate personalized review request messages from customer details.

**What it does**:
- Input customer name, project type, city
- Generates 3 message templates:
  - Day 3 SMS (short, with review link)
  - Day 7 Email (subject + body)
  - Day 14 Thank You Card (physical card text)
- One-click copy to clipboard

**How to test**:
```bash
cd hdd-review-generator
npm install   # First time only
npm run dev
# Opens at http://localhost:5173
```

**Test checklist**:
- [ ] Form validates required fields
- [ ] Form data persists in localStorage
- [ ] All 3 message templates generate correctly
- [ ] Customer name appears in messages
- [ ] City reference appears in email
- [ ] Copy buttons work (check clipboard)
- [ ] SMS stays under 320 characters

---

### 5. Quote Tracker (`hdd-quote-tracker/`) - Port 5179

**Purpose**: Track quotes from Quote Calculator and automate follow-up sequences.

**What it does**:
- Dashboard with metrics (total quotes, pending, conversion rate)
- Quote list with status filtering
- Follow-up sequence (24h, 72h, 7d, 14d)
- Message templates with copy buttons
- CSV export for reporting

**How to test**:
```bash
cd hdd-quote-tracker
npm install
npm run dev
# Opens at http://localhost:5179
```

**Test checklist**:
- [ ] Create new quote with customer info
- [ ] Quote appears in list with "Sent" status
- [ ] Dashboard stats update correctly
- [ ] Status progression works (sent → viewed → followup1, etc.)
- [ ] Follow-up messages generate with correct dates
- [ ] Copy buttons work for SMS and email templates
- [ ] CSV export downloads valid file
- [ ] Data persists after page refresh (localStorage)

---

### 6. Project Messenger (`hdd-project-messenger/`) - Port 5180

**Purpose**: Automated milestone communication for active deck construction projects.

**What it does**:
- Track projects through 8 status stages
- Auto-generate SMS and email for each milestone
- Dashboard with active projects and pending notifications
- Status history timeline
- Mark messages as sent

**How to test**:
```bash
cd hdd-project-messenger
npm install
npm run dev
# Opens at http://localhost:5180
```

**Test checklist**:
- [ ] Create new project with customer info
- [ ] Project appears with initial status
- [ ] Update status generates appropriate messages
- [ ] SMS and email templates are contextually correct
- [ ] "Mark as Sent" tracking works
- [ ] Status history shows timeline
- [ ] Dashboard stats (active, starting this week) calculate correctly
- [ ] Filter by status works

---

### 7. Customer Survey (`hdd-customer-survey/`) - Port 5188

**Purpose**: Post-project NPS (Net Promoter Score) satisfaction surveys.

**What it does**:
- Create surveys for completed projects
- Customer access via unique code
- 7 default questions (NPS, ratings, yes/no, text)
- NPS calculation and gauge visualization
- Response analytics and CSV export

**How to test**:
```bash
cd hdd-customer-survey
npm install
npm run dev
# Opens at http://localhost:5188
```

**Test checklist**:
- [ ] Create new survey for a customer
- [ ] Survey gets unique access code
- [ ] Preview shows customer-facing view
- [ ] Demo mode lets you fill out survey
- [ ] NPS score calculates correctly (9-10 promoter, 7-8 passive, 0-6 detractor)
- [ ] Response charts display correctly
- [ ] Stats update after responses
- [ ] CSV export works

**Customer view test**:
- [ ] Access survey via `?code=XXXX` URL parameter
- [ ] All question types render correctly
- [ ] Submit button validates required fields
- [ ] Thank you page shows after submission

---

### 8. Permit Tracker (`hdd-permit-tracker/`) - Port 5184

**Purpose**: Track building permits and inspections for deck construction.

**What it does**:
- Manage permits through approval workflow
- Pre-loaded Cincinnati area municipalities (14)
- Schedule and track inspections
- Expiration and delay warnings
- Municipality info lookup (fees, contacts, requirements)

**How to test**:
```bash
cd hdd-permit-tracker
npm install
npm run dev
# Opens at http://localhost:5184
```

**Test checklist**:
- [ ] Create permit with customer and project info
- [ ] Municipality dropdown shows 14 pre-loaded options
- [ ] Selecting municipality shows contact info and fees
- [ ] Status progression works correctly
- [ ] Add inspection with type and date
- [ ] Inspection status updates (scheduled → completed/failed)
- [ ] Expiration warning shows for approved permits
- [ ] "Pending too long" warning appears after 14 days
- [ ] CSV export works

---

### 9. Material Calculator (`hdd-material-calculator/`) - Port 5181

**Purpose**: Calculate lumber, hardware, concrete, and materials for deck construction.

**What it does**:
- Input deck dimensions and configuration
- Select materials (PT pine, cedar, composite)
- Calculate all required materials with quantities
- Apply waste factor (5-20%)
- Save and export calculations

**How to test**:
```bash
cd hdd-material-calculator
npm install
npm run dev
# Opens at http://localhost:5181
```

**Test checklist**:
- [ ] Enter dimensions (20x12x3 standard test)
- [ ] Select different decking materials (price changes)
- [ ] Change joist spacing (quantities change)
- [ ] Add railing option (railing materials appear)
- [ ] Add stairs (stair materials appear)
- [ ] Waste factor adjusts quantities
- [ ] Copy material list works
- [ ] Export to CSV works
- [ ] Save calculation with project name
- [ ] Load saved calculation restores all settings

---

### 10. Job Costing (`hdd-job-costing/`) - Port 5182

**Purpose**: Track project costs, expenses, and profitability.

**What it does**:
- Create projects with quote amounts
- Track expenses by category (materials, labor, permits, etc.)
- Calculate profit and margin automatically
- Visual cost breakdown charts
- Export to CSV

**How to test**:
```bash
cd hdd-job-costing
npm install
npm run dev
# Opens at http://localhost:5182
```

**Test checklist**:
- [ ] Create project with $15,000 quote
- [ ] Add expenses in different categories
- [ ] Total cost sums correctly
- [ ] Profit = Quote - Total Cost
- [ ] Margin % calculates correctly
- [ ] Cost breakdown bar shows category proportions
- [ ] Profit indicator shows green (profit) or red (loss)
- [ ] Status changes update dashboard stats
- [ ] Export project expenses to CSV

---

### 11. Supplier Tracker (`hdd-supplier-tracker/`) - Port 5183

**Purpose**: Compare material prices across multiple suppliers.

**What it does**:
- Pre-loaded with 5 suppliers and 24 materials
- Price comparison matrix
- Highlight lowest prices
- Mark preferred suppliers
- Track price history

**How to test**:
```bash
cd hdd-supplier-tracker
npm install
npm run dev
# Opens at http://localhost:5183
```

**Test checklist**:
- [ ] Price comparison table loads with demo data
- [ ] Lowest price highlighted with checkmark
- [ ] Add new price for existing material/supplier
- [ ] Price history shows previous entries
- [ ] Mark supplier as preferred (star)
- [ ] Add new supplier
- [ ] Add new material with category
- [ ] Filter by category works
- [ ] Search filters materials
- [ ] CSV export works

---

### 12. Customer Portal (`hdd-customer-portal/`) - Port 5185

**Purpose**: Customer-facing portal to view project status, photos, and communicate.

**What it does**:
- Customer login via access code (no password)
- Project status timeline (9 stages)
- Photo gallery with before/during/after
- Document list (quote, contract, permit, warranty)
- Send messages to team

**How to test**:
```bash
cd hdd-customer-portal
npm install
npm run dev
# Opens at http://localhost:5185
```

**Test checklist**:
- [ ] Login with demo code: `SMITH2024`
- [ ] Dashboard shows project overview
- [ ] Status timeline shows current stage highlighted
- [ ] Photo gallery displays images
- [ ] Filter photos by stage works
- [ ] Document list shows available docs
- [ ] Updates feed shows status history
- [ ] Contact form allows sending message
- [ ] Logout returns to login screen

---

### 13. Before/After Slider (`hdd-before-after/`) - Port 5186

**Purpose**: Interactive image comparison slider for social media and website.

**What it does**:
- Upload before and after image URLs
- Interactive drag slider (horizontal or vertical)
- Generate embed code for websites
- Download as standalone HTML file

**How to test**:
```bash
cd hdd-before-after
npm install
npm run dev
# Opens at http://localhost:5186
```

**Test checklist**:
- [ ] Demo comparisons load with placeholder images
- [ ] Slider drags smoothly (mouse and touch)
- [ ] Switch between horizontal and vertical orientation
- [ ] Create new comparison with image URLs
- [ ] Preview mode works (hides UI for screenshots)
- [ ] Export modal shows embed code
- [ ] Copy embed code works
- [ ] Download HTML file works
- [ ] Downloaded HTML is self-contained and functional

---

### 14. Campaign Manager (`hdd-campaign-manager/`) - Port 5187

**Purpose**: Seasonal marketing campaign templates and scheduling.

**What it does**:
- Pre-built seasonal campaign templates
- Campaign calendar view
- Content templates for email, social, SMS
- Campaign performance tracking (placeholder)

**How to test**:
```bash
cd hdd-campaign-manager
npm install
npm run dev
# Opens at http://localhost:5187
```

**Test checklist**:
- [ ] Campaign list displays templates
- [ ] Filter by season/type works
- [ ] View campaign details
- [ ] Content templates display correctly
- [ ] Copy template content works
- [ ] Calendar view shows scheduled campaigns
- [ ] Create custom campaign works

---

### 15-19. Development Tools

These tools are scaffolded with basic functionality:

| Tool | Port | Purpose | Test Command |
|------|------|---------|--------------|
| Photo Manager | 5174 | Organize project photos | `cd hdd-photo-manager && npm run dev` |
| Referral Tracker | 5175 | Track leads and referral codes | `cd hdd-referral-tracker && npm run dev` |
| Warranty Tracker | 5176 | Track warranties | `cd hdd-warranty-tracker && npm run dev` |
| Weather Content | 5177 | Weather-based content suggestions | `cd hdd-weather-content && npm run dev` |
| Competitor Monitor | 5178 | Track competitor ratings | `cd hdd-competitor-monitor && npm run dev` |

**Basic test for each**:
- [ ] Dev server starts without errors
- [ ] Main page loads
- [ ] Basic UI renders correctly
- [ ] No console errors

---

## Tier 3: Next.js Full-Stack Tools

These require database setup and environment configuration.

### 20. GBP Post Scheduler (`hdd-gbp-poster/`) - Port 3000

**Purpose**: AI-powered Google Business Profile post creation with approval workflow.

**What it does**:
- AI generates post content using Claude
- Human review and approval workflow
- Schedule posts for future publishing
- Image library management
- Automatic publishing via cron

**Prerequisites**:
1. Copy `.env.example` to `.env`
2. Configure all 13 environment variables
3. Set up Neon PostgreSQL database
4. Run `npx prisma db push`

**How to test**:
```bash
cd hdd-gbp-poster
npm install
# Configure .env first!
npx prisma db push
npm run dev
# Opens at http://localhost:3000
```

**Test checklist** (requires full setup):
- [ ] Login page loads
- [ ] Magic link email sends (Resend)
- [ ] Dashboard shows stats
- [ ] Create new post (manual or AI-generated)
- [ ] Post appears in list with draft status
- [ ] Edit and approve post
- [ ] Schedule post for future date
- [ ] Image upload works
- [ ] Calendar view displays posts

---

### 21. Lead Response (`hdd-lead-response/`) - Port 3001

**Purpose**: Automated lead follow-up via SMS and email sequences.

**What it does**:
- Receive leads via webhook
- Automated follow-up sequence (instant, 4h, 24h, 72h, 7d)
- SMS via Twilio, Email via Resend
- Lead status tracking
- Message inbox

**Prerequisites**:
1. Copy `.env.example` to `.env`
2. Configure all 13 environment variables
3. Set up Neon PostgreSQL database
4. Configure Twilio for SMS
5. Run `npx prisma db push`

**How to test**:
```bash
cd hdd-lead-response
npm install
# Configure .env first!
npx prisma db push
npm run dev
# Opens at http://localhost:3001
```

**Test checklist** (requires full setup):
- [ ] Login page loads
- [ ] Dashboard shows lead stats
- [ ] Manually create new lead
- [ ] Lead appears with "New" status
- [ ] Sequence steps trigger messages
- [ ] Messages appear in inbox
- [ ] Lead status updates work
- [ ] Webhook endpoint accepts external leads

---

## Batch Testing Script

Run all Vite tools simultaneously:

```bash
# Windows batch (save as test-all.bat)
@echo off
start "Review Generator" cmd /k "cd hdd-review-generator && npm run dev"
start "Quote Tracker" cmd /k "cd hdd-quote-tracker && npm run dev"
start "Project Messenger" cmd /k "cd hdd-project-messenger && npm run dev"
start "Customer Survey" cmd /k "cd hdd-customer-survey && npm run dev"
start "Permit Tracker" cmd /k "cd hdd-permit-tracker && npm run dev"
start "Material Calc" cmd /k "cd hdd-material-calculator && npm run dev"
start "Job Costing" cmd /k "cd hdd-job-costing && npm run dev"
start "Supplier Tracker" cmd /k "cd hdd-supplier-tracker && npm run dev"
start "Customer Portal" cmd /k "cd hdd-customer-portal && npm run dev"
start "Before After" cmd /k "cd hdd-before-after && npm run dev"
echo All dev servers starting...
```

Or use the Python launcher:
```bash
python launcher.py
# Select 'A' to launch all, or individual tools by number
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `npm install` fails | Delete `node_modules` and `package-lock.json`, retry |
| Port already in use | Kill process on port: `npx kill-port 5173` |
| localStorage full | Clear browser storage for localhost |
| Vite hot reload not working | Restart dev server |
| Prisma client not generated | Run `npx prisma generate` |
| Database connection fails | Check DATABASE_URL in .env |

---

## Testing Priority

**Essential tools to test first**:
1. Dashboard - Entry point
2. Sentiment Router - Customer-facing
3. Quote Calculator - Customer-facing
4. Review Generator - Daily use
5. Quote Tracker - Sales workflow
6. Project Messenger - Operations

**Test when needed**:
- Permit Tracker - When starting permit process
- Material Calculator - When estimating materials
- Job Costing - When tracking project finances
- Customer Portal - Before customer handoff

**Full setup required**:
- GBP Post Scheduler - Needs API keys
- Lead Response - Needs Twilio + database
