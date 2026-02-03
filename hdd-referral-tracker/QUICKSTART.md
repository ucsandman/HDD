# Quick Start Guide - Referral Tracker

## First Time Setup

1. **Open the tool**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:5173 in your browser

2. **Add your first referrer**
   - Click "Referrers" tab
   - Click "+ Add Referrer"
   - Enter customer name: "John Smith"
   - System generates code: "JOHN123"
   - Click "Create Referrer"

3. **Add a lead manually**
   - Click "Leads" tab
   - Click "+ Add Lead"
   - Enter name: "Jane Doe"
   - Enter phone: "555-1234"
   - Enter referral code: "JOHN123"
   - Click "Add Lead"
   - Notice: Notification shows "Lead linked to referrer: John Smith"

4. **Test CSV import**
   - Click "Leads" tab
   - Click "Import CSV"
   - Select `sample-leads.csv` from project folder
   - Preview shows first 5 rows
   - Click "Import"
   - Result: 10 leads imported

5. **View analytics**
   - Click "Analytics" tab
   - See total stats at top
   - Change date range to "This Month"
   - View conversion funnel
   - Review source performance table

## Daily Workflow

### When a lead calls with a referral code:

1. Go to Leads tab
2. Click "+ Add Lead"
3. Enter lead info
4. Enter referral code
5. Click "Add Lead"
6. System links to referrer automatically

### When lead status changes:

1. Find lead in Leads tab
2. Click status dropdown
3. Select new status
4. If "Sold", enter project value
5. Referrer's total value updates

### To export for backup:

1. Go to Leads tab
2. Click "Export CSV"
3. Save file (e.g., `hdd-leads-2026-02-03.csv`)
4. Repeat for Referrers tab

### To sync from Lead Response:

1. Copy JSON from Lead Response
2. Go to Leads tab
3. Click "Sync from Lead Response"
4. Paste JSON
5. Click "Import"

## Common Tasks

### Import multiple leads from spreadsheet

1. Prepare CSV with columns: name, phone, email, source, referralCode
2. Go to Leads tab → "Import CSV"
3. Select file
4. Review preview
5. Click "Import"
6. Check results (imported/skipped/errors)

### Find all leads from a referrer

1. Go to Referrers tab
2. Find referrer card
3. Note their code (e.g., "JOHN123")
4. Go to Leads tab
5. Look for "Ref: JOHN123" in lead details

### View performance by date range

1. Go to Analytics tab
2. Click date range dropdown
3. Select "This Week", "This Month", "This Quarter", or "All Time"
4. Stats update automatically

### Check conversion rates

1. Go to Analytics tab
2. View "Conversion Rate" stat card
3. Scroll to "Lead Source Performance" table
4. See conversion rate per source

## Tips

- **Export regularly**: CSV export is your backup
- **Use referral codes**: Always ask if lead was referred
- **Check duplicates**: System warns before adding duplicates
- **Update status**: Keep lead statuses current for accurate analytics
- **Review funnel**: Conversion funnel shows where leads drop off

## Keyboard Shortcuts

- No keyboard shortcuts currently
- All actions via mouse/touch

## Mobile Use

- Fully responsive
- All features work on mobile
- Buttons stack vertically
- Tables scroll horizontally

## Troubleshooting

### Lead not linking to referrer
- Check referral code matches exactly
- Code is case-insensitive
- Refresh page to see update

### CSV import fails
- Ensure first row has headers
- Check "name" column exists
- Try removing special characters

### Duplicate detected
- Manually: Click "Add anyway" to override
- Import: Duplicate is skipped automatically
- Check if lead already exists

## Next Steps

1. Read [FEATURES.md](FEATURES.md) for detailed feature info
2. Review [INTEGRATION.md](INTEGRATION.md) for Lead Response sync
3. Test with [sample-leads.csv](sample-leads.csv)

## Support

For help:
1. Check README.md
2. Review FEATURES.md
3. See INTEGRATION.md
4. Contact development team

---

**Last Updated**: February 3, 2026
