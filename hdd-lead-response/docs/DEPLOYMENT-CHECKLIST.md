# Deployment Checklist - Hardening Features

## Pre-Deployment

### 1. Review Changes
- [ ] Review `docs/HARDENING.md` for complete details
- [ ] Review `docs/HARDENING-SUMMARY.md` for quick reference
- [ ] Understand rate limits: 1 min interval, 5 SMS/day per lead
- [ ] Understand sequence expiration: 30 days from start

### 2. Test Locally
```bash
# Run test suite
npx tsx scripts/test-hardening.ts
```

Expected output:
```
✓ Idempotency test passed
✓ Rate limiting test passed
✓ Sequence expiration test passed
✓ Webhook cleanup test passed
✅ All tests passed!
```

### 3. Database Backup
- [ ] Backup production database before migration
- [ ] Document rollback procedure

## Deployment Steps

### 1. Push Schema Changes
```bash
cd hdd-lead-response
npx prisma db push
npx prisma generate
```

This adds:
- `processed_webhooks` table
- `sequenceExpiresAt`, `lastSmsAt`, `smsCountToday`, `smsCountResetAt` fields to `leads`

### 2. Deploy Code
```bash
git add .
git commit -m "Add production hardening: idempotency, rate limiting, expiration"
git push origin main
```

Vercel will auto-deploy.

### 3. Verify Deployment
- [ ] Check Vercel build logs - no errors
- [ ] Visit dashboard - loads correctly
- [ ] Check cron logs - runs without errors

## Post-Deployment Verification

### 1. Test Webhook Idempotency

Send test SMS to Twilio number:
```
Test message
```

Check logs for:
```
Received SMS from +15135551234 for lead abc-123
```

If Twilio retries (unlikely), should see:
```
Webhook already processed: SMxxxxxxxxx
```

Verify only one message record created:
```sql
SELECT COUNT(*) FROM messages WHERE external_id = 'SMxxxxxxxxx';
-- Should return 1
```

### 2. Monitor Rate Limiting

Check for blocked attempts (should be none initially):
```sql
SELECT * FROM messages WHERE status = 'blocked' ORDER BY sent_at DESC LIMIT 10;
```

If any blocked, investigate:
- Is a lead getting too many automated messages?
- Is cron running multiple times?
- Check lead: `SELECT sms_count_today, last_sms_at FROM leads WHERE id = 'xxx';`

### 3. Verify Sequence Expiration

Check for expired sequences being closed:
```sql
SELECT COUNT(*) FROM leads
WHERE sequence_status = 'active'
  AND sequence_expires_at < NOW();
```

Should be 0 (cron cleans them up every 5 minutes).

Check recently closed expired:
```sql
SELECT id, first_name, last_name, created_at, closed_at
FROM leads
WHERE closed_reason = 'Sequence expired (30 days)'
ORDER BY closed_at DESC LIMIT 5;
```

### 4. Monitor Cron Performance

Check cron response:
```bash
curl -X POST https://your-domain.vercel.app/api/cron/process-followups \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "processed": 2,
  "expired": 0,
  "cleaned": 15,
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

- `processed` - Followups sent
- `expired` - Sequences closed due to 30-day expiration
- `cleaned` - Webhook records removed (24hr TTL)

### 5. Check for Issues

Monitor for 24 hours:

**Rate limit violations** (should be rare):
```sql
SELECT lead_id, COUNT(*) as blocked_count
FROM messages
WHERE status = 'blocked' AND sent_at > NOW() - INTERVAL '24 hours'
GROUP BY lead_id
ORDER BY blocked_count DESC;
```

**Webhook duplicates** (good if this grows):
```sql
SELECT COUNT(*) FROM processed_webhooks WHERE webhook_type = 'twilio_sms';
```

**Expired sequences**:
```sql
SELECT COUNT(*) FROM leads
WHERE closed_reason = 'Sequence expired (30 days)'
  AND closed_at > NOW() - INTERVAL '24 hours';
```

## Rollback Plan

If critical issues arise:

### 1. Revert Code
```bash
git revert HEAD
git push origin main
```

### 2. Remove Schema Changes (Data Loss!)
```sql
-- Remove new fields from leads
ALTER TABLE leads DROP COLUMN IF EXISTS sequence_expires_at;
ALTER TABLE leads DROP COLUMN IF EXISTS last_sms_at;
ALTER TABLE leads DROP COLUMN IF EXISTS sms_count_today;
ALTER TABLE leads DROP COLUMN IF EXISTS sms_count_reset_at;

-- Remove idempotency table
DROP TABLE IF EXISTS processed_webhooks;
```

### 3. Regenerate Prisma Client
```bash
npx prisma db pull
npx prisma generate
```

## Success Criteria

After 48 hours in production:

- [ ] No increase in error rates
- [ ] No customer complaints about spam
- [ ] Webhook duplicates being prevented (check `processed_webhooks` count)
- [ ] Old sequences closing automatically (check expired leads)
- [ ] Rate limits not blocking legitimate sends (check `blocked` messages)

## Tuning

If rate limits need adjustment, edit `lib/rate-limit.ts`:

```typescript
// Current settings
const SMS_MIN_INTERVAL_MS = 60 * 1000  // 1 minute
const SMS_DAILY_LIMIT = 5               // 5 per day

// More aggressive (use with caution)
const SMS_MIN_INTERVAL_MS = 30 * 1000  // 30 seconds
const SMS_DAILY_LIMIT = 8               // 8 per day

// More conservative
const SMS_MIN_INTERVAL_MS = 120 * 1000  // 2 minutes
const SMS_DAILY_LIMIT = 3                // 3 per day
```

Redeploy after changes.

## Support Queries

### Find leads affected by rate limiting
```sql
SELECT id, first_name, last_name, phone, sms_count_today, last_sms_at
FROM leads
WHERE sms_count_today >= 5
ORDER BY last_sms_at DESC;
```

### Find leads with expired sequences
```sql
SELECT id, first_name, last_name, created_at, sequence_expires_at
FROM leads
WHERE sequence_status = 'active'
  AND sequence_expires_at IS NOT NULL
ORDER BY sequence_expires_at ASC
LIMIT 10;
```

### Check webhook deduplication stats
```sql
SELECT webhook_type, COUNT(*) as total, MIN(processed_at) as first, MAX(processed_at) as last
FROM processed_webhooks
GROUP BY webhook_type;
```

### Manually reset SMS counter for a lead
```sql
UPDATE leads
SET sms_count_today = 0, sms_count_reset_at = NOW() + INTERVAL '1 day'
WHERE id = 'lead-id-here';
```

### Manually extend sequence expiration
```sql
UPDATE leads
SET sequence_expires_at = NOW() + INTERVAL '30 days'
WHERE id = 'lead-id-here';
```

## Contact

For issues or questions, contact the development team.
