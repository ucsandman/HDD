# Build Specification: HDD Sentiment Routing Landing Page

## Project Overview

A lightweight, static landing page that routes customers based on their satisfaction level. Happy customers go directly to Google Reviews. Unhappy customers are redirected to a private feedback form, protecting the franchise's public rating.

## Core Purpose

After completing a project, franchisees send customers to this page instead of directly to Google Reviews. The page asks a simple satisfaction question. This intercepts potentially negative reviews before they become public while still encouraging positive reviews.

## Technical Requirements

### Stack
- **Pure HTML, CSS, and JavaScript**: No framework required
- **No build step**: Files work directly in browser
- **Hosting**: Any static host (GitHub Pages, Netlify, Vercel, or franchise's existing hosting)
- **No backend**: All routing is client-side

### File Structure
```
sentiment-router/
├── index.html          # Main landing page
├── styles.css          # Styling
├── script.js           # Routing logic
├── feedback.html       # Private feedback form
├── thank-you.html      # Confirmation page after feedback
└── config.js           # Franchise-specific configuration
```

## User Flow

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Customer receives SMS/email with link to this page         │
│                          │                                   │
│                          ▼                                   │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                      │   │
│   │   "How was your experience with                     │   │
│   │    Hickory Dickory Decks?"                          │   │
│   │                                                      │   │
│   │   [😊 Great!]              [😐 Could be better]     │   │
│   │                                                      │   │
│   └─────────────────────────────────────────────────────┘   │
│              │                              │                │
│              ▼                              ▼                │
│   ┌─────────────────┐           ┌─────────────────────┐     │
│   │                 │           │                      │     │
│   │  Redirect to    │           │  Private feedback   │     │
│   │  Google Reviews │           │  form page          │     │
│   │                 │           │                      │     │
│   └─────────────────┘           └─────────────────────┘     │
│                                              │                │
│                                              ▼                │
│                                 ┌─────────────────────┐      │
│                                 │                      │      │
│                                 │  Thank you page     │      │
│                                 │  (franchisee gets   │      │
│                                 │   email with        │      │
│                                 │   feedback)         │      │
│                                 │                      │      │
│                                 └─────────────────────┘      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Page Specifications

### Page 1: Sentiment Check (index.html)

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              [HDD Logo Placeholder]                     │
│                                                         │
│         How was your experience with                    │
│         Hickory Dickory Decks?                          │
│                                                         │
│    ┌───────────────┐      ┌───────────────┐            │
│    │               │      │               │            │
│    │     😊        │      │     😐        │            │
│    │               │      │               │            │
│    │   Great!      │      │  Could be     │            │
│    │               │      │   better      │            │
│    └───────────────┘      └───────────────┘            │
│                                                         │
│    Your feedback helps us serve you better              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Behavior**:
- "Great!" button: Redirects immediately to Google Review URL (from config)
- "Could be better" button: Navigates to feedback.html

**Styling Notes**:
- Centered layout, max-width 480px
- Large, tappable buttons (minimum 120px x 120px)
- Emoji icons at 48px size
- Mobile-first design
- Clean white background
- Professional but warm tone

### Page 2: Private Feedback Form (feedback.html)

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              [HDD Logo Placeholder]                     │
│                                                         │
│         We'd love to hear from you                      │
│                                                         │
│    Your feedback goes directly to our team and          │
│    helps us improve. We'll personally follow up         │
│    to make things right.                                │
│                                                         │
│    ┌─────────────────────────────────────────────┐     │
│    │ What could we have done better?              │     │
│    │                                              │     │
│    │ [                                          ] │     │
│    │ [                                          ] │     │
│    │ [                                          ] │     │
│    │ [                                          ] │     │
│    └─────────────────────────────────────────────┘     │
│                                                         │
│    Name (optional)                                      │
│    [_____________________________________________]      │
│                                                         │
│    Email or Phone (so we can follow up)                 │
│    [_____________________________________________]      │
│                                                         │
│    [        Submit Feedback        ]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Form Fields**:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Feedback | Textarea | Yes | Min 10 characters, placeholder: "Please share your experience..." |
| Name | Text input | No | Placeholder: "Your name" |
| Contact | Text input | Yes | Placeholder: "Email or phone number" |

**Submission Options**:

Option A: Email via mailto (simplest, no backend)
```javascript
// Constructs mailto link with form data
const subject = encodeURIComponent("Customer Feedback - Hickory Dickory Decks");
const body = encodeURIComponent(`Feedback: ${feedback}\n\nName: ${name}\nContact: ${contact}`);
window.location.href = `mailto:${config.feedbackEmail}?subject=${subject}&body=${body}`;
```

Option B: Formspree or similar service (recommended)
```html
<form action="https://formspree.io/f/{form-id}" method="POST">
  <!-- fields -->
</form>
```

Option C: Google Forms embed (if franchise prefers)

**Note for implementer**: Include all three options in code with comments. Default to Formspree approach but make it easy to swap.

### Page 3: Thank You (thank-you.html)

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              [HDD Logo Placeholder]                     │
│                                                         │
│                     ✓                                   │
│                                                         │
│         Thank you for your feedback                     │
│                                                         │
│    We take all feedback seriously and will              │
│    personally review your comments. If you left         │
│    contact information, we'll be in touch soon.         │
│                                                         │
│    [    Return to our website    ]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Behavior**:
- "Return to our website" links to franchise website (from config)
- Page should feel reassuring, not dismissive

## Configuration File (config.js)

```javascript
const CONFIG = {
  // Franchise Information
  franchiseName: "Hickory Dickory Decks - [Location]",
  
  // Google Review URL - REQUIRED
  // Get this from Google Business Profile
  googleReviewUrl: "https://g.page/r/YOUR-REVIEW-LINK/review",
  
  // Feedback destination email
  feedbackEmail: "feedback@example.com",
  
  // Formspree form ID (if using Formspree)
  formspreeId: "your-formspree-id",
  
  // Main website URL (for "return to website" link)
  websiteUrl: "https://www.hickorydickorydecks.com/location",
  
  // Optional: Custom colors to match franchise branding
  colors: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    background: "#ffffff",
    text: "#1e293b"
  }
};
```

## Styling (styles.css)

### CSS Custom Properties
```css
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-background: #ffffff;
  --color-text: #1e293b;
  --color-text-secondary: #64748b;
  --color-border: #e2e8f0;
  --color-success: #22c55e;
  --color-card-shadow: rgba(0, 0, 0, 0.1);
  
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --max-width: 480px;
  --padding: 24px;
  --border-radius: 12px;
}
```

### Key Styling Requirements

1. **Mobile-first responsive design**
   - Works perfectly on phones (primary use case)
   - Buttons are large touch targets (min 44px height)
   - Text is readable without zooming (min 16px)

2. **Professional appearance**
   - Clean, uncluttered layout
   - Subtle shadows for depth
   - Consistent spacing
   - No harsh colors

3. **Accessibility**
   - Sufficient color contrast (WCAG AA)
   - Focus states visible
   - Form labels associated with inputs
   - Semantic HTML

### Button Styles
```css
.btn-positive {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  /* Large touch target */
  min-width: 140px;
  min-height: 140px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-positive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(34, 197, 94, 0.3);
}

.btn-negative {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #475569;
  /* Same size as positive */
  min-width: 140px;
  min-height: 140px;
  border-radius: 16px;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-negative:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}
```

## JavaScript (script.js)

### Sentiment Page Logic
```javascript
document.addEventListener('DOMContentLoaded', function() {
  const positiveBtn = document.getElementById('btn-positive');
  const negativeBtn = document.getElementById('btn-negative');
  
  positiveBtn.addEventListener('click', function() {
    // Track click (if analytics added later)
    // Redirect to Google Reviews
    window.location.href = CONFIG.googleReviewUrl;
  });
  
  negativeBtn.addEventListener('click', function() {
    // Navigate to feedback form
    window.location.href = 'feedback.html';
  });
});
```

### Feedback Form Validation
```javascript
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('feedback-form');
  
  form.addEventListener('submit', function(e) {
    const feedback = document.getElementById('feedback').value.trim();
    const contact = document.getElementById('contact').value.trim();
    
    if (feedback.length < 10) {
      e.preventDefault();
      showError('Please provide more detail about your experience.');
      return;
    }
    
    if (!contact) {
      e.preventDefault();
      showError('Please provide a way for us to contact you.');
      return;
    }
    
    // Form submits normally if validation passes
  });
});

function showError(message) {
  // Display error message to user
  const errorEl = document.getElementById('error-message');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}
```

## Deployment Instructions

### For Single Franchise

1. Download the folder
2. Edit `config.js` with franchise-specific information
3. Upload all files to web hosting
4. Share the index.html URL with customers

### For Multiple Franchises

Create a folder structure:
```
sentiment-router/
├── shared/
│   ├── styles.css
│   └── script.js
├── locations/
│   ├── location-1/
│   │   ├── index.html
│   │   ├── feedback.html
│   │   ├── thank-you.html
│   │   └── config.js
│   ├── location-2/
│   │   └── ... (same structure)
```

Or use URL parameters:
```
index.html?location=cincinnati
```
With a locations config object that maps location slugs to settings.

## Testing Checklist

### Functionality
- [ ] "Great!" button redirects to Google Reviews
- [ ] "Could be better" button goes to feedback form
- [ ] Feedback form validates required fields
- [ ] Feedback submits successfully
- [ ] Thank you page displays after submission
- [ ] "Return to website" link works

### Mobile Testing
- [ ] Buttons are easy to tap on phone
- [ ] Text is readable without zooming
- [ ] Form inputs work on mobile keyboard
- [ ] No horizontal scrolling

### Cross-Browser
- [ ] Chrome (desktop and mobile)
- [ ] Safari (desktop and iOS)
- [ ] Firefox
- [ ] Edge

### Accessibility
- [ ] Tab navigation works
- [ ] Focus states visible
- [ ] Screen reader can navigate
- [ ] Color contrast sufficient

## Analytics (Optional Future Enhancement)

If the franchise wants tracking, add:

```javascript
// In script.js
function trackEvent(action, label) {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      'event_category': 'Sentiment Router',
      'event_label': label
    });
  }
}

// Track positive click
trackEvent('click', 'positive_sentiment');

// Track negative click  
trackEvent('click', 'negative_sentiment');

// Track feedback submission
trackEvent('submit', 'feedback_form');
```

## Files to Deliver

1. **index.html**: Sentiment check page
2. **feedback.html**: Private feedback form
3. **thank-you.html**: Confirmation page
4. **styles.css**: All styling
5. **script.js**: Interaction logic
6. **config.js**: Franchise configuration
7. **README.md**: Setup instructions for the franchise

## Acceptance Criteria

The tool is complete when:

1. Sentiment check page loads with two clear options
2. Positive button redirects to configured Google Review URL
3. Negative button shows private feedback form
4. Feedback form collects and sends feedback to franchise
5. Thank you page confirms submission
6. All pages are mobile-responsive
7. Configuration is easy to update for different franchises
8. No external dependencies beyond optional Formspree

---

## Quick Start for Claude Code

```bash
# Create project folder
mkdir hdd-sentiment-router
cd hdd-sentiment-router

# Create file structure
touch index.html feedback.html thank-you.html styles.css script.js config.js README.md

# No build step needed - just open index.html in browser to test
```

This is intentionally simple. No framework, no build tools, no complexity. A franchisee's web person should be able to upload these files and edit the config without any technical knowledge beyond basic file editing.
