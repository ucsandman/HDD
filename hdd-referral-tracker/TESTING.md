# Testing the Referral Reward Manager

## Manual Testing Checklist

### Setup
1. Run `npm run dev` and open http://localhost:5175
2. Clear localStorage if you want a fresh start (browser DevTools → Application → Storage)

### Test Scenario: Complete Reward Flow

#### Step 1: Configure Rewards (Optional)
1. Click on "Rewards" tab
2. Click "Configure Rewards" button
3. Verify default values:
   - Qualified Lead Reward: $50
   - Sold Project Reward: $200
   - Bonus Threshold: 5 referrals
   - Bonus Amount: $100
4. Optionally change values and click "Save Settings"

#### Step 2: Add a Referrer
1. Click on "Referrers" tab
2. Click "+ Add Referrer"
3. Fill in:
   - Customer Name: "John Smith"
   - Phone: "513-555-1234"
   - Email: "john@example.com"
   - Project Date: Select any date
4. Click "Create Referrer"
5. Verify: Auto-generated code appears (e.g., JOHN123)
6. Click copy button and verify code is copied

#### Step 3: Add a Lead with Referral Code
1. Click on "Leads" tab
2. Click "+ Add Lead"
3. Fill in:
   - Name: "Jane Doe"
   - Phone: "513-555-5678"
   - Email: "jane@example.com"
   - Source: Select any source
   - Referral Code: Paste the code from Step 2
4. Click "Add Lead"
5. Verify: Lead appears with referral code badge

#### Step 4: Qualify the Lead (First Reward)
1. In Leads tab, find the lead from Step 3
2. Change status dropdown from "New" to "Qualified"
3. Verify:
   - Green notification appears: "$50 earned for qualified lead!"
   - Lead card border turns green
4. Switch to "Rewards" tab
5. Verify:
   - "Total Earned" stat shows $50
   - "Pending Payouts" stat shows $50
   - John Smith appears in "Pending Payouts" section with $50
   - History shows one event: "lead" type with +$50

#### Step 5: Mark Lead as Sold (Second Reward)
1. Go back to "Leads" tab
2. Change the same lead from "Qualified" to "Sold"
3. Enter project value: 15000
4. Verify:
   - Green notification appears: "$200 earned for sold project!"
   - Lead card border turns brown/accent color
5. Switch to "Rewards" tab
6. Verify:
   - "Total Earned" stat shows $250
   - "Pending Payouts" stat shows $250
   - John Smith now shows $250 pending
   - History shows two events: "lead" and "sold"

#### Step 6: Test Bonus Threshold
1. Add 4 more leads with John's referral code
2. Change each to "Qualified" status
3. On the 5th qualified/sold lead, verify:
   - Notification: "Bonus awarded to John Smith for 5 referrals!"
   - Rewards tab shows +$100 bonus event
   - Total earned includes bonus

#### Step 7: Record a Payout
1. In "Rewards" tab, click "Record Payout" for John Smith
2. Enter amount: 250
3. Optionally add note: "Check #1234"
4. Click "Record Payment"
5. Verify:
   - Green notification: "Payout of $250 recorded!"
   - "Total Paid" stat increases
   - "Pending Payouts" decreases
   - John Smith moves out of pending section (or shows $0)
   - History shows "payout" event with -$250

#### Step 8: Annual Summary
1. In "Rewards" tab, scroll to "Annual Summary" section
2. Verify John Smith's row shows:
   - Referrals count
   - Year-to-date earned
   - Year-to-date paid
   - Current pending balance

### Edge Cases to Test

#### Overpayment Protection
1. Try to record payout greater than pending amount
2. Verify: Input accepts it but doesn't go negative

#### Multiple Referrers
1. Add 2-3 different referrers
2. Add leads for each
3. Verify rewards are tracked separately

#### Status Rollback
1. Change lead from "Qualified" back to "Contacted"
2. Note: Rewards are NOT removed (by design - prevents gaming)
3. Changing back to "Qualified" does NOT award again (by design)

#### Configuration Changes
1. Change reward amounts in settings
2. Add new leads and qualify them
3. Verify NEW leads use new amounts
4. Verify OLD reward events remain unchanged

#### Data Persistence
1. Perform several actions
2. Refresh the page
3. Verify all data persists via localStorage
4. Check different tabs to ensure state is maintained

### Browser Compatibility
Test in:
- Chrome/Edge (primary)
- Firefox
- Safari (if available)

Verify:
- Notifications appear and auto-dismiss
- Modal forms work
- Copy-to-clipboard functions
- Date inputs display correctly

### Responsive Design
1. Test at different screen widths:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1200px)
2. Verify all sections are readable and functional

## Expected Results Summary

After completing the test scenario:
- Analytics tab shows lead source breakdown
- Leads tab shows all leads with color-coded status
- Referrers tab shows referrer cards with codes and stats
- Rewards tab shows:
  - Overall stats (earned, paid, pending)
  - Pending payouts list
  - Annual summary table
  - Complete history log
  - Current configuration

## Known Behaviors

1. **Rewards are immutable**: Once awarded, they cannot be removed (even if lead status changes)
2. **No duplicate rewards**: Changing to same status twice doesn't award twice
3. **Bonus calculates total**: Bonus is based on total qualified+sold count, not incremental
4. **Config is forward-only**: Settings changes don't affect existing reward events
5. **No data export**: Currently no export/import functionality
6. **Browser-specific**: Data is stored per-browser in localStorage

## Cleanup

To reset all data:
1. Open browser DevTools → Application → Storage → Local Storage
2. Delete: `hdd-leads`, `hdd-referrers`, `hdd-reward-config`
3. Refresh page
