# Build Specification: HDD Lead Response Automation

## Project Overview

A web application that ensures instant response to incoming leads for Hickory Dickory Decks Cincinnati. When a lead comes in, the system immediately sends a personalized SMS and email, then follows up automatically until the lead responds or books a consultation.

The goal is to be the first contractor to respond. Studies show the first responder wins 78% of the time in home services.

---

## Core User Stories

1. **As a lead**, I want an immediate response when I submit an inquiry so I know my request was received
2. **As a franchisee**, I want leads contacted instantly even when I'm on a job site
3. **As a franchisee**, I want automatic follow-ups so leads don't fall through the cracks
4. **As a franchisee**, I want to see all my leads in one place with their status
5. **As a franchisee**, I want to know when a lead books a consultation

---

## Technical Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Next.js 14 (App Router) | React, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes | Serverless functions on Vercel |
| Database | Neon (PostgreSQL) | Serverless Postgres |
| SMS | Twilio | Programmable SMS |
| Email | Resend | Transactional email |
| Calendar | Cal.com | Free scheduling, Google Calendar sync |
| Scheduling | Vercel Cron + Inngest | For follow-up sequences |
| Authentication | NextAuth.js | Email magic links (same as GBP poster) |
| Hosting | Vercel | Everything in one place |

---

## Lead Intake Methods

The system accepts leads through multiple channels to work with whatever setup they have:

### Method 1: Webhook (Preferred)

Direct integration with their website form or CRM. Any system that can send a POST request works.

```
POST /api/leads/webhook

{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com",
  "phone": "513-555-1234",
  "address": "123 Main St",
  "city": "Mason",
  "state": "OH",
  "zip": "45040",
  "project_type": "Deck",
  "message": "Looking for a quote on a 400 sq ft composite deck",
  "source": "website"
}
```

### Method 2: Email Parsing

Monitor an inbox (e.g., leads@their-domain.com) for lead notification emails. Parse the email content to extract lead details. Works with any form or ad platform that sends email notifications.

### Method 3: Manual Entry

Dashboard form for leads that come in via phone call or other channels.

### Method 4: Zapier/Make (Future)

Provide a Zapier webhook URL for easy connection to hundreds of apps.

---

## Data Model

```sql
-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contact info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  phone_normalized VARCHAR(20), -- E.164 format for Twilio
  
  -- Address
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  
  -- Project details
  project_type VARCHAR(100),
  message TEXT,
  
  -- Source tracking
  source VARCHAR(100), -- 'website', 'google_ads', 'facebook', 'referral', 'manual'
  source_detail VARCHAR(255), -- Campaign name, referrer, etc.
  
  -- Status
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'engaged', 'booked', 'closed_won', 'closed_lost', 'unresponsive'
  
  -- Response tracking
  first_contacted_at TIMESTAMP,
  response_time_seconds INTEGER, -- Time from lead creation to first contact
  last_contacted_at TIMESTAMP,
  lead_responded_at TIMESTAMP, -- When they first replied
  
  -- Consultation
  consultation_booked_at TIMESTAMP,
  consultation_scheduled_for TIMESTAMP,
  cal_booking_id VARCHAR(255),
  
  -- Sequence control
  sequence_status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'completed', 'stopped'
  sequence_step INTEGER DEFAULT 0,
  next_followup_at TIMESTAMP,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Communication log
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Message details
  direction VARCHAR(10) NOT NULL, -- 'outbound', 'inbound'
  channel VARCHAR(20) NOT NULL, -- 'sms', 'email'
  
  -- Content
  subject VARCHAR(255), -- For emails
  body TEXT NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'received'
  
  -- Provider details
  provider_message_id VARCHAR(255), -- Twilio SID or Resend ID
  error_message TEXT,
  
  -- Timestamps
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sequence templates
CREATE TABLE sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  step_number INTEGER NOT NULL,
  name VARCHAR(100) NOT NULL,
  
  -- Timing
  delay_minutes INTEGER NOT NULL, -- Minutes after lead creation (or previous step)
  delay_type VARCHAR(20) DEFAULT 'from_start', -- 'from_start' or 'from_previous'
  
  -- Channels (can do both)
  send_sms BOOLEAN DEFAULT false,
  send_email BOOLEAN DEFAULT false,
  
  -- Content
  sms_template TEXT,
  email_subject_template VARCHAR(255),
  email_body_template TEXT,
  
  -- Control
  skip_if_responded BOOLEAN DEFAULT true,
  skip_if_booked BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Settings
CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_next_followup ON leads(next_followup_at) WHERE sequence_status = 'active';
CREATE INDEX idx_messages_lead_id ON messages(lead_id);
```

