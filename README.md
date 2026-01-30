# HDD Marketing Tools

Marketing and customer feedback tools for Hickory Dickory Decks franchisees.

**[Implementation & Testing Guide](IMPLEMENTATION_GUIDE.md)** contains complete setup, testing checklists, and deployment instructions.

---

## Projects

### 1. Sentiment Router (`hdd-sentiment-router/`)

A lightweight, static landing page that routes customers based on their satisfaction level. Happy customers go directly to Google Reviews. Unhappy customers are redirected to a private feedback form, protecting the franchise's public rating.

**Stack**: Pure HTML, CSS, JavaScript (no build step)

**Features**:
- Two button sentiment check (Great! / Could be better)
- Private feedback form for unhappy customers
- Redirects happy customers to Google Reviews
- Mobile first responsive design
- Configurable for multiple franchise locations
- Supports Formspree, mailto, or Google Forms

**Quick Start**:
```bash
cd hdd-sentiment-router
# Edit config.js with your franchise settings
# Open index.html in browser to test
# Deploy to any static host
```

[Full documentation](hdd-sentiment-router/README.md)

---

### 2. Review Request Generator (`hdd-review-generator/`)

A React web application that generates personalized review request messages for franchisees. Creates ready to copy SMS messages, emails, and thank you card text based on project and customer details.

**Stack**: React 19, TypeScript, Tailwind CSS v4, Vite 7

**Features**:
- Generate Day 3 SMS, Day 7 Email, and Day 14 Thank You Card messages
- One click copy to clipboard with visual feedback
- Form validation with inline error messages
- Form data persistence (franchisee name and review link saved to localStorage)
- SMS character count with segment warnings

**Quick Start**:
```bash
cd hdd-review-generator
npm install
npm run dev
```

[Full documentation](hdd-review-generator/README.md)

---

### 3. GBP Post Scheduler (`hdd-gbp-poster/`)

A full-stack web application for creating, reviewing, and automatically publishing posts to Google Business Profile. Features AI-powered draft generation, human review workflow, image management, and scheduled publishing.

**Stack**: Next.js 14, TypeScript, Tailwind CSS v4, Prisma, NextAuth.js, Claude AI, Google Business Profile API, Vercel

**Features**:
- AI-powered post generation (project showcases, educational content, seasonal posts)
- Human review workflow (draft → review → approve → schedule → publish)
- Image library with upload and metadata management
- Scheduled publishing via Vercel Cron
- Google Business Profile OAuth integration
- Multi-user support with admin and editor roles
- Calendar view for scheduled posts

**Quick Start**:
```bash
cd hdd-gbp-poster
npm install
cp .env.example .env
# Fill in environment variables
npx prisma db push
npx prisma db seed
npm run dev
```

[Full documentation](hdd-gbp-poster/README.md) | [Build specification](hdd-gbp-poster-spec.md)

---

## Deployment

| Project | Hosting | Backend Required |
|---------|---------|------------------|
| Sentiment Router | Any static host | No |
| Review Generator | Any static host | No |
| GBP Post Scheduler | Vercel | Yes (Neon PostgreSQL) |

---

## Project Structure

```
HDD/
├── IMPLEMENTATION_GUIDE.md           # Setup, testing, deployment instructions
├── hdd-sentiment-router/             # Static sentiment routing page
│   ├── index.html                    # Main landing page
│   ├── feedback.html                 # Private feedback form
│   ├── thank-you.html                # Confirmation page
│   ├── styles.css                    # Styling
│   ├── script.js                     # Routing logic
│   ├── config.js                     # Franchise settings
│   └── README.md                     # Setup instructions
│
├── hdd-review-generator/             # React message generator
│   ├── src/                          # React source code
│   ├── dist/                         # Production build output
│   ├── package.json                  # Dependencies
│   └── README.md                     # Setup instructions
│
├── hdd-gbp-poster/                   # Next.js GBP post scheduler
│   ├── app/                          # Next.js App Router pages
│   ├── components/                   # React components
│   ├── lib/                          # Server utilities
│   ├── prisma/                       # Database schema
│   ├── .env.example                  # Environment template
│   └── README.md                     # Setup instructions
│
├── hdd-sentiment-router-spec.md      # Sentiment router specification
├── hdd-gbp-poster-spec.md            # GBP poster specification
├── hickory-dickory-decks-marketing-plan.md  # Marketing strategy
└── README.md                         # This file
```

---

## For Franchisees

**Review Generator**: Go to the app URL, fill in customer details, click Generate, copy the messages you need.

**Sentiment Router**: After completing a project, send customers this link instead of your Google Review link directly. Happy customers still get to Google Reviews. Unhappy customers send feedback to you privately, giving you a chance to resolve issues before they post publicly.

**GBP Post Scheduler**: Log in with your email, generate AI drafts or write posts manually, attach images, schedule for publishing. Posts automatically publish to your Google Business Profile at the scheduled time.
