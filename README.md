# HDD Marketing Tools

Marketing and customer feedback tools for Hickory Dickory Decks franchisees.

## Projects

### 1. Sentiment Router (`hdd-sentiment-router/`)

A lightweight, static landing page that routes customers based on their satisfaction level. Happy customers go directly to Google Reviews. Unhappy customers are redirected to a private feedback form, protecting the franchise's public rating.

**Stack**: Pure HTML, CSS, JavaScript (no build step)

**Features**:
- Two-button sentiment check (Great! / Could be better)
- Private feedback form for unhappy customers
- Redirects happy customers to Google Reviews
- Mobile-first responsive design
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

A React web application that generates personalized review request messages for franchisees. Creates ready-to-copy SMS messages, emails, and thank you card text based on project and customer details.

**Stack**: React 19, TypeScript, Tailwind CSS v4, Vite 7

**Features**:
- Generate Day 3 SMS, Day 7 Email, and Day 14 Thank You Card messages
- One-click copy to clipboard with visual feedback
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

## Deployment

Both projects are static and can be deployed to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Franchise's existing web hosting

No backend or environment variables required for either project.

## Project Structure

```
HDD/
├── hdd-sentiment-router/      # Static sentiment routing page
│   ├── index.html             # Main landing page
│   ├── feedback.html          # Private feedback form
│   ├── thank-you.html         # Confirmation page
│   ├── styles.css             # Styling
│   ├── script.js              # Routing logic
│   ├── config.js              # Franchise settings
│   └── README.md              # Setup instructions
│
├── hdd-review-generator/      # React message generator
│   ├── src/                   # React source code
│   ├── package.json           # Dependencies
│   └── README.md              # Setup instructions
│
├── hdd-sentiment-router-spec.md   # Build specification
├── hdd-review-generator-spec.md   # Build specification
└── hickory-dickory-decks-marketing-plan.md  # Marketing strategy
```
