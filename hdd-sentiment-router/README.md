# HDD Sentiment Router

A lightweight, static landing page that routes customers based on their satisfaction level. Happy customers go directly to Google Reviews. Unhappy customers are redirected to a private feedback form.

## Quick Start

1. Download all files to your web hosting
2. Edit `config.js` with your franchise information
3. Open `index.html` in a browser to test
4. Share the URL with customers after project completion

## Configuration

Edit `config.js` to customize for your franchise:

```javascript
const CONFIG = {
  // Your franchise name (shown in emails)
  franchiseName: "Hickory Dickory Decks - [Your Location]",

  // REQUIRED: Your Google Review URL
  // Get this from: Google Maps > Your Business > Share > "Ask for reviews"
  googleReviewUrl: "https://g.page/r/YOUR-REVIEW-LINK/review",

  // Email for feedback (used if Formspree not configured)
  feedbackEmail: "your-email@example.com",

  // Formspree form ID (recommended for reliable delivery)
  // Sign up free at https://formspree.io
  formspreeId: "your-formspree-id",

  // Your main website URL
  websiteUrl: "https://www.hickorydickorydecks.com/your-location"
};
```

## Getting Your Google Review URL

1. Go to [Google Business Profile](https://business.google.com)
2. Select your business location
3. Click "Get more reviews" or "Share review form"
4. Copy the URL provided
5. Paste it into `config.js` as `googleReviewUrl`

## Setting Up Formspree (Recommended)

Formspree ensures feedback is reliably delivered to your email:

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form
3. Copy the form ID (the part after `/f/` in the form URL)
4. Add it to `config.js` as `formspreeId`
5. Formspree will email you whenever someone submits feedback

## File Structure

```
hdd-sentiment-router/
├── index.html          # Main landing page (sentiment check)
├── feedback.html       # Private feedback form
├── thank-you.html      # Confirmation page
├── styles.css          # All styling
├── script.js           # Routing and form logic
├── config.js           # Your franchise settings
└── README.md           # This file
```

## Customization

### Adding Your Logo

Replace the logo placeholder in each HTML file:

```html
<!-- Replace this: -->
<div class="logo" aria-hidden="true">HDD Logo</div>

<!-- With this: -->
<img src="your-logo.png" alt="Hickory Dickory Decks" class="logo">
```

Then update `styles.css`:

```css
.logo {
  width: 120px;
  height: auto;  /* Remove fixed height */
  /* Remove background and other placeholder styles */
}
```

### Custom Colors

Edit the `colors` object in `config.js`:

```javascript
colors: {
  primary: "#2563eb",      // Main button/link color
  primaryHover: "#1d4ed8", // Hover state
  background: "#ffffff",   // Page background
  text: "#1e293b"          // Main text color
}
```

## Testing Checklist

- [ ] "Great!" button redirects to your Google Reviews page
- [ ] "Could be better" button goes to the feedback form
- [ ] Feedback form requires a message (min 10 characters)
- [ ] Feedback form requires contact info
- [ ] Feedback submits successfully (check your email)
- [ ] Thank you page shows after submission
- [ ] "Return to website" link works
- [ ] All pages look good on mobile

## Hosting Options

These static files can be hosted anywhere:

- **Your existing website host**: Upload to a subfolder like `/review/`
- **GitHub Pages**: Free hosting at `username.github.io/repo-name`
- **Netlify**: Free hosting with drag-and-drop upload
- **Vercel**: Free hosting with GitHub integration

## Multiple Locations

For multiple franchise locations, create a folder per location:

```
sentiment-router/
├── cincinnati/
│   ├── index.html
│   ├── feedback.html
│   ├── thank-you.html
│   └── config.js (Cincinnati settings)
├── columbus/
│   ├── index.html
│   ├── feedback.html
│   ├── thank-you.html
│   └── config.js (Columbus settings)
└── shared/
    ├── styles.css
    └── script.js
```

Update HTML files to reference shared assets:

```html
<link rel="stylesheet" href="../shared/styles.css">
<script src="../shared/script.js"></script>
```

## Analytics (Optional)

To track usage with Google Analytics:

1. Add your GA tracking code before `</head>` in each HTML file:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA-XXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA-XXXXX');
</script>
```

Events are automatically tracked:
- `click` / `positive_sentiment` - Customer clicked "Great!"
- `click` / `negative_sentiment` - Customer clicked "Could be better"
- `submit` / `feedback_form` - Feedback form submitted

## Support

For technical issues, contact your web administrator or the development team.
