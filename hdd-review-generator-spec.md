# Build Specification: HDD Review Request Message Generator

## Project Overview

A standalone web application that generates personalized review request messages for Hickory Dickory Decks franchisees. The tool creates ready-to-copy SMS messages, emails, and thank you card text based on project and customer details.

## Core Purpose

Franchisees complete a deck project and need to request reviews from customers. This tool eliminates the friction of writing personalized messages by generating all three touchpoints (Day 3 SMS, Day 7 Email, Day 14 Thank You Card) from a single form submission.

## Technical Requirements

### Stack
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React useState (no external state library needed)
- **Deployment Target**: Static hosting (Vercel, Netlify, or similar)
- **No backend required**: All generation happens client-side

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design required

## User Interface Specification

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  HDD Review Request Generator                           │
│  [Logo placeholder]                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  INPUT FORM                                      │   │
│  │                                                  │   │
│  │  Customer First Name: [____________]            │   │
│  │  Customer Last Name:  [____________]            │   │
│  │  Project Type:        [Dropdown_____▼]          │   │
│  │  City:                [____________]            │   │
│  │  Franchisee Name:     [____________]            │   │
│  │  Google Review Link:  [____________]            │   │
│  │                                                  │   │
│  │  [Generate Messages Button]                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  OUTPUT SECTION (appears after generation)       │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │ DAY 3: SMS MESSAGE              [Copy]  │    │   │
│  │  │ --------------------------------        │    │   │
│  │  │ Generated SMS text here...              │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │ DAY 7: EMAIL                    [Copy]  │    │   │
│  │  │ --------------------------------        │    │   │
│  │  │ Subject: [subject line]         [Copy]  │    │   │
│  │  │ Body:                                   │    │   │
│  │  │ Generated email text here...            │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  │                                                  │   │
│  │  ┌─────────────────────────────────────────┐    │   │
│  │  │ DAY 14: THANK YOU CARD          [Copy]  │    │   │
│  │  │ --------------------------------        │    │   │
│  │  │ Generated card text here...             │    │   │
│  │  └─────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Form Fields

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| Customer First Name | Text input | Yes | Min 1 character | Used in all messages |
| Customer Last Name | Text input | Yes | Min 1 character | Used in email only |
| Project Type | Dropdown | Yes | Must select option | See options below |
| City | Text input | Yes | Min 2 characters | Location reference |
| Franchisee First Name | Text input | Yes | Min 1 character | Signs off messages |
| Google Review Link | URL input | Yes | Valid URL format | Included in SMS and email |

### Project Type Dropdown Options

```
- Custom Deck
- Deck Replacement
- Deck Repair
- Deck Resurfacing
- Pergola
- Porch
- Gazebo
- Railings
- Stairs
- Screen Room
- Sunroom
- Other
```

## Message Templates

### Day 3: SMS Message

**Character limit target**: Under 320 characters (2 SMS segments max)

**Template**:
```
Hi {customerFirstName}! This is {franchiseeName} from Hickory Dickory Decks. We hope you're enjoying your new {projectType}! If you have a moment, we'd really appreciate a Google review: {googleReviewLink}
```

**Fallback shorter version** (if over 320 chars):
```
Hi {customerFirstName}! {franchiseeName} from Hickory Dickory Decks here. Enjoying your new {projectType}? We'd love a quick review: {googleReviewLink}
```

### Day 7: Email

**Subject Line**:
```
How's your new {projectType}, {customerFirstName}?
```

**Body Template**:
```
Hi {customerFirstName},

I wanted to check in and see how you're enjoying your new {projectType}. It was a pleasure working with you on this project in {city}, and I hope it's everything you envisioned.

If you have a few minutes, I'd be incredibly grateful if you could share your experience with a Google review. Your feedback helps other homeowners in {city} find quality deck builders, and it means a lot to our team.

Leave a review here: {googleReviewLink}

Thank you again for choosing Hickory Dickory Decks. If you ever have questions about maintenance or future projects, don't hesitate to reach out.

Best regards,
{franchiseeName}
Hickory Dickory Decks
```

### Day 14: Thank You Card

**Template**:
```
Dear {customerFirstName} {customerLastName},

Thank you for trusting Hickory Dickory Decks with your {projectType} project. It was a pleasure working with you, and we hope your new outdoor space brings years of enjoyment.

If you haven't already, we'd be honored if you'd share your experience online. Your recommendation helps us continue serving families in {city}.

With gratitude,
{franchiseeName}
Hickory Dickory Decks
```

## Component Structure

```
src/
├── components/
│   ├── InputForm.tsx          # Form with all input fields
│   ├── OutputSection.tsx      # Container for all message outputs
│   ├── MessageCard.tsx        # Reusable card component for each message type
│   ├── CopyButton.tsx         # Copy to clipboard button with feedback
│   └── Header.tsx             # App header with logo placeholder
├── hooks/
│   └── useCopyToClipboard.ts  # Custom hook for clipboard functionality
├── utils/
│   └── generateMessages.ts    # Message generation logic
├── types/
│   └── index.ts               # TypeScript interfaces
├── App.tsx
└── main.tsx
```