---

## Follow-Up Sequence

Default sequence (configurable in settings):

| Step | Timing | SMS | Email | Purpose |
|------|--------|-----|-------|---------|
| 1 | Instant | ✓ | ✓ | Immediate acknowledgment |
| 2 | 4 hours | ✓ | | Quick check-in if no reply |
| 3 | 24 hours | | ✓ | More detailed info, builds trust |
| 4 | 72 hours | ✓ | | Final friendly nudge |
| 5 | 7 days | | ✓ | Last attempt, soft close |

Sequence stops when:
- Lead replies (via SMS or email)
- Lead books a consultation
- Lead is manually marked as closed
- All steps completed

---

## Message Templates

### Step 1: Instant Response

**SMS:**
```
Hi {{first_name}}! This is Nathan from Hickory Dickory Decks. Thanks for reaching out about your {{project_type}} project. I'd love to learn more and give you a free estimate. 

Book a time that works for you: {{booking_link}}

Or just reply here and I'll call you back within the hour.
```

**Email Subject:**
```
Thanks for contacting Hickory Dickory Decks, {{first_name}}!
```

**Email Body:**
```
Hi {{first_name}},

Thanks for reaching out about your {{project_type}} project in {{city}}! I'm Nathan, one of the owners of Hickory Dickory Decks Cincinnati, and I'd love to help you create the perfect outdoor space.

Here's what happens next:

1. We'll schedule a free backyard consultation at your convenience
2. I'll come out, take measurements, and discuss your vision
3. Within 48 hours, you'll have a detailed quote with no obligation

Ready to get started? Pick a time that works for you:
{{booking_link}}

Or if you prefer, just reply to this email or text me at {{business_phone}} and we'll find a time that works.

Looking forward to meeting you!

Nathan Ricke
Hickory Dickory Decks Cincinnati
{{business_phone}}
```

### Step 2: 4-Hour Follow-Up

**SMS:**
```
Hey {{first_name}}, just following up on your deck inquiry. Happy to answer any questions or schedule a time to come take a look. What works best for you?
```

### Step 3: 24-Hour Follow-Up

**Email Subject:**
```
A few things to know about your {{project_type}} project
```

**Email Body:**
```
Hi {{first_name}},

I wanted to share a few things that might be helpful as you're thinking about your {{project_type}} project:

Why homeowners choose us:
• We specialize in composite and PVC decking that never needs staining
• Our decks are built to handle Cincinnati's weather year-round
• We're backed by 35+ years of Hickory Dickory Decks experience

The process is simple:
• Free consultation at your home (about 45 minutes)
• Detailed quote within 48 hours
• Most projects completed in 1-2 weeks

No pressure, no obligation. If you'd like to chat, here's my calendar:
{{booking_link}}

Or just reply and let me know what questions you have.

Nathan
```

### Step 4: 72-Hour Follow-Up

**SMS:**
```
Hi {{first_name}}, still thinking about your deck project? I'm here when you're ready. Feel free to reach out anytime. - Nathan, Hickory Dickory Decks
```

### Step 5: 7-Day Follow-Up

**Email Subject:**
```
Still interested in your deck project, {{first_name}}?
```

**Email Body:**
```
Hi {{first_name}},

I wanted to check in one more time about your {{project_type}} project. I know these decisions take time, so no rush at all.

If you're still considering it, I'm happy to:
• Answer any questions you have
• Come out for a free estimate whenever you're ready
• Send over some photos of similar projects we've done in {{city}}

Just reply to this email or give me a call at {{business_phone}}.

If you've decided to go a different direction, no worries at all. Best of luck with your project!

Nathan
Hickory Dickory Decks Cincinnati
```

---

## Template Variables

| Variable | Source | Example |
|----------|--------|---------|
| `{{first_name}}` | Lead record | John |
| `{{last_name}}` | Lead record | Smith |
| `{{email}}` | Lead record | john@example.com |
| `{{phone}}` | Lead record | 513-555-1234 |
| `{{city}}` | Lead record, or "your area" if blank | Mason |
| `{{project_type}}` | Lead record, or "deck" if blank | composite deck |
| `{{booking_link}}` | Cal.com link | https://cal.com/hdd-cincinnati/consultation |
| `{{business_phone}}` | Settings | 513-572-1200 |
| `{{business_email}}` | Settings | nricke@decks.ca |

---

## Inbound Message Handling

### Inbound SMS (Twilio Webhook)

