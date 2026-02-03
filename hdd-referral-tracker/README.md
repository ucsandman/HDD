# HDD Referral Tracker

Lead tracking and referral management system for Hickory Dickory Decks Cincinnati.

## Features

### Lead Management
- Track leads from multiple sources
- Status workflow: New → Contacted → Quoted → Qualified → Sold/Lost
- Referral code tracking and attribution
- Contact information and notes
- **CSV bulk import** with duplicate detection
- **JSON import** from Lead Response system
- **CSV export** for backup/analysis
- **Duplicate detection** by phone/email

### Referrer Management
- Auto-generate unique referral codes
- Track referral counts and total value
- Automatic value updates when leads close
- Contact information storage
- **CSV export** for reporting

### Analytics (Enhanced)
- **Date range filtering**: Week/Month/Quarter/All Time
- **Conversion funnel**: Visual pipeline from new to sold
- **Average time to close**: Per source and overall
- **Enhanced metrics**: Conversion rates, revenue tracking
- Lead source performance comparison
- Real-time calculations

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Documentation

- **[FEATURES.md](FEATURES.md)** - Detailed feature documentation
- **[INTEGRATION.md](INTEGRATION.md)** - Lead Response integration guide
- **[sample-leads.csv](sample-leads.csv)** - Sample data for testing imports

## How It Works

### Creating Referrers

1. Go to **Referrers** tab
2. Click **+ Add Referrer**
3. Enter customer name (phone/email optional)
4. System generates unique code (e.g., JOHN123)
5. Share code with customer

### Adding Leads

**Manual Entry**:
1. Go to **Leads** tab
2. Click **+ Add Lead**
3. Fill in details
4. Optional: Enter referral code
5. System links to referrer automatically

**CSV Import**:
1. Click **Import CSV**
2. Select CSV file (see format in FEATURES.md)
3. Preview and confirm
4. Review import results

**Lead Response Sync**:
1. Click **Sync from Lead Response**
2. Paste JSON payload
3. System imports and links referrers
4. Skips duplicates automatically

### Tracking Workflow

1. **New lead arrives** → Status: New
2. **Make contact** → Status: Contacted
3. **Send quote** → Status: Quoted
4. **Lead qualified** → Status: Qualified
5. **Project sold** → Status: Sold (enter value)
   - Referrer's totalValue updates
6. **Lost deal** → Status: Lost

### Referral Attribution

When lead has referral code:
- System finds matching referrer
- Increments referrer's count
- Shows notification
- Updates sold count when closed
- Adds to referrer's total value

## Data Storage

All data stored in browser localStorage:
- `hdd-leads`: Lead records
- `hdd-referrers`: Referrer records

**Important**: Data is browser-specific. Regular CSV exports recommended for backup.

## Import/Export

### CSV Import Format

```csv
name,phone,email,source,referralCode,status,value,createdAt,notes
John Doe,555-1234,john@email.com,Google Search,JOHN123,new,,2026-02-03,Notes here
```

Only `name` is required. See FEATURES.md for full documentation.

### JSON Import Format

```json
{
  "name": "John Doe",
  "phone": "555-1234",
  "email": "john@email.com",
  "source": "Google Search",
  "referralCode": "JOHN123"
}
```

See INTEGRATION.md for Lead Response integration details.

### Duplicate Detection

System automatically checks:
- Phone numbers (exact match)
- Email addresses (case-insensitive)

**Behavior**:
- Manual add: Prompts user to confirm
- CSV/JSON import: Skips with reason in report

## Tabs

### Analytics
- **Date range filter**: Week, Month, Quarter, All Time
- **Conversion funnel**: Visual pipeline from lead to sale
- **Key metrics**: Total leads, sold, revenue, conversion rate, avg close time
- **Source performance**: Compare all lead sources with metrics
- **Referral tracking**: Count and value from referrals

### Leads
- Complete lead list with color-coded status
- Quick status updates with dropdown
- Contact information display
- **Import CSV**: Bulk upload leads from spreadsheet
- **Sync from Lead Response**: JSON import for integration
- **Export CSV**: Download all leads for backup
- Automatic referrer linking via codes

### Referrers
- Referrer cards with unique codes
- Referral counts and total value tracking
- Sold count per referrer
- Copy code to clipboard
- **Export CSV**: Download all referrers

## Lead Sources

Valid sources (must match exactly for CSV import):
- Google Search
- Google Business Profile
- Facebook
- Instagram
- Nextdoor
- Yard Sign
- Customer Referral
- Home Show
- Angi/HomeAdvisor
- Thumbtack
- Direct Mail
- Other

Analytics tracks performance for each source.

## Tech Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS v4

## Commands

```bash
npm run dev      # Development server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Testing

Use provided `sample-leads.csv` to test CSV import:
- 10 sample leads
- Various sources and statuses
- Some with referral codes
- Mix of data for analytics testing

## Status Colors

- **Blue**: New lead
- **Orange**: Contacted
- **Purple**: Quoted
- **Green**: Qualified
- **Brown**: Sold
- **Red**: Lost

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (14+)
- Mobile: Responsive design, all features work

## Future Enhancements

Potential additions:
- Real-time webhook integration with Lead Response
- Email notifications for referrers
- Advanced filtering and search
- Bulk operations
- API integration
- Referral reward tracking system

See INTEGRATION.md for integration roadmap.
