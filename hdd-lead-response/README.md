# HDD Lead Response Automation

Automated lead response system for Hickory Dickory Decks Cincinnati. Sends instant SMS/email responses to incoming leads and follows up automatically until they respond or book a consultation.

## Quick Start

1. Clone and install dependencies:
```bash
cd hdd-lead-response
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your values
```

3. Set up the database:
```bash
npx prisma db push
npx prisma db seed
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) and log in with your email.

## Features

- **Instant Response**: SMS + email sent within seconds of lead arrival
- **Automated Followups**: 5-step sequence (instant, 4hr, 24hr, 72hr, 7 days)
- **Reply Detection**: Twilio webhook pauses sequence when lead replies
- **Booking Detection**: Cal.com webhook marks lead as booked
- **Dashboard**: View all leads, message history, sequence status
- **Manual Controls**: Pause, resume, skip, or close leads manually

## Tech Stack

- Next.js 14 (App Router)
- PostgreSQL (Neon) + Prisma
- NextAuth.js v5 (magic link auth)
- Twilio (SMS)
- Resend (email)
- Cal.com (booking)
- Tailwind CSS v4

## API Endpoints

### Leads
- `GET /api/leads` - List leads with filters
- `POST /api/leads` - Create lead (triggers instant response)
- `GET /api/leads/[id]` - Get lead details + messages
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead
- `POST /api/leads/[id]/pause` - Pause sequence
- `POST /api/leads/[id]/resume` - Resume sequence
- `POST /api/leads/[id]/skip` - Skip to next step
- `POST /api/leads/[id]/close` - Mark won/lost

### Webhooks
- `POST /api/leads/webhook` - External lead intake
- `POST /api/webhooks/twilio` - Inbound SMS
- `POST /api/webhooks/cal` - Booking notifications

### Cron
- `POST /api/cron/process-followups` - Process pending followups (every 5 min)

## Configuration

Edit sequence templates and business settings in the dashboard:
- `/sequences` - Follow-up message templates
- `/settings` - Business info and defaults

## Deployment

Deploy to Vercel with the Neon PostgreSQL integration. Cron jobs are configured in `vercel.json`.

## License

Private - Hickory Dickory Decks
