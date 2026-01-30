# HDD Lead Response Automation

## Overview

Lead response automation system for Hickory Dickory Decks Cincinnati. Sends instant SMS/email responses when leads come in, then follows up automatically until the lead responds or books a consultation.

**Goal**: Be the first contractor to respond (78% win rate for first responders).

## Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS v4 |
| Database | Neon PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 beta with email magic links (Resend) |
| SMS | Twilio |
| Email | Resend |
| Calendar | Cal.com (booking webhooks) |
| Scheduling | Vercel Cron Jobs (every 5 minutes) |
| Hosting | Vercel |

## Key Files

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema (leads, messages, sequences, settings) |
| `lib/auth.ts` | NextAuth configuration with Resend provider |
| `lib/db.ts` | Prisma client singleton |
| `lib/phone.ts` | E.164 phone normalization |
| `lib/templates.ts` | Message template rendering with {{variables}} |
| `lib/sequence.ts` | Sequence processing logic |
| `lib/twilio/send-sms.ts` | SMS sending + logging |
| `lib/resend/client.ts` | Email sending + logging |
| `middleware.ts` | Route protection, webhook paths, cron auth |

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma db seed   # Seed default sequence + settings
```

## Database Schema

Five main tables:
- `users` - auth users (admin, editor roles)
- `leads` - contact info, status, sequence tracking
- `messages` - communication log (SMS/email, in/out)
- `sequence_steps` - configurable follow-up templates
- `settings` - key-value business config

Lead status workflow: new → contacted → engaged → qualified → booked → won/lost

## Authentication Flow

1. Magic link via Resend to pre-registered email
2. Session includes userId, role
3. Role-based access: admin (full), editor (limited)

## Sequence Engine

Default follow-up sequence:
1. **Instant**: SMS + Email on lead creation
2. **4 hours**: Follow-up SMS
3. **24 hours**: Follow-up email
4. **72 hours**: Final SMS
5. **7 days**: Closing email

Sequence stops when:
- Lead replies (SMS detected via Twilio webhook)
- Lead books consultation (Cal.com webhook)
- Lead manually marked as closed

## Webhooks

- `POST /api/leads/webhook` - External lead intake (HMAC verified)
- `POST /api/webhooks/twilio` - Inbound SMS (Twilio signature verified)
- `POST /api/webhooks/cal` - Booking notifications

## Cron Jobs

- `/api/cron/process-followups`: Every 5 minutes (processes pending followups)

Requires `Authorization: Bearer {CRON_SECRET}` header.

## Environment Variables

See `.env.example` for required variables:
- Database: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`
- Auth: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `EMAIL_FROM`
- SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- Calendar: `CAL_BOOKING_LINK`, `CAL_WEBHOOK_SECRET`
- Security: `CRON_SECRET`, `WEBHOOK_SECRET`
