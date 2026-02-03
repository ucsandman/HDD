# Changelog

## [2.0.0] - 2026-02-03

### Added

#### CSV Import/Export
- **CSV Import**: Bulk import leads from CSV files
  - File upload with preview
  - Duplicate detection by phone/email
  - Validation of all fields
  - Import summary with success/skip/error counts
  - Automatic referrer linking
- **CSV Export**: Export leads and referrers to CSV
  - One-click download
  - Date-stamped filenames
  - All fields included

#### Lead Response Integration
- **JSON Import**: Paste JSON from Lead Response system
  - Single lead or array support
  - Duplicate detection
  - Automatic referrer attribution
  - Error handling and reporting

#### Enhanced Analytics
- **Date Range Filter**: Filter by Week/Month/Quarter/All Time
- **Conversion Funnel**: Visual pipeline showing:
  - New Leads
  - Contacted
  - Quoted
  - Qualified
  - Sold
  - Percentages and counts for each stage
- **New Metrics**:
  - Overall conversion rate
  - Average days to close
  - Per-source average close time
- **Enhanced Source Table**: Added "Avg Days" column

#### Duplicate Detection
- **Phone Number Check**: Exact match detection
- **Email Check**: Case-insensitive match
- **User Prompts**: Confirmation dialog on manual add
- **Import Handling**: Auto-skip with detailed reporting

#### Referral Attribution
- **Automatic Linking**: Links leads to referrers by code
- **Count Updates**: Increments referrer count on import/add
- **Value Tracking**: Updates referrer total when lead sells
- **Notifications**: Toast alerts for successful links

#### UI Enhancements
- **Notifications**: Toast messages for user actions
- **Toolbar Buttons**: Improved button layout in Leads tab
- **Import Modals**: Professional import UI with results
- **Lead Notes Display**: Shows notes in lead cards
- **Responsive Design**: Mobile-friendly layouts

### Changed
- Simplified tab structure (removed Rewards tab from existing version)
- Updated port to 5173 (standard Vite port)
- Improved referrer cards to show sold count
- Enhanced lead cards with better information display

### Technical

#### New Files
- `src/types/index.ts` - Centralized TypeScript interfaces
- `src/utils/csvUtils.ts` - CSV parsing and generation
- `src/utils/analytics.ts` - Analytics calculations
- `FEATURES.md` - Detailed feature documentation
- `INTEGRATION.md` - Lead Response integration guide
- `sample-leads.csv` - Sample data for testing

#### Updated Files
- `src/App.tsx` - Complete rewrite with new features
- `src/App.css` - Added styles for new components
- `README.md` - Updated documentation

#### Dependencies
- No new dependencies added
- Uses existing React, TypeScript, Vite stack
- All features built with vanilla JS/React

### Removed
- Rewards system (was in development version, not production)
  - Kept backup in `App-old.tsx` for reference

## [1.0.0] - 2026-01-30

### Initial Release
- Basic lead management
- Referrer tracking
- Simple analytics
- localStorage persistence

---

## Migration Guide

### From 1.0.0 to 2.0.0

**Data Migration**: Automatic
- Existing leads and referrers preserved
- No action required
- Data format unchanged

**New Features Available Immediately**:
1. Go to Leads tab → Click "Import CSV" to bulk import
2. Go to Leads tab → Click "Export CSV" to backup data
3. Go to Analytics tab → Use date range filter
4. View conversion funnel in Analytics tab

**Testing**:
1. Use `sample-leads.csv` to test import
2. Verify existing data is intact
3. Test new analytics features

**Backup Recommendation**:
Before updating, export your data:
1. Go to Leads tab → Export CSV
2. Go to Referrers tab → Export CSV
3. Save files safely

If anything goes wrong, you can re-import the CSV files.

---

## Upgrade Path

### Current Version: 2.0.0

To update:
```bash
git pull origin main
npm install
npm run build
```

### Next Version (Planned): 2.1.0

**Planned Features**:
- Webhook endpoint for automatic Lead Response sync
- Advanced filtering in Leads view
- Bulk operations (status updates, exports)
- Lead activity timeline
- Referral rewards tracking

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API/data changes
- MINOR version for backwards-compatible functionality additions
- PATCH version for backwards-compatible bug fixes

## Support

For issues or questions:
1. Check README.md for basic usage
2. Review FEATURES.md for feature details
3. See INTEGRATION.md for integration help
4. Contact development team
