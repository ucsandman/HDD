# Warranty Tracker - Hickory Dickory Decks Cincinnati

Track customer warranties, schedule annual checkups, and send automated email reminders.

## Features

- **Customer Management**: Store customer details, project info, and warranty dates
- **Email Automation**: Send checkup and seasonal maintenance emails via Resend API
- **Email History**: Track all email communications with customers
- **Smart Filtering**: View all customers, those due for checkup, or with expiring warranties
- **Anniversary Triggers**: Track 30-day reviews, 6-month maintenance, and yearly anniversaries
- **Copy to Clipboard**: Quick copy email templates for manual sending

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS v4
- Resend API (email delivery)
- LocalStorage (customer data persistence)

## Quick Start

### Development

```bash
npm install
npm run dev
```

App runs at http://localhost:5176

### Environment Setup

Create a `.env` file for Resend API integration:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Hickory Dickory Decks <noreply@hickorydickorydecks.com>
REPLY_TO_EMAIL=cincinnati@hickorydickorydecks.com
```

See `.env.example` for template.

### Deployment

Deploy to Vercel for serverless API endpoints:

```bash
npm run build
vercel --prod
```

Configure environment variables in Vercel dashboard.

## Email Integration

### API Endpoint

`/api/send-email` - Vercel serverless function that sends emails via Resend API

**Request:**
```json
{
  "to": "customer@example.com",
  "subject": "Annual Deck Checkup",
  "html": "<p>Email content...</p>",
  "customerName": "John Doe",
  "emailType": "checkup"
}
```

**Response:**
```json
{
  "success": true,
  "id": "email-id-from-resend",
  "message": "Email sent to John Doe"
}
```

### Email Templates

1. **Checkup Email**: Annual maintenance check-in with warranty inspection offer
2. **Seasonal Email**: Spring/summer maintenance tips and reminders

Both templates use HTML formatting with proper structure for email clients.

## Customer Data Schema

```typescript
interface Customer {
  id: string
  name: string
  address: string
  phone: string
  email: string
  projectDate: string
  projectType: 'Deck' | 'Pergola' | 'Pool Surround' | 'Gazebo' | 'Railing'
  material: string // Trex/TimberTech options
  warrantyYears: number // 25 or 50 years
  warrantyExpires: string
  lastContact?: string
  lastEmailed?: string
  nextCheckup?: string
  notes: string
  projectCompletionDate: string
  emailHistory: EmailHistoryEntry[]
  anniversaryTriggers: AnniversaryTriggers
}

interface EmailHistoryEntry {
  date: string
  type: 'checkup' | 'seasonal'
  subject: string
  status: 'sent' | 'failed'
  emailId?: string
}
```

## Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Project Structure

```
hdd-warranty-tracker/
├── api/
│   └── send-email.ts        # Vercel serverless function
├── src/
│   ├── App.tsx              # Main application component
│   ├── App.css              # Styles
│   └── main.tsx             # React entry point
├── .env.example             # Environment variable template
├── vercel.json              # Vercel deployment config
└── package.json
```

## Usage

### Adding a Customer

1. Click "+ Add Customer"
2. Fill in customer details (name and project date required)
3. Select project type and material
4. Customer is added with auto-calculated warranty expiration and next checkup date

### Sending Emails

1. Find customer in list
2. Click "Send Checkup" or "Send Seasonal" button
3. Email is sent via Resend API
4. Status appears below buttons (success/error)
5. Email history is updated automatically

### Copying to Clipboard

Use the clipboard icon (📋) next to each email button to copy template text for manual sending.

## Materials & Warranties

- **Trex Select**: 25-year warranty
- **Trex Enhance**: 25-year warranty
- **Trex Transcend**: 25-year warranty
- **TimberTech PRO**: 25-year warranty
- **TimberTech AZEK**: 50-year warranty

## Filters

- **All**: Show all customers
- **Due for Checkup**: Customers with checkup date within 30 days
- **Expiring Soon**: Warranties expiring within 1 year

## Data Storage

Customer data is stored in browser `localStorage` under key `hdd-warranties`. Data persists across sessions but is browser-specific.

## Production Deployment

### Vercel Setup

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Verify your sending domain
3. Generate API key
4. Add to Vercel environment variables

## Security Notes

- API key stored in environment variables (never committed)
- `.env` files excluded via `.gitignore`
- Email validation on client and server
- Rate limiting recommended for production (not included)

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge 90+
- Firefox 90+
- Safari 15+

## License

Private - Hickory Dickory Decks Cincinnati
