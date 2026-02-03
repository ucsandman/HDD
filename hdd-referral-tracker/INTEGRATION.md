# Lead Response Integration Guide

## Overview

The Referral Tracker can receive leads from the HDD Lead Response system. This document explains how to integrate the two systems.

## Integration Methods

### Method 1: Manual JSON Sync (Current Implementation)

**Use Case**: Low-volume manual sync, testing

**Steps**:
1. In Lead Response, export lead as JSON
2. In Referral Tracker, click "Sync from Lead Response"
3. Paste JSON and click "Import"

**Pros**:
- Works immediately
- No server infrastructure needed
- Full control over what syncs

**Cons**:
- Manual process
- Not real-time

### Method 2: Webhook Integration (Future Enhancement)

**Use Case**: Automatic real-time sync

**Architecture**:
```
Lead Response → Webhook → Cloud Function → Referral Tracker
```

**Implementation Plan**:
1. Add webhook endpoint to Lead Response
2. Create cloud function to relay data
3. Use localStorage API or backend database
4. Update Referral Tracker to poll for updates

**Pros**:
- Automatic sync
- Real-time updates
- No manual intervention

**Cons**:
- Requires backend infrastructure
- More complex setup

### Method 3: Shared Database (Advanced)

**Use Case**: Full integration, enterprise scale

**Architecture**:
```
Lead Response ← PostgreSQL → Referral Tracker
```

**Implementation Plan**:
1. Migrate Referral Tracker from localStorage to API
2. Share Neon PostgreSQL database
3. Add referral tables to Lead Response schema
4. Real-time sync via database

**Pros**:
- Single source of truth
- Real-time sync
- Full referral workflow integration

**Cons**:
- Major refactor required
- Auth/permissions complexity
- Backend API needed

## Current JSON Format

### From Lead Response to Referral Tracker

```json
{
  "name": "John Doe",
  "phone": "555-1234",
  "email": "john@example.com",
  "source": "Google Search",
  "referralCode": "JOHN123",
  "status": "new",
  "notes": "Interested in deck replacement"
}
```

**Field Mapping**:

| Lead Response Field | Referral Tracker Field | Notes |
|---------------------|------------------------|-------|
| `name` | `name` | Required |
| `phone` | `phone` | Optional |
| `email` | `email` | Optional |
| `source` | `source` | Defaults to "Other" |
| `referralCode` | `referralCode` | Links to referrer |
| `status` | `status` | Defaults to "new" |
| `notes` | `notes` | Optional |

### Validation Rules

**Referral Tracker validates**:
- Name is required
- Phone format (any format accepted)
- Email format (basic validation)
- Source must be from predefined list
- Status must be valid (new/contacted/quoted/qualified/sold/lost)
- Duplicates checked by phone and email

**On Duplicate**:
- Manual import: User prompted to confirm
- CSV/JSON import: Skipped with reason in report

## Referral Code Workflow

### Creating Referral Codes

**In Referral Tracker**:
1. Go to Referrers tab
2. Click "+ Add Referrer"
3. Enter customer name
4. Code auto-generated (e.g., "JOHN123")
5. Share code with customer

**Code Format**: `[First 4 letters of name][3 random digits]`

Example: "John Smith" → "JOHN847"

### Using Referral Codes

**When Lead Comes In**:
1. Lead provides referral code
2. Add code to lead in Lead Response
3. Export to Referral Tracker (or sync automatically)
4. Referral Tracker links lead to referrer
5. Referrer's count increments

**Tracking**:
- Lead shows referral code in detail view
- Referrer card shows count and value
- Analytics shows referral metrics

## Testing the Integration

### Test Data

Sample lead for testing:

```json
{
  "name": "Test Customer",
  "phone": "555-9999",
  "email": "test@example.com",
  "source": "Customer Referral",
  "referralCode": "TEST123",
  "notes": "This is a test lead"
}
```

### Test Steps

1. **Create Test Referrer**:
   - Go to Referrers tab
   - Add referrer named "Test Referrer"
   - Note the generated code (e.g., "TEST123")

2. **Import Test Lead**:
   - Go to Leads tab
   - Click "Sync from Lead Response"
   - Paste test JSON (use code from step 1)
   - Click "Import"

3. **Verify**:
   - Lead appears in leads list
   - Lead shows referral code
   - Go to Referrers tab
   - Test Referrer's count is now 1

4. **Test Duplicate**:
   - Import same JSON again
   - Should skip with duplicate message

5. **Test Status Update**:
   - Change lead status to "sold"
   - Enter value (e.g., 10000)
   - Check referrer's total value updates

### Sample CSV for Bulk Testing

Use `sample-leads.csv` in project root:
- 10 sample leads
- Mix of sources
- Some with referral codes
- Various statuses

## Best Practices

### For Lead Response Team

1. **Always include referral code** if customer mentions one
2. **Use consistent source names** (match Referral Tracker list)
3. **Export/sync leads daily** to keep data fresh
4. **Test on staging first** before production

### For Referral Tracker Users

1. **Export CSV regularly** as backup
2. **Review import results** for errors/duplicates
3. **Create referrers BEFORE** leads come in
4. **Keep referral codes simple** and memorable

### Data Hygiene

1. **Phone Numbers**: Accept any format, stored as entered
2. **Email Addresses**: Case-insensitive comparison
3. **Names**: Exact match required for duplicates
4. **Referral Codes**: Case-insensitive, stored uppercase

## Troubleshooting

### Lead Not Linking to Referrer

**Problem**: Lead has referral code but not linking

**Check**:
1. Referrer exists in system
2. Code matches exactly (case-insensitive)
3. Code in uppercase in lead data
4. Refresh page to see update

**Fix**: Edit lead, re-enter referral code

### Duplicate Detection Issues

**Problem**: Legitimate lead marked as duplicate

**Options**:
1. Manual add: Click "Add anyway" in confirmation
2. CSV import: Remove duplicate from CSV, import separately
3. Edit existing lead instead

### Import Errors

**Problem**: CSV import fails

**Check**:
1. File is valid CSV format
2. First row has headers
3. `name` column exists
4. No special characters in file
5. File encoding is UTF-8

**Fix**: Re-export CSV, check format

### Missing Referrer Count

**Problem**: Referrer count doesn't match actual leads

**Cause**: Count only increments when lead is added/imported

**Fix**: Count is automatic, no manual fix needed

## Future Enhancements

### Phase 1: Webhook Integration
- Add webhook endpoint to Referral Tracker
- Configure Lead Response to POST on new lead
- HMAC signature verification
- Real-time updates

### Phase 2: Bidirectional Sync
- Lead status updates flow back to Lead Response
- Referrer information visible in Lead Response
- Unified dashboard view

### Phase 3: Full Integration
- Shared database architecture
- Single authentication system
- Combined analytics dashboard
- Automated referral reward calculations

## Support

For integration issues:
1. Check this documentation
2. Review FEATURES.md for feature details
3. Test with sample data first
4. Contact development team

## Appendix: Valid Source Names

Must use exact names from this list:
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

Any other source will default to "Other".
