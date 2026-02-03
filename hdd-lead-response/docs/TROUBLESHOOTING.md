# Troubleshooting Guide - Hardening Features

## Rate Limiting Issues

### Lead Not Receiving SMS

**Symptom**: Lead should receive SMS but nothing sent

**Check**:
```sql
SELECT id, first_name, last_name, sms_count_today, last_sms_at, sms_count_reset_at
FROM leads WHERE id = 'lead-id-here';
```

**Possible causes**:

1. **Hit daily limit (5/day)**
   - Check `sms_count_today` >= 5
   - Solution: Wait until midnight or manually reset:
     ```sql
     UPDATE leads
     SET sms_count_today = 0, sms_count_reset_at = NOW() + INTERVAL '1 day'
     WHERE id = 'lead-id-here';
     ```

2. **Too soon after last SMS (1 min rule)**
   - Check `last_sms_at` within last minute
   - Solution: Wait 1 minute or manually clear:
     ```sql
     UPDATE leads
     SET last_sms_at = NOW() - INTERVAL '2 minutes'
     WHERE id = 'lead-id-here';
     ```

3. **Check blocked messages**
   ```sql
   SELECT * FROM messages
   WHERE lead_id = 'lead-id-here' AND status = 'blocked'
   ORDER BY sent_at DESC;
   ```
   - Review `error_message` for reason

### Too Many Blocked Messages

**Symptom**: High count of blocked messages

**Investigate**:
```sql
SELECT lead_id, COUNT(*) as blocked_count, MAX(sent_at) as last_blocked
FROM messages
WHERE status = 'blocked' AND sent_at > NOW() - INTERVAL '24 hours'
GROUP BY lead_id
ORDER BY blocked_count DESC
LIMIT 20;
```

**Possible causes**:

1. **Cron running too frequently**
   - Check Vercel cron logs
   - Should run every 5 minutes, not more
   - Verify `vercel.json` cron schedule

2. **Manual sends hitting limits**
   - If implementing manual send feature, use `bypassRateLimit: true`

3. **Sequence misconfiguration**
   - Check sequence steps have proper delays:
     ```sql
     SELECT step_number, name, delay_minutes FROM sequence_steps ORDER BY step_number;
     ```

**Solution**: Adjust rate limits in `lib/rate-limit.ts` if needed:
```typescript
const SMS_MIN_INTERVAL_MS = 120 * 1000  // Increase to 2 minutes
const SMS_DAILY_LIMIT = 8                // Increase to 8 per day
```

## Idempotency Issues

### Duplicate Messages Still Appearing

**Symptom**: Same SMS logged multiple times

**Check**:
```sql
SELECT external_id, COUNT(*) as count
FROM messages
WHERE direction = 'inbound' AND sent_at > NOW() - INTERVAL '24 hours'
GROUP BY external_id
HAVING COUNT(*) > 1;
```

**Possible causes**:

1. **Idempotency not running**
   - Check for errors in webhook logs
   - Verify `processed_webhooks` table exists:
     ```sql
     SELECT COUNT(*) FROM processed_webhooks;
     ```

2. **MessageSid not captured**
   - Check Twilio webhook payload includes MessageSid
   - Review webhook logs for missing field

3. **Race condition** (rare)
   - Two webhooks arrive simultaneously before first completes
   - Solution: Add transaction to webhook handler (future enhancement)

**Verify idempotency working**:
```sql
SELECT COUNT(*) as total_webhooks FROM processed_webhooks;
SELECT webhook_type, COUNT(*) FROM processed_webhooks GROUP BY webhook_type;
```

If count is growing, idempotency is working.

### Webhook Records Not Expiring

**Symptom**: `processed_webhooks` table growing indefinitely

**Check**:
```sql
SELECT COUNT(*) as total,
       COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired
FROM processed_webhooks;
```

**Possible causes**:

1. **Cron cleanup not running**
   - Check cron endpoint response includes `"cleaned": N`
   - Check cron logs for errors

2. **Database time mismatch**
   - Verify database timezone:
     ```sql
     SHOW timezone;
     SELECT NOW() as db_time;
     ```

**Solution**: Manually run cleanup:
```sql
DELETE FROM processed_webhooks WHERE expires_at < NOW();
```

## Sequence Expiration Issues

### Sequences Not Expiring

**Symptom**: Leads stuck in active status for > 30 days

**Check**:
```sql
SELECT id, first_name, last_name, created_at, sequence_expires_at, sequence_status
FROM leads
WHERE sequence_status = 'active'
  AND created_at < NOW() - INTERVAL '30 days'
ORDER BY created_at;
```

**Possible causes**:

1. **Expiration not set on old leads**
   - Leads created before hardening deployment won't have `sequence_expires_at`
   - Solution: Backfill expiration dates:
     ```sql
     UPDATE leads
     SET sequence_expires_at = created_at + INTERVAL '30 days'
     WHERE sequence_status = 'active'
       AND sequence_expires_at IS NULL;
     ```

2. **Cron not running expiration check**
   - Check cron response includes `"expired": N`
   - Check cron logs for errors in `closeExpiredSequences()`

3. **Database query issue**
   - Verify index exists:
     ```sql
     SELECT indexname FROM pg_indexes WHERE tablename = 'leads';
     ```
   - Should include `leads_sequence_expires_at_idx`

**Manual close expired sequences**:
```sql
UPDATE leads
SET sequence_status = 'completed',
    status = 'lost',
    next_followup_at = NULL,
    closed_at = NOW(),
    closed_reason = 'Sequence expired (30 days)'
WHERE sequence_status = 'active'
  AND sequence_expires_at < NOW();
```

