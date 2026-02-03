# Anniversary Engine - Quick Start Guide

## What It Does

Automatically tracks 4 customer lifecycle milestones and generates personalized emails to drive reviews, engagement, and repeat business.

## The 4 Milestones

| Milestone | Days After | Purpose | Email Contains |
|-----------|-----------|---------|----------------|
| **30-Day Review** | 30 | Google review request | Review link, satisfaction check |
| **6-Month Maintenance** | 182 | Seasonal care tips | Material-specific maintenance |
| **1-Year Anniversary** | 365 | Celebrate + upsell | Pergola, lighting, outdoor kitchen ideas |
| **Annual Check-in** | 730+ | Inspection + referral | $200 referral bonus, free inspection |

## How to Use

### Step 1: View Due Anniversaries

Click the **"Anniversaries"** tab in the toolbar.

You'll see:
- Total count badge on the tab
- Summary panel showing breakdown by type
- Filtered list of customers with due milestones

### Step 2: Send an Anniversary Email

For each customer card:

1. **Look for colored badges**:
   - 🔵 Blue = 30-Day Review
   - 🟡 Yellow = 6-Month Maintenance
   - 🟢 Green = 1-Year Anniversary
   - 🔴 Pink = Annual Anniversary

2. **Click the anniversary button** (e.g., "📧 30-Day Review")

3. **Email copies to clipboard** - Ready to paste!

4. **Automatically marked sent** - Won't show again

### Step 3: Paste & Send

1. Open your email client (Gmail, Outlook, etc.)
2. Create new email to customer
3. **Paste** (Ctrl+V / Cmd+V)
4. Personalize if desired
5. Send!

## Example Workflow

**Monday morning - Review campaign:**

1. Click "Anniversaries" tab
2. See "3 due for 30-day review request"
3. Open Gmail in another tab
4. For each customer:
   - Click "📧 30-Day Review"
   - Switch to Gmail
   - New email → paste → personalize → send
   - Back to app (customer disappears from list)
5. Done in 10 minutes!

## Email Customization

Before sending, you can:
- Add customer's name to subject line
- Reference specific project details
- Attach before/after photos
- Add personal note from owners

## Pro Tips

### Timing
- ✅ **Best**: Monday-Wednesday, 9am-11am
- ❌ **Avoid**: Friday afternoons, weekends

### Personalization
- Check customer notes first
- Reference their specific project (deck size, material, features)
- Mention weather if relevant ("Perfect deck weather coming!")

### Don't Over-Communicate
- Email history shows recent contacts
- Space emails 2+ weeks apart
- Skip if they just booked a service

### Batch Processing
- Filter to one milestone type
- Process all at once for efficiency
- Track results (reviews received, referrals, etc.)

## Troubleshooting

### Customer doesn't appear in filter

**Check:**
- Is project date entered?
- Has milestone been reached? (30/182/365 days)
- Was email already sent? (check customer card)

### Email already marked sent by accident

**Fix:**
1. Open browser developer tools (F12)
2. Console → `localStorage.clear()` (will reset all data!)
3. **OR** manually edit the sent flag in localStorage

### Want to update email template

**Edit file:**
- Location: `src/App.tsx`
- Function: `generateAnniversaryEmailContent`
- Find the milestone type (30day, 6month, etc.)
- Update HTML content

## Google Review Link Setup

**One-time configuration:**

1. Get your Google Business Profile review link:
   - Go to your GBP dashboard
   - Share → Reviews → Copy link

2. Update in code:
   - File: `src/App.tsx`
   - Search for: `YOUR_GOOGLE_REVIEW_LINK_HERE`
   - Replace with your actual link

3. Save and reload app

## Stats & Tracking

### What Gets Tracked
- ✅ Date each anniversary email sent
- ✅ Which milestones completed per customer
- ✅ Email history (via email client separately)

### What's NOT Tracked (Yet)
- ❌ Email opens/clicks
- ❌ Reviews received
- ❌ Conversion to upsells

**Manual tracking recommended**: Use a spreadsheet to track review response rates and upsell conversions.

## Key Metrics to Watch

Track monthly:
- **30-day emails sent** → reviews received (target: 30%+)
- **1-year emails sent** → upsell consultations booked (target: 10%+)
- **Annual emails sent** → referrals received (target: 20%+)

## Integration with Other Tools

### Works With:
- **Quote Calculator** - Reference pricing for upsells
- **Review Generator** - Alternative review request method
- **Referral Tracker** - Log referrals from anniversary emails

### Coordinates With:
- **Warranty checkups** - Don't double-email same week
- **Seasonal campaigns** - Space anniversary + seasonal emails

## Sample Email Previews

### 30-Day Review
```
Subject: How's your new deck, Sarah?

Hi Sarah,

It's been about a month since we completed your Trex Transcend
deck, and we hope you're loving it!

We'd be incredibly grateful if you could take 2 minutes to
share your experience on Google...
```

### 6-Month Maintenance
```
Subject: 6 months with your deck - maintenance tips inside

Hi Sarah,

Half a year has flown by since we built your Trex Transcend deck!

Quick March maintenance tips:
• Rinse off with a garden hose to remove pollen...
```

### 1-Year Anniversary
```
Subject: Happy deck-iversary, Sarah!

Hi Sarah,

Can you believe it's been a whole year since we completed
your deck? Time flies when you're enjoying Cincinnati's
outdoor weather!

THINKING ABOUT UPGRADES?
Many customers add to their outdoor living space in year two...
```

### Annual Check-in (Year 3+)
```
Subject: Your deck turns 3!

Hi Sarah,

3 years ago, we had the pleasure of building your Trex
Transcend deck, and we wanted to check in!

REFER A FRIEND, EARN $200
Know anyone thinking about a deck or outdoor project?...
```

## Need Help?

- **Full Documentation**: See `ANNIVERSARY_FEATURE.md`
- **Project Overview**: See main `CLAUDE.md`
- **Email Nathan & Brinton**: With questions or feedback

---

**Happy Anniversary Marketing!** 🎉
