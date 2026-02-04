# HDD Marketing Tools Platform

## Complete Marketing & Operations Suite for Deck Builders

**21 Tools** | **React + TypeScript** | **Zero Backend Required**

---

## Customer Acquisition & Marketing

| Tool | What It Does |
|------|--------------|
| **Quote Calculator** | Customer-facing deck estimate tool - captures leads |
| **Lead Response System** | Automated SMS/email follow-up sequences |
| **Sentiment Router** | Routes happy customers to Google Reviews, unhappy to private feedback |
| **Review Generator** | Creates personalized review request messages (Day 3/7/14) |
| **Referral Tracker** | Track lead sources and referral codes |
| **Campaign Manager** | 12 pre-built seasonal marketing campaigns (spring/summer/fall/winter) |
| **Weather Content** | Auto-suggests posts based on Cincinnati weather |
| **GBP Post Scheduler** | AI-powered Google Business Profile posts with human review |

## Project Management & Operations

| Tool | What It Does |
|------|--------------|
| **Quote Tracker** | Track quotes, follow-up sequences, conversion funnel |
| **Permit Tracker** | Manage permits, inspections, municipality requirements |
| **Project Messenger** | Automated milestone communications (sold → complete) |
| **Material Calculator** | Calculate lumber, hardware, concrete for any deck |
| **Job Costing** | Track expenses, labor, profit margins per project |
| **Supplier Tracker** | Compare prices across 5 suppliers, find lowest costs |

## Customer Experience

| Tool | What It Does |
|------|--------------|
| **Customer Portal** | Customers view project status, photos, documents, timeline |
| **Customer Survey** | Post-project NPS surveys with scoring (-100 to +100) |
| **Before/After Slider** | Interactive image comparisons for social media |

## Content & Media

| Tool | What It Does |
|------|--------------|
| **Photo Manager** | Organize before/after photos by project, material, neighborhood |
| **Competitor Monitor** | Track local competitor Google ratings |
| **Warranty Tracker** | Track warranties, send anniversary emails |

---

## Key Highlights

### No Backend Required
- All tools run in the browser
- Data stored in localStorage
- No servers to maintain

### Production Ready
- 13 tools fully functional today
- CSV export on all data
- Mobile-responsive design

### Franchise Customized
- Cincinnati phone numbers
- Local supplier pricing
- Area municipalities pre-loaded

### AI-Powered
- Claude AI generates GBP posts
- Weather-triggered content suggestions
- Smart follow-up sequences

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total Tools | 21 |
| Production Ready | 13 |
| Pre-built Templates | 12 seasonal campaigns |
| Default Suppliers | 5 (Home Depot, Lowe's, 84 Lumber, Carter, ABC) |
| Municipalities | 14 Cincinnati area |
| Survey Questions | 7 default NPS questions |

---

## Technology Stack

```
Frontend:  React 19 + TypeScript + Tailwind CSS v4
Build:     Vite 7
Backend:   Next.js 14 (2 tools only)
Database:  Neon PostgreSQL (2 tools only)
AI:        Claude API (GBP posts)
SMS:       Twilio (Lead Response)
Email:     Resend (magic links, notifications)
```

---

## Demo Commands

```bash
# Launch everything
python launcher.py

# Or launch individually
cd hdd-quote-tracker && npm run dev      # Quote management
cd hdd-customer-portal && npm run dev    # Customer view
cd hdd-job-costing && npm run dev        # Cost tracking
cd hdd-campaign-manager && npm run dev   # Marketing campaigns
cd hdd-customer-survey && npm run dev    # NPS surveys
cd hdd-before-after && npm run dev       # Image sliders
```

---

## Workflow Example: New Lead to Completed Project

```
1. LEAD COMES IN
   └─ Quote Calculator generates estimate
   └─ Lead Response sends instant SMS + email
   └─ Quote Tracker logs the lead

2. QUOTE ACCEPTED
   └─ Project Messenger sends confirmation
   └─ Permit Tracker initiates permit application
   └─ Material Calculator generates supply list

3. BUILD PHASE
   └─ Job Costing tracks expenses
   └─ Customer Portal shows progress
   └─ Project Messenger sends milestone updates

4. PROJECT COMPLETE
   └─ Customer Survey sent (NPS scoring)
   └─ Before/After Slider created for marketing
   └─ Review Generator sends review request
   └─ Sentiment Router captures feedback
```

---

**Built for Hickory Dickory Decks Cincinnati**
Nathan & Brinton Ricke | (513) Area

*Platform developed with Claude Code*
