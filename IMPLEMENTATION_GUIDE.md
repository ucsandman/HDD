# HDD Marketing Tools: Implementation & Testing Guide

This guide covers setup, testing, and deployment for both marketing tools built for Hickory Dickory Decks franchisees.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Review Request Generator](#review-request-generator)
3. [Sentiment Router](#sentiment-router)
4. [Deployment Options](#deployment-options)
5. [Franchisee Handoff Checklist](#franchisee-handoff-checklist)

---

## Quick Start

**What you need:**
- Node.js 20+ (for the Review Generator)
- A web browser (for the Sentiment Router)
- A code editor (VS Code recommended)

**What you do NOT need:**
- Backend server
- Database
- API keys
- Environment variables

---

## Review Request Generator

A React application that generates personalized review request messages (SMS, email, thank you card) from customer and project details.

### Setup

```bash
cd hdd-review-generator
npm install
npm run dev
```

The app runs at `http://localhost:5173`

### Testing Checklist

Open the app in your browser and verify each item:

#### Form Functionality

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| Leave all fields blank, click Generate | Validation errors appear for all required fields | ☐ |
| Enter only first name, blur the field | No error (field is valid) | ☐ |
| Enter invalid URL in Google Review Link | "Please enter a valid URL" error appears | ☐ |
| Enter city with 1 character | "City must be at least 2 characters" error | ☐ |
| Fill all fields correctly, click Generate | Messages appear below the form | ☐ |
| Close browser, reopen app | Franchisee Name and Google Review Link persist | ☐ |

#### Generated Messages

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| SMS shows customer first name | "Hi [FirstName]!" format | ☐ |
| SMS includes Google Review link | Link appears at end of message | ☐ |
| SMS character count displays | Count shown below SMS card | ☐ |
| SMS under 320 chars shows no warning | Clean display | ☐ |
| Email subject includes project type | "How's your new [project type]" | ☐ |
| Email body includes city twice | City mentioned in two places | ☐ |
| Thank you card uses full name | "[FirstName] [LastName]" format | ☐ |

#### Copy Functionality

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| Click "Copy" on any message | Button turns green, shows "Copied!" | ☐ |
| Paste after copying | Correct content in clipboard | ☐ |
| Copy button resets after 2 seconds | Returns to "Copy" state | ☐ |

#### Mobile Testing

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| Resize browser to 375px width | Form stacks vertically, still usable | ☐ |
| Tap form fields on phone | Keyboard appears, no layout issues | ☐ |
| Tap Copy buttons on phone | Copy works, feedback visible | ☐ |

### Build for Production

```bash
npm run build
```

Output goes to `dist/` folder. These are static files ready for any web host.

### Lint Check

```bash
npm run lint
```

Should return zero errors.

---

## Sentiment Router

A static HTML page that routes customers based on satisfaction. Happy customers go to Google Reviews. Unhappy customers go to a private feedback form.

### Setup

No setup required. Just open the files in a browser.

```bash
cd hdd-sentiment-router
# Open index.html in your browser
```

Or use a simple local server:

```bash
npx serve .
```

### Configuration

Edit `config.js` before testing or deployment:

```javascript
const CONFIG = {
  // REQUIRED: Your Google Review URL
  googleReviewUrl: "https://g.page/r/YOUR-REVIEW-LINK/review",
  
  // Email for mailto fallback
  feedbackEmail: "feedback@yourfranchise.com",
  
  // Formspree ID (recommended for reliable delivery)
  formspreeId: "your-formspree-id",
  
  // Return link on thank you page
  websiteUrl: "https://www.hickorydickorydecks.com/your-location",
  
  // Franchise name shown in feedback emails
  franchiseName: "Hickory Dickory Decks - Cincinnati"
};
```

### Getting Your Google Review URL

1. Go to [Google Business Profile](https://business.google.com)
2. Select your business location
3. Click "Get more reviews" or find the share review link
4. Copy the URL (format: `https://g.page/r/XXXXX/review`)
5. Paste into `config.js`

### Setting Up Formspree (Recommended)

Formspree handles form submissions without a backend:

1. Create free account at [formspree.io](https://formspree.io)
2. Create a new form
3. Copy the form ID (the part after `/f/` in the URL)
4. Add to `config.js` as `formspreeId`

### Testing Checklist

#### Sentiment Page (index.html)

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| Page loads with two buttons | "Great!" and "Could be better" visible | ☐ |
| Click "Great!" | Redirects to Google Review URL | ☐ |
| Click "Could be better" | Navigates to feedback.html | ☐ |
| Buttons are touch-friendly | At least 140x140px, easy to tap | ☐ |

#### Feedback Page (feedback.html)

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| Page shows feedback form | Textarea and contact field visible | ☐ |
| Submit with empty feedback | Error: "Please provide more detail..." | ☐ |
| Submit with 5 characters | Error appears (minimum 10 required) | ☐ |
| Submit with 10+ chars, no contact | Error: "Please provide a way to contact you" | ☐ |
| Submit with valid data | Redirects to thank-you.html | ☐ |

#### Thank You Page (thank-you.html)

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| Page shows confirmation | Checkmark and thank you message | ☐ |
| "Return to website" link works | Opens configured websiteUrl | ☐ |

#### Form Submission (if Formspree configured)

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| Submit valid feedback | Email arrives at configured address | ☐ |
| Email contains feedback text | Message text included | ☐ |
| Email contains contact info | Email/phone included | ☐ |

#### Mobile Testing

| Test | Expected Result | Pass? |
|------|-----------------|-------|
| index.html on phone | Buttons large and centered | ☐ |
| feedback.html on phone | Form fields full width, keyboard works | ☐ |
| thank-you.html on phone | Readable, link tappable | ☐ |

### Browser Testing

Test in each browser:

| Browser | index.html | feedback.html | thank-you.html |
|---------|------------|---------------|----------------|
| Chrome (desktop) | ☐ | ☐ | ☐ |
| Safari (desktop) | ☐ | ☐ | ☐ |
| Firefox | ☐ | ☐ | ☐ |
| Chrome (Android) | ☐ | ☐ | ☐ |
| Safari (iOS) | ☐ | ☐ | ☐ |

---

## Deployment Options

Both tools are static files. No backend required.

### Option 1: Vercel (Recommended)

**Review Generator:**
```bash
cd hdd-review-generator
npm run build
# Drag dist/ folder to vercel.com/new
```

**Sentiment Router:**
```bash
# Drag entire hdd-sentiment-router folder to vercel.com/new
```

### Option 2: Netlify

Same process as Vercel. Drag and drop the built files.

### Option 3: GitHub Pages

1. Push to GitHub repository
2. Settings > Pages > Select branch
3. Wait for deployment

### Option 4: Franchise's Existing Host

Upload files via FTP or their hosting control panel:

**Review Generator:** Upload contents of `dist/` folder  
**Sentiment Router:** Upload all 7 files to a folder like `/review/`

---

## Franchisee Handoff Checklist

Before handing off to a franchise location:

### Review Generator

| Item | Done? |
|------|-------|
| App builds without errors (`npm run build`) | ☐ |
| All tests pass | ☐ |
| Deployed to hosting | ☐ |
| Franchisee has the URL | ☐ |
| Demo completed with franchisee | ☐ |

### Sentiment Router

| Item | Done? |
|------|-------|
| `config.js` updated with franchise's Google Review URL | ☐ |
| `config.js` updated with franchise's email/Formspree | ☐ |
| `config.js` updated with franchise's website URL | ☐ |
| All pages tested locally | ☐ |
| Deployed to hosting | ☐ |
| Franchisee has the link to share with customers | ☐ |
| Test feedback submission, verify email delivery | ☐ |

### Training Notes for Franchisee

**Review Generator:**
"Go to [URL], fill in the customer's info and project details, click Generate. Copy whichever message you need. The SMS goes out Day 3, email Day 7, thank you card Day 14."

**Sentiment Router:**
"After a project is complete, send customers this link: [URL]. Happy customers go straight to Google Reviews. Unhappy customers send feedback directly to you so you can fix issues before they post publicly."

---

## Troubleshooting

### Review Generator

**"npm install" fails**  
Make sure you have Node.js 20+ installed. Run `node --version` to check.

**Styles look broken**  
Tailwind CSS v4 requires the PostCSS plugin. Verify `postcss.config.js` exists and contains `@tailwindcss/postcss`.

**Copy button doesn't work**  
Clipboard API requires HTTPS or localhost. Test locally or deploy to HTTPS host.

### Sentiment Router

**"Great!" button does nothing**  
Check that `config.js` has a valid `googleReviewUrl`. Open browser console for errors.

**Feedback form doesn't send email**  
Verify `formspreeId` is correct. Check Formspree dashboard for submissions. If using mailto fallback, user's email client must be configured.

**Custom colors not applying**  
Verify `config.js` is loaded before `script.js` in the HTML files.

---

## File Reference

### Review Generator (`hdd-review-generator/`)

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component, state management |
| `src/components/InputForm.tsx` | Form with validation |
| `src/components/MessageCard.tsx` | Message display with copy |
| `src/components/OutputSection.tsx` | Generated messages container |
| `src/utils/generateMessages.ts` | Message template logic |
| `src/types/index.ts` | TypeScript interfaces |

### Sentiment Router (`hdd-sentiment-router/`)

| File | Purpose |
|------|---------|
| `index.html` | Sentiment check page |
| `feedback.html` | Private feedback form |
| `thank-you.html` | Confirmation page |
| `styles.css` | All styling |
| `script.js` | Routing and validation logic |
| `config.js` | Franchise settings |

---

## Support

If issues arise during implementation, check:

1. Browser console for JavaScript errors
2. Network tab for failed requests (Formspree)
3. Config file for typos in URLs

For the Review Generator, `npm run lint` catches most code issues.
