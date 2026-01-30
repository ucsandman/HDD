/**
 * HDD Sentiment Router - Main Script
 * Handles sentiment routing and form validation
 */

document.addEventListener('DOMContentLoaded', function() {
  // Apply custom colors from config if available
  applyCustomColors();

  // Initialize page-specific functionality
  const page = document.body.dataset.page;

  switch (page) {
    case 'sentiment':
      initSentimentPage();
      break;
    case 'feedback':
      initFeedbackPage();
      break;
    case 'thank-you':
      initThankYouPage();
      break;
  }
});

/**
 * Apply custom colors from CONFIG if defined
 */
function applyCustomColors() {
  if (typeof CONFIG !== 'undefined' && CONFIG.colors) {
    const root = document.documentElement;
    if (CONFIG.colors.primary) {
      root.style.setProperty('--color-primary', CONFIG.colors.primary);
    }
    if (CONFIG.colors.primaryHover) {
      root.style.setProperty('--color-primary-hover', CONFIG.colors.primaryHover);
    }
    if (CONFIG.colors.background) {
      root.style.setProperty('--color-background', CONFIG.colors.background);
    }
    if (CONFIG.colors.text) {
      root.style.setProperty('--color-text', CONFIG.colors.text);
    }
  }
}

/**
 * Sentiment Page - Route based on customer satisfaction
 */
function initSentimentPage() {
  const positiveBtn = document.getElementById('btn-positive');
  const negativeBtn = document.getElementById('btn-negative');

  if (positiveBtn) {
    positiveBtn.addEventListener('click', function() {
      // Track click if analytics available
      trackEvent('click', 'positive_sentiment');

      // Redirect to Google Reviews
      if (typeof CONFIG !== 'undefined' && CONFIG.googleReviewUrl) {
        window.location.href = CONFIG.googleReviewUrl;
      } else {
        console.error('Google Review URL not configured');
        alert('Review link not configured. Please contact the business.');
      }
    });
  }

  if (negativeBtn) {
    negativeBtn.addEventListener('click', function() {
      // Track click if analytics available
      trackEvent('click', 'negative_sentiment');

      // Navigate to feedback form
      window.location.href = 'feedback.html';
    });
  }
}

/**
 * Feedback Page - Handle form validation and submission
 */
function initFeedbackPage() {
  const form = document.getElementById('feedback-form');
  const errorEl = document.getElementById('error-message');

  if (!form) return;

  // Set up form action based on config
  setupFormAction(form);

  form.addEventListener('submit', function(e) {
    const feedback = document.getElementById('feedback').value.trim();
    const contact = document.getElementById('contact').value.trim();

    // Clear previous error
    hideError();

    // Validate feedback length
    if (feedback.length < 10) {
      e.preventDefault();
      showError('Please provide more detail about your experience (at least 10 characters).');
      document.getElementById('feedback').focus();
      return;
    }

    // Validate contact info
    if (!contact) {
      e.preventDefault();
      showError('Please provide a way for us to contact you.');
      document.getElementById('contact').focus();
      return;
    }

    // Track submission if analytics available
    trackEvent('submit', 'feedback_form');

    // Form submits normally if validation passes
  });
}

/**
 * Set up form action based on configuration
 * Supports: Formspree (default), mailto, or custom endpoint
 */
function setupFormAction(form) {
  if (typeof CONFIG === 'undefined') return;

  // Option A: Formspree (recommended)
  if (CONFIG.formspreeId && CONFIG.formspreeId !== 'your-formspree-id') {
    form.action = `https://formspree.io/f/${CONFIG.formspreeId}`;
    form.method = 'POST';
    return;
  }

  // Option B: mailto fallback
  if (CONFIG.feedbackEmail && CONFIG.feedbackEmail !== 'feedback@example.com') {
    form.addEventListener('submit', function(e) {
      // Only intercept if not already handled by Formspree
      if (form.action.includes('formspree')) return;

      e.preventDefault();

      const feedback = document.getElementById('feedback').value.trim();
      const name = document.getElementById('name').value.trim() || 'Not provided';
      const contact = document.getElementById('contact').value.trim();

      const subject = encodeURIComponent(`Customer Feedback - ${CONFIG.franchiseName || 'Hickory Dickory Decks'}`);
      const body = encodeURIComponent(
        `Feedback:\n${feedback}\n\nName: ${name}\nContact: ${contact}`
      );

      window.location.href = `mailto:${CONFIG.feedbackEmail}?subject=${subject}&body=${body}`;

      // Redirect to thank you after a brief delay
      setTimeout(function() {
        window.location.href = 'thank-you.html';
      }, 500);
    });
  }
}

/**
 * Thank You Page - Set up return link
 */
function initThankYouPage() {
  const returnLink = document.getElementById('return-link');

  if (returnLink && typeof CONFIG !== 'undefined' && CONFIG.websiteUrl) {
    returnLink.href = CONFIG.websiteUrl;
  }
}

/**
 * Show error message
 */
function showError(message) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

/**
 * Hide error message
 */
function hideError() {
  const errorEl = document.getElementById('error-message');
  if (errorEl) {
    errorEl.classList.remove('visible');
  }
}

/**
 * Track events for analytics (optional)
 * Works with Google Analytics if gtag is loaded
 */
function trackEvent(action, label) {
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      'event_category': 'Sentiment Router',
      'event_label': label
    });
  }

  // Console log for debugging (remove in production if desired)
  console.log(`Event: ${action} - ${label}`);
}