### Sequences Expiring Too Early/Late

**Symptom**: Sequences closing before/after 30 days

**Check exact expiration**:
```sql
SELECT id, first_name, created_at, sequence_expires_at,
       EXTRACT(DAY FROM (sequence_expires_at - created_at)) as days_until_expiration
FROM leads
WHERE sequence_expires_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

Should be ~30 days.

**Solution**: Adjust expiration period in `lib/sequence.ts`:
```typescript
// Change this line in processInstantResponse()
expiresAt.setDate(expiresAt.getDate() + 30)  // Current: 30 days

// To:
expiresAt.setDate(expiresAt.getDate() + 45)  // 45 days
```

## Performance Issues

### Cron Taking Too Long

**Symptom**: Cron timeout or slow response

**Check cron response**:
```json
{
  "processed": 20,  // Should be <= 20
  "expired": 50,    // Should be <= 50
  "cleaned": 100    // Can be high
}
```

**Possible causes**:

1. **Too many pending followups**
   - Check queue size:
     ```sql
     SELECT COUNT(*) FROM leads
     WHERE sequence_status = 'active' AND next_followup_at < NOW();
     ```
   - If > 100, increase batch size in cron route

2. **SMS sending slow**
   - Twilio API calls are synchronous
   - Each SMS takes ~500ms
   - Solution: Consider async/batch sending (future enhancement)

3. **Database slow**
   - Check query performance:
     ```sql
     EXPLAIN ANALYZE
     SELECT * FROM leads
     WHERE sequence_status = 'active' AND next_followup_at <= NOW()
     ORDER BY next_followup_at ASC
     LIMIT 20;
     ```

**Solutions**:
- Increase cron timeout in `vercel.json`
- Reduce batch sizes (currently 20 followups, 50 expired)
- Add database connection pooling

### High Database Load

**Symptom**: Slow queries, connection pool exhausted

**Check active connections**:
```sql
SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';
```

**Possible causes**:

1. **Missing indexes**
   - Verify all indexes exist:
     ```sql
     SELECT indexname FROM pg_indexes WHERE tablename IN ('leads', 'messages', 'processed_webhooks');
     ```

2. **Too many cron runs**
   - Check Vercel cron logs for duplicate runs
   - Verify single schedule in `vercel.json`

3. **Slow cleanup queries**
   - `cleanupExpiredWebhooks()` deletes expired records
   - Should have index on `expires_at`

**Solutions**:
- Add missing indexes
- Use `DATABASE_URL_UNPOOLED` for cron (direct connection)
- Reduce batch sizes

## Common Errors

### "Lead not found" in Rate Limit

```
Error: Lead not found
  at checkSmsRateLimit (lib/rate-limit.ts:XX)
```

**Cause**: Trying to send SMS to deleted lead

**Solution**: Add null check before sending:
```typescript
const lead = await prisma.lead.findUnique({ where: { id: leadId } })
if (!lead) {
  console.error(`Lead not found: ${leadId}`)
  return
}
```

### "Unique constraint violation" on Webhook

```
Error: Unique constraint failed on the fields: (`webhook_id`)
```

**Cause**: Rare race condition where two webhooks arrive simultaneously

**Solution**: Wrap idempotency check in try-catch:
```typescript
try {
  await markWebhookProcessed(messageSid, 'twilio_sms')
} catch (error) {
  // Already marked by concurrent request
  console.log('Webhook already marked:', messageSid)
  return
}
```

### "Status: blocked" Messages

Not an error - expected behavior when rate limit hit.

**Review logs**:
```sql
SELECT lead_id, body, error_message, sent_at
FROM messages
WHERE status = 'blocked'
ORDER BY sent_at DESC
LIMIT 10;
```

Should show clear reason like:
- "Rate limit exceeded: Too soon since last SMS (min 1 minute)"
- "Rate limit exceeded: Daily SMS limit reached (5/day)"

## Debug Mode

Add logging to troubleshoot:

**In `lib/rate-limit.ts`**:
```typescript
export async function checkSmsRateLimit(leadId: string): Promise<RateLimitResult> {
  const lead = await prisma.lead.findUnique({...})

  console.log('[RATE-LIMIT]', {
    leadId,
    smsCountToday: lead.smsCountToday,
    lastSmsAt: lead.lastSmsAt,
    now: new Date()
  })

  // ... rest of function
}
```

**In `lib/sequence.ts`**:
```typescript
export async function processFollowup(leadId: string): Promise<void> {
  console.log('[FOLLOWUP]', { leadId, timestamp: new Date() })

  const lead = await prisma.lead.findUnique({...})

  console.log('[FOLLOWUP] Lead state:', {
    status: lead.sequenceStatus,
    expiresAt: lead.sequenceExpiresAt,
    isExpired: lead.sequenceExpiresAt && new Date() > lead.sequenceExpiresAt
  })

  // ... rest of function
}
```

## Contact Support

If issues persist after troubleshooting:

1. Export relevant data:
   ```sql
   -- Lead data
   \copy (SELECT * FROM leads WHERE id = 'problem-lead-id') TO 'lead.csv' CSV HEADER;

   -- Messages
   \copy (SELECT * FROM messages WHERE lead_id = 'problem-lead-id') TO 'messages.csv' CSV HEADER;

   -- Webhooks
   \copy (SELECT * FROM processed_webhooks ORDER BY processed_at DESC LIMIT 100) TO 'webhooks.csv' CSV HEADER;
   ```

2. Capture cron logs from Vercel dashboard

3. Share error messages and stack traces

4. Document steps to reproduce