When a lead texts back:

1. Match phone number to lead record
2. Log message in `messages` table
3. Update lead:
   - Set `lead_responded_at` if first response
   - Set `status` = 'engaged'
   - Set `sequence_status` = 'paused' (stop automated follow-ups)
4. Send notification to Nathan/Brinton (email or SMS alert)

### Inbound Email (Future Enhancement)

Could monitor inbox for replies, but more complex. V1 relies on:
- Replies going to Nathan's email directly
- Nathan manually updating lead status in dashboard

---

## Cal.com Integration

### Setup

1. Create Cal.com account for HDD Cincinnati
2. Create event type: "Free Deck Consultation"
   - Duration: 60 minutes
   - Location: "At your home" (address collected in form)
   - Questions: None (we already have their info)
3. Connect Google Calendar for availability
4. Get booking link and API key

### Webhook

Cal.com sends webhook when booking is created:

```
POST /api/webhooks/cal

{
  "triggerEvent": "BOOKING_CREATED",
  "payload": {
    "email": "john@example.com",
    "startTime": "2025-02-15T14:00:00Z",
    "endTime": "2025-02-15T15:00:00Z",
    ...
  }
}
```

Handler:
1. Match email to lead record
2. Update lead:
   - Set `consultation_booked_at` = now
   - Set `consultation_scheduled_for` = booking time
   - Set `cal_booking_id` = booking ID
   - Set `status` = 'booked'
   - Set `sequence_status` = 'completed'
3. Send confirmation SMS to lead (optional)

---

## User Interface

### Pages

#### 1. Dashboard (`/`)

Overview cards:
- New leads today
- Leads awaiting response
- Consultations booked this week
- Average response time

Lead queue showing:
- New and engaged leads
- Next follow-up times
- Quick actions (call, text, mark as booked)

#### 2. Leads List (`/leads`)

Table with:
- Name, contact info
- Project type
- Source
- Status (color-coded badge)
- Last contact
- Next follow-up
- Actions

Filters:
- Status (New, Contacted, Engaged, Booked, Closed)
- Source
- Date range

Bulk actions:
- Pause sequence
- Resume sequence
- Mark as closed

#### 3. Lead Detail (`/leads/[id]`)

Left column:
- Contact info (click to call/text/email)
- Project details
- Address (link to Google Maps)
- Source info
- Notes (editable)
- Status controls

Right column:
- Full message history (SMS and email, chronological)
- Compose new message (SMS or email)
- Sequence status with upcoming steps

Actions:
- Pause/Resume sequence
- Skip to next step
- Mark as booked (manual)
- Mark as closed (won/lost)

#### 4. New Lead (`/leads/new`)

Manual entry form:
- First name, last name
- Email, phone
- Address, city, state, zip
- Project type (dropdown)
- Message/notes
- Source (dropdown)

On submit:
- Create lead
- Trigger instant response sequence

#### 5. Messages (`/messages`)

Combined inbox/outbox view:
- All messages across all leads
- Filter by direction (inbound/outbound)
- Filter by channel (SMS/email)
- Click to go to lead detail

Primarily useful for seeing all inbound responses in one place.

#### 6. Sequences (`/sequences`)

Edit the follow-up sequence:
- List of steps with timing
- Edit templates for each step
- Enable/disable steps
- Reorder steps
- Add new step

Preview:
- Show how sequence looks for a sample lead
- Timeline visualization

#### 7. Settings (`/settings`)

Business info:
- Business name
- Phone number (Twilio number, display only)
- Email address (for sending)
- Booking link (Cal.com URL)

Notifications:
- Email for new lead alerts
- Phone for new lead SMS alerts

Integrations:
- Twilio status (connected/not connected)
- Cal.com status
- Webhook URL for external systems

Users:
- List Nathan and Brinton
- Add/remove users (admin only)

---

## API Routes

### Leads
- `GET /api/leads` - List leads with filters
- `POST /api/leads` - Create lead manually
- `GET /api/leads/[id]` - Get single lead with messages
- `PUT /api/leads/[id]` - Update lead
- `DELETE /api/leads/[id]` - Delete lead
- `POST /api/leads/[id]/pause` - Pause sequence
- `POST /api/leads/[id]/resume` - Resume sequence
- `POST /api/leads/[id]/skip` - Skip to next step
- `POST /api/leads/[id]/close` - Mark as closed

### Messages
- `GET /api/messages` - List all messages
- `POST /api/messages` - Send manual message
- `GET /api/leads/[id]/messages` - Messages for a lead

