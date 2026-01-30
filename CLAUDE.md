# HDD Marketing Tools

## Overview

Marketing and customer feedback tools for Hickory Dickory Decks franchisees. Two standalone projects:

1. **Sentiment Router** - Static HTML page for routing customer feedback
2. **Review Generator** - React app for generating review request messages

## Architecture

Both projects are frontend-only with no backend dependencies.

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

## No Backend

Neither project requires a backend, API keys, or environment variables. All functionality is client-side.