## TypeScript Interfaces

```typescript
interface FormData {
  customerFirstName: string;
  customerLastName: string;
  projectType: string;
  city: string;
  franchiseeName: string;
  googleReviewLink: string;
}

interface GeneratedMessages {
  sms: string;
  emailSubject: string;
  emailBody: string;
  thankYouCard: string;
}

interface MessageCardProps {
  title: string;
  timing: string;
  content: string;
  secondaryContent?: {
    label: string;
    content: string;
  };
}
```

## Functional Requirements

### Form Behavior

1. **Validation**: All fields required. Show inline error messages for empty fields on submit attempt.
2. **Submit Button**: Disabled state until all fields have content. Label: "Generate Messages"
3. **URL Validation**: Google Review Link should accept any valid URL (don't restrict to google.com domains as franchises may use redirect links)
4. **Persistence**: Store form data in localStorage so returning users don't have to re-enter franchisee name and review link

### Output Behavior

1. **Visibility**: Output section hidden until form is submitted successfully
2. **Scroll**: Auto-scroll to output section after generation
3. **Copy Feedback**: Each copy button shows "Copied!" for 2 seconds after click, then reverts to "Copy"
4. **SMS Character Count**: Display character count below SMS output (format: "X characters")

### Copy Button Behavior

1. Click triggers `navigator.clipboard.writeText()`
2. Visual feedback: Button text changes from "Copy" to "Copied!" with a checkmark icon
3. Button background briefly flashes green
4. Reverts to original state after 2 seconds

## Styling Guidelines

### Color Palette

```css
/* Primary - Use HDD brand colors if known, otherwise: */
--primary: #2563eb;        /* Blue - buttons, links */
--primary-hover: #1d4ed8;  /* Darker blue - hover states */

/* Neutrals */
--background: #f8fafc;     /* Light gray page background */
--card-bg: #ffffff;        /* White card backgrounds */
--text-primary: #1e293b;   /* Dark slate - headings */
--text-secondary: #64748b; /* Medium slate - body text */
--border: #e2e8f0;         /* Light border color */

/* Feedback */
--success: #22c55e;        /* Green - copy confirmation */
--error: #ef4444;          /* Red - validation errors */
```

### Typography

- **Headings**: Font-weight 600, text-slate-800
- **Body**: Font-weight 400, text-slate-600
- **Form labels**: Font-weight 500, text-slate-700, text-sm
- **Generated messages**: Font-family monospace or similar for easy reading/copying

### Spacing

- Card padding: 24px (p-6)
- Section gaps: 24px (space-y-6)
- Form field gaps: 16px (space-y-4)
- Mobile padding: 16px (p-4)

### Responsive Breakpoints

- Mobile: < 640px (single column, full-width cards)
- Tablet/Desktop: >= 640px (max-width container, centered)

## Edge Cases to Handle

1. **Long customer names**: Truncate in SMS if total message exceeds 320 characters
2. **Special characters in names**: Escape any characters that could break the message
3. **Long Google Review URLs**: Accept any length, let SMS handle the overflow gracefully
4. **Project type "Other"**: Works the same as other types in templates
5. **Clipboard API failure**: Show fallback "Select All" instruction if clipboard write fails
6. **localStorage unavailable**: Gracefully degrade without persistence

## Testing Checklist

- [ ] All form fields validate correctly
- [ ] Generate button disabled when form incomplete
- [ ] Messages generate with correct variable substitution
- [ ] Copy buttons work on all three message types
- [ ] Copy feedback displays correctly
- [ ] SMS character count accurate
- [ ] Mobile layout renders correctly
- [ ] localStorage persistence works
- [ ] Page works without localStorage
- [ ] Clipboard fallback works when API unavailable

## Future Enhancement Considerations (Do Not Build Now)

These are noted for future versions but should NOT be included in v1:

- Email template customization
- Multiple Google Review link profiles per franchise
- Message history/log
- Analytics tracking
- Export to CSV
- Integration with email clients

## Acceptance Criteria

The tool is complete when:

1. User can fill out all form fields
2. Clicking "Generate Messages" produces all three message types
3. Each message correctly substitutes the input variables
4. Copy buttons work and show feedback
5. Form data persists across page reloads (franchisee name and review link)
6. Interface is clean, professional, and mobile-responsive
7. No console errors in production build

## Deployment Notes

- Build command: `npm run build`
- Output directory: `dist/`
- No environment variables required
- No API keys needed
- Static hosting compatible

---

## Quick Start for Claude Code

```bash
# Initialize project
npm create vite@latest hdd-review-generator -- --template react-ts
cd hdd-review-generator

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configure Tailwind in tailwind.config.js and add to index.css

# Start development
npm run dev
```

Build this as a clean, functional tool. Prioritize usability over features. The user is a busy franchisee who needs to generate messages quickly and copy them to their phone or email client.