### Webhooks (External)
- `POST /api/leads/webhook` - Receive leads from external source
- `POST /api/webhooks/twilio` - Inbound SMS from Twilio
- `POST /api/webhooks/cal` - Booking notifications from Cal.com

### Sequences
- `GET /api/sequences` - Get sequence steps
- `PUT /api/sequences` - Update sequence steps

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Cron
- `POST /api/cron/process-followups` - Check and send due follow-ups

---

## Background Jobs

### Process Follow-Ups

**Schedule**: Every 5 minutes via Vercel Cron

**Logic**:
```
1. Query leads where:
   - sequence_status = 'active'
   - next_followup_at <= NOW()
   
2. For each lead:
   a. Get current sequence step
   b. Check skip conditions:
      - If skip_if_responded AND lead_responded_at is set → skip
      - If skip_if_booked AND consultation_booked_at is set → skip
   c. If not skipped:
      - Send SMS if step.send_sms
      - Send email if step.send_email
      - Log messages
   d. Increment sequence_step
   e. Calculate next_followup_at based on next step timing
   f. If no more steps, set sequence_status = 'completed'
```

### New Lead Processing

**Triggered**: When lead is created via any method

**Logic**:
```
1. Normalize phone number to E.164 format
2. Set first sequence step (instant response)
3. Send SMS and email immediately
4. Log messages
5. Set first_contacted_at and response_time_seconds
6. Calculate next_followup_at for step 2
7. Send new lead notification to owners
```

---

## Twilio Setup

### Requirements

1. Twilio account
2. Purchase local phone number (513 area code for Cincinnati)
3. Configure SMS webhook URL: `https://{app-domain}/api/webhooks/twilio`
4. Enable incoming SMS

### Environment Variables

```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+15135551234
```

### Sending SMS

```javascript
const twilio = require('twilio');
const client = twilio(accountSid, authToken);

await client.messages.create({
  body: 'Message text',
  to: '+15135559876',
  from: process.env.TWILIO_PHONE_NUMBER
});
```

### Receiving SMS

Twilio POSTs to webhook:
```
{
  "From": "+15135559876",
  "To": "+15135551234",
  "Body": "Yes I'm interested!"
}
```

---

## Resend Setup

### Requirements

1. Resend account
2. Verify sending domain or use their subdomain
3. Get API key

### Environment Variables

```
RESEND_API_KEY=...
EMAIL_FROM=Nathan Ricke <nathan@hdd-cincinnati.com>
```

### Sending Email

```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: process.env.EMAIL_FROM,
  to: 'lead@example.com',
  subject: 'Thanks for contacting us!',
  html: '<p>Email body here</p>'
});
```

---

## Phone Number Normalization

Leads may enter phone numbers in various formats. Normalize to E.164 for Twilio:

```javascript
function normalizePhone(phone: string): string | null {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Handle US numbers
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Invalid
  return null;
}
```

---

## Notification System

When a new lead comes in or a lead responds, notify the owners.

### Options (implement one)

**Option A: Email notification**
Send email to Nathan and Brinton with lead details and link to dashboard.

**Option B: SMS notification**
Send SMS to their personal phones: "New lead: John Smith, Deck project in Mason. View: {link}"

**Option C: Both**
Email for full details, SMS for instant alert.

Recommend starting with email only to avoid SMS overload.

---

## Environment Variables

```
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://leads.hdd-cincinnati.com

# Email (magic links and notifications)
RESEND_API_KEY=...
EMAIL_FROM=Nathan Ricke <nathan@hdd-cincinnati.com>

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+15135551234

# Cal.com
CAL_API_KEY=...
CAL_BOOKING_LINK=https://cal.com/hdd-cincinnati/consultation

# Cron security
CRON_SECRET=...

# Webhook security (for external lead sources)
WEBHOOK_SECRET=...
```

---

## File Structure

