# Customer Anniversary Engine

## Overview

The Customer Anniversary Engine is a lifecycle marketing automation system built into the Warranty Tracker. It automatically tracks key milestones after project completion and enables targeted communication campaigns to drive reviews, maintenance engagement, and repeat business.

## Features Implemented

### 1. Anniversary Tracking Fields

Added to the `Customer` interface:

```typescript
interface Customer {
  // ... existing fields
  projectCompletionDate: string // ISO date
  anniversaryTriggers: {
    day30Review: { sent: boolean; sentAt?: string }
    month6Maintenance: { sent: boolean; sentAt?: string }
    year1Anniversary: { sent: boolean; sentAt?: string }
    yearlyAnniversary: { year: number; sent: boolean; sentAt?: string }[]
  }
}
```

### 2. Anniversary Dashboard

#### New Stats Card
- **Anniversary Emails Due** - Shows total count of all pending anniversary communications
- Displayed alongside existing Checkup and Warranty stats
- Color-coded with brand brown (#8B4513)

#### Anniversary Filter Tab
- New "Anniversaries" filter button in toolbar
- Shows badge with count when anniversaries are due
- Filters to show only customers with pending anniversary emails

#### Anniversary Summary Panel
- Appears when "Anniversaries" filter is active
- Breaks down pending anniversaries by type:
  - 30-day review requests
  - 6-month maintenance tips
  - 1-year anniversaries
  - Annual anniversaries (2+ years)

### 3. Anniversary Email Templates

Four milestone-based email templates with personalized content:

#### 30-Day Review Request
- **Trigger**: 30 days after project completion
- **Purpose**: Request Google review while experience is fresh
- **Content**:
  - Personalized greeting
  - Review request with direct link
  - Invitation to report any issues
- **Subject**: "How's your new [project type], [first name]?"

#### 6-Month Maintenance Tips
- **Trigger**: 182 days (~6 months) after completion
- **Purpose**: Provide seasonal maintenance guidance
- **Content**:
  - Season-appropriate maintenance tips
  - Material-specific guidance (composite vs wood)
  - Warranty reminder
  - Secondary review request
- **Subject**: "6 months with your [project type] - maintenance tips inside"

#### 1-Year Anniversary
- **Trigger**: 365 days after completion
- **Purpose**: Celebrate milestone and upsell additional services
- **Content**:
  - Anniversary celebration
  - Upgrade suggestions (pergola, privacy screens, outdoor kitchen, lighting)
  - Returning customer pricing mention
  - Free consultation offer
- **Subject**: "Happy deck-iversary, [first name]!"

#### Annual Anniversary (2+ years)
- **Trigger**: Each subsequent year after year 1
- **Purpose**: Maintenance check-in and referral request
- **Content**:
  - Year milestone acknowledgment
  - Inspection offer
  - Warranty status update
  - $200 referral bonus program
- **Subject**: "Your [project type] turns [N]!"
- **Smart Logic**: Tracks sent years to avoid duplicates

### 4. Anniversary Actions

#### Visual Alerts on Customer Cards
- Color-coded badges show due anniversaries:
  - **Blue** - 30-Day Review
  - **Yellow** - 6-Month Maintenance
  - **Green** - 1-Year Anniversary
  - **Pink** - Annual Anniversary

#### Anniversary Email Buttons
- One-click action buttons for each due anniversary
- Copy email to clipboard
- Automatically mark as sent with timestamp
- Buttons disappear after email is marked sent

#### Mark as Sent Tracking
- Records sent date for each anniversary type
- Prevents duplicate communications
- Maintains full audit trail

### 5. Data Migration

The app automatically migrates existing customer records on load:
- Sets `projectCompletionDate` from `projectDate` if missing
- Initializes empty `anniversaryTriggers` object for legacy records
- Preserves all existing data

## Usage Guide

### For New Customers

When adding a new customer, anniversary tracking begins automatically:
1. Enter customer details and project date
2. System initializes all anniversary triggers as "not sent"
3. Customer appears in anniversary filter when milestones are reached

### Viewing Due Anniversaries

1. Click "Anniversaries" tab in toolbar
2. See summary panel with breakdown by type
3. Scroll through filtered customer list
4. Anniversary badges show which milestones are due

### Sending Anniversary Emails

For each due customer:

1. **Review the customer card** - See which anniversaries are due via colored badges
2. **Click the anniversary button** - E.g., "30-Day Review", "6-Month Tips", etc.
3. **Email copies to clipboard** - Ready to paste into email client
4. **Automatically marked as sent** - Won't appear in list again
5. **Timestamp recorded** - Full audit trail maintained

### Email Customization

Before sending, you can:
- Edit the email content in your email client
- Personalize further based on customer notes
- Add photos or attachments
- Adjust Google review link (update in code once)

## Technical Details

### Anniversary Detection Logic

```typescript
isDueForAnniversary(customer, type)
```

- **30-day**: daysSince >= 30 && not already sent
- **6-month**: daysSince >= 182 && not already sent
- **1-year**: daysSince >= 365 && not already sent
- **yearly**: yearsSince >= 2 && yearsSince > last sent year

### Sent Tracking

```typescript
markAnniversarySent(customerId, type)
```

- Updates anniversaryTriggers with sent flag and timestamp
- For yearly anniversaries, adds entry to array with year number
- Prevents duplicate sends via logic in `isDueForAnniversary`

### Local Storage

All data persists to `localStorage` under key `hdd-warranties`:
- Anniversary triggers
- Sent timestamps
- Email history
- Full customer records

## Configuration

### Google Review Link

Update in `generateAnniversaryEmailContent`:

```typescript
const googleReviewLink = 'https://g.page/r/YOUR_GOOGLE_REVIEW_LINK_HERE/review'
```

Replace with your actual Google Business Profile review URL.

### Timing Adjustments

Modify trigger days in `isDueForAnniversary`:
- 30-day: Change `daysSince >= 30`
- 6-month: Change `daysSince >= 182`
- 1-year: Change `daysSince >= 365`

### Email Content

All email templates in `generateAnniversaryEmailContent` function:
- Fully customizable HTML and text
- Uses customer data for personalization
- Material-specific logic for maintenance tips

## Workflow Examples

### Scenario 1: New Deck Customer

**Day 1** - Project completed for John Smith, Trex Transcend deck
- System records `projectCompletionDate: 2025-01-01`
- All anniversary triggers initialized as not sent

**Day 31** - 30-day milestone reached
- John appears in "Anniversaries" filter
- Blue "30-Day Review" badge shows
- Click button → email copied with Google review request
- Marked as sent with timestamp `2025-02-01`

**Day 183** - 6-month milestone
- John reappears in filter
- Yellow "6-Month Tips" badge shows
- Click button → seasonal maintenance email copied
- Includes composite deck care tips specific to Trex

**Day 366** - 1-year milestone
- Green "1-Year Anniversary" badge shows
- Upsell email copied with pergola/lighting suggestions
- Returning customer pricing mentioned

**Year 3, 4, 5...** - Annual check-ins
- Pink "Annual Anniversary" badge each year
- Inspection offer + referral bonus email
- Tracks each year sent to prevent duplicates

### Scenario 2: Bulk Anniversary Campaign

**Goal**: Send all due 30-day reviews

1. Click "Anniversaries" filter
2. Summary shows "5 due for 30-day review request"
3. For each customer:
   - Click "30-Day Review" button
   - Paste into email client
   - Customize if needed
   - Send
4. All automatically marked sent
5. Filter clears those 5 customers

## Best Practices

### Timing
- Send 30-day reviews between weeks 4-6 for best response
- 6-month emails work best in spring/fall for seasonal relevance
- 1-year anniversaries can tie to weather ("Perfect timing for a pergola!")

### Personalization
- Always review customer notes before sending
- Reference specific project details from notes
- Adjust tone for VIP or difficult customers

### Follow-up
- If no review after 30-day email, follow up in checkup email
- For 1-year upsells, note interest in customer record
- Track referrals in separate referral tracker tool

### Coordination
- Don't send anniversary + seasonal email same day
- Space communications by at least 2 weeks
- Use email history to avoid over-communication

## Future Enhancements

Potential additions for v2:

1. **Email Integration**
   - Direct send from app (requires SMTP/API)
   - Track open/click rates
   - A/B test subject lines

2. **Smart Scheduling**
   - Queue emails for optimal send times
   - Batch processing for Monday morning campaigns
   - Automated drip sequences

3. **Analytics Dashboard**
   - Review conversion rates by template
   - Revenue from upsells
   - Referral tracking integration

4. **Template Variants**
   - A/B test different copy
   - Seasonal variations
   - Project-type specific templates

5. **Advanced Triggers**
   - Weather-based timing (spring thaw = deck inspection)
   - Local events (home show = upsell timing)
   - Customer behavior triggers

## Support

For issues or questions:
- Check CLAUDE.md for project context
- Review customer data in localStorage
- Lint errors: `npm run lint`
- Test locally: `npm run dev`

## License

Part of HDD Marketing Tools suite for Hickory Dickory Decks Cincinnati franchise.