```
hdd-lead-response/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Dashboard
│   │   ├── leads/
│   │   │   ├── page.tsx             # Leads list
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Manual entry
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Lead detail
│   │   ├── messages/
│   │   │   └── page.tsx             # All messages
│   │   ├── sequences/
│   │   │   └── page.tsx             # Edit sequences
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── leads/
│   │   │   ├── route.ts             # List/Create
│   │   │   ├── webhook/
│   │   │   │   └── route.ts         # External webhook
│   │   │   └── [id]/
│   │   │       ├── route.ts         # Get/Update/Delete
│   │   │       ├── messages/
│   │   │       │   └── route.ts
│   │   │       ├── pause/
│   │   │       │   └── route.ts
│   │   │       ├── resume/
│   │   │       │   └── route.ts
│   │   │       ├── skip/
│   │   │       │   └── route.ts
│   │   │       └── close/
│   │   │           └── route.ts
│   │   ├── messages/
│   │   │   └── route.ts             # List/Send
│   │   ├── sequences/
│   │   │   └── route.ts             # Get/Update
│   │   ├── settings/
│   │   │   └── route.ts
│   │   ├── webhooks/
│   │   │   ├── twilio/
│   │   │   │   └── route.ts         # Inbound SMS
│   │   │   └── cal/
│   │   │       └── route.ts         # Booking webhook
│   │   └── cron/
│   │       └── process-followups/
│   │           └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── lead-card.tsx
│   ├── message-thread.tsx
│   ├── compose-message.tsx
│   ├── sequence-editor.tsx
│   └── ...
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── twilio.ts
│   ├── resend.ts
│   ├── cal.ts
│   ├── templates.ts                 # Template rendering
│   ├── phone.ts                     # Phone normalization
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── .env.local
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

---

## Vercel Cron Configuration

```json
{
  "crons": [
    {
      "path": "/api/cron/process-followups",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## Initial Data Setup

```sql
-- Default sequence steps
INSERT INTO sequence_steps (step_number, name, delay_minutes, delay_type, send_sms, send_email, sms_template, email_subject_template, email_body_template) VALUES
(1, 'Instant Response', 0, 'from_start', true, true, 
  'Hi {{first_name}}! This is Nathan from Hickory Dickory Decks. Thanks for reaching out about your {{project_type}} project. I''d love to learn more and give you a free estimate.\n\nBook a time that works for you: {{booking_link}}\n\nOr just reply here and I''ll call you back within the hour.',
  'Thanks for contacting Hickory Dickory Decks, {{first_name}}!',
  '... full email template ...'
),
(2, '4-Hour Follow-Up', 240, 'from_start', true, false,
  'Hey {{first_name}}, just following up on your deck inquiry. Happy to answer any questions or schedule a time to come take a look. What works best for you?',
  NULL, NULL
),
(3, '24-Hour Follow-Up', 1440, 'from_start', false, true,
  NULL,
  'A few things to know about your {{project_type}} project',
  '... full email template ...'
),
(4, '72-Hour Follow-Up', 4320, 'from_start', true, false,
  'Hi {{first_name}}, still thinking about your deck project? I''m here when you''re ready. Feel free to reach out anytime. - Nathan, Hickory Dickory Decks',
  NULL, NULL
),
(5, '7-Day Follow-Up', 10080, 'from_start', false, true,
  NULL,
  'Still interested in your deck project, {{first_name}}?',
  '... full email template ...'
);

-- Default settings
INSERT INTO settings (key, value) VALUES
('business_name', 'Hickory Dickory Decks Cincinnati'),
('business_phone', '513-572-1200'),
('business_email', 'nricke@decks.ca'),
('booking_link', 'https://cal.com/hdd-cincinnati/consultation'),
('notification_email', 'nricke@decks.ca'),
('notification_sms', '');
```

---

## Testing Checklist

### Lead Intake
- [ ] Create lead manually via dashboard
- [ ] Create lead via webhook
- [ ] Phone number normalizes correctly
- [ ] Instant SMS sends
- [ ] Instant email sends
- [ ] Lead appears in dashboard

### Sequence Processing
- [ ] Follow-up sends at correct time
- [ ] Sequence pauses when lead responds
- [ ] Sequence stops when consultation booked
- [ ] Manual pause/resume works
- [ ] Skip to next step works

### Inbound Messages
- [ ] Inbound SMS matched to correct lead
- [ ] Inbound SMS logged in message history
- [ ] Notification sent to owners
- [ ] Lead status updates to engaged

### Cal.com Integration
- [ ] Booking link works
- [ ] Webhook receives booking notification
- [ ] Lead status updates to booked
- [ ] Consultation time recorded

### Dashboard
- [ ] New leads appear immediately
- [ ] Status filters work
- [ ] Message thread displays correctly
- [ ] Manual message sending works

---

## Future Enhancements (Out of Scope for V1)

- CRM integration (push leads to their existing CRM)
- Email parsing for automatic lead intake
- AI-powered response suggestions
- Lead scoring based on project type and location
- SMS conversation threading in UI
- Voicemail drop integration
- Google Ads conversion tracking
- A/B testing for message templates
- Analytics dashboard (response rates, conversion rates)
- Multi-franchise support
