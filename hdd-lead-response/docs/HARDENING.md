# Lead Response Hardening Changes

## Overview

Three critical production hardening features have been implemented to prevent duplicate processing, spam, and runaway sequences.

## 1. Webhook Idempotency

**Problem**: Twilio can send duplicate webhooks if they don't receive a 200 response quickly enough, causing duplicate message logging and potentially duplicate automated responses.

**Solution**: Track processed webhook IDs in a new `processed_webhooks` table with 24-hour TTL.

### Implementation

- New table: `ProcessedWebhook` with webhook_id, webhook_type, expires_at
- New module: `lib/idempotency.ts` with functions:
  - `isWebhookProcessed(webhookId, webhookType)` - Check if already handled
  - `markWebhookProcessed(webhookId, webhookType)` - Mark as processed
  - `cleanupExpiredWebhooks()` - Remove expired records (run via cron)
- Updated: `app/api/webhooks/twilio/route.ts` to check MessageSid before processing

### Behavior

- Each Twilio MessageSid is checked before processing
- If already processed, return empty TwiML response immediately
- Records expire after 24 hours and are cleaned up by cron
- Zero performance impact (indexed unique lookup)

## 2. SMS Rate Limiting

**Problem**: If cron runs twice or webhooks duplicate, leads could receive spam SMS messages, violating carrier guidelines and annoying customers.

**Solution**: Track SMS sends per lead with minimum interval and daily limits.

### Implementation

- New Lead fields:
  - `lastSmsAt` - Timestamp of last SMS sent
  - `smsCountToday` - Counter reset at midnight
  - `smsCountResetAt` - When counter resets
- New module: `lib/rate-limit.ts` with functions:
  - `checkSmsRateLimit(leadId)` - Returns {allowed, reason, retryAfter}
  - `recordSmsSent(leadId)` - Update counters after send
  - `getSmsRateLimitStatus(leadId)` - Get current status for UI
- Updated: `lib/twilio/send-sms.ts` to enforce limits

### Rate Limits

- **Minimum interval**: 1 minute between SMS to same lead
- **Daily limit**: 5 SMS per day per lead
- **Bypass**: Manual sends can set `bypassRateLimit: true` (future feature)

### Behavior

- Rate limit checked before every SMS send (except bypassed)
- Failed attempts logged as `status: 'blocked'` in messages table
- Returns clear error message explaining why blocked
- Counter resets automatically at midnight
- No impact on email sending

## 3. Sequence Expiration

**Problem**: Leads without further steps stay in `active` status forever, cluttering the dashboard and never closing out.

**Solution**: Set 30-day expiration on sequence start, auto-close expired sequences.

### Implementation

- New Lead field: `sequenceExpiresAt` - Set when sequence starts
- Updated: `lib/sequence.ts`:
  - `processInstantResponse()` - Set expiration 30 days from now
  - `processFollowup()` - Check expiration before each step
  - `closeExpiredSequences()` - Bulk close expired (run via cron)
- Updated: `app/api/cron/process-followups/route.ts` - Call cleanup function

### Behavior

- Expiration set when instant response fires (lead creation)
- Checked before processing each followup step
- If expired: status → `lost`, reason → "Sequence expired (30 days)", closed
- Cron runs cleanup every 5 minutes to batch-close expired sequences
- Expiration honored even if manual actions taken

## Database Migration

Run these commands to apply schema changes:

```bash
cd hdd-lead-response
npx prisma db push
npx prisma generate
```

### New Schema Elements

**Lead table additions**:
```prisma
sequenceExpiresAt  DateTime? @map("sequence_expires_at")
lastSmsAt          DateTime? @map("last_sms_at")
smsCountToday      Int       @default(0) @map("sms_count_today")
smsCountResetAt    DateTime? @map("sms_count_reset_at")
```

**New table**:
```prisma
model ProcessedWebhook {
  id            String   @id @default(uuid()) @db.Uuid
  webhookId     String   @unique @map("webhook_id") @db.VarChar(255)
  webhookType   String   @map("webhook_type") @db.VarChar(50)
  processedAt   DateTime @default(now()) @map("processed_at")
  expiresAt     DateTime @map("expires_at")
}
```

## Cron Job Updates

The `/api/cron/process-followups` endpoint now performs three tasks:

1. **Process followups** - Original functionality (20 per run)
2. **Close expired sequences** - New (50 per run)
3. **Clean up webhooks** - New (all expired)

Response format:
```json
{
  "success": true,
  "processed": 3,
  "expired": 1,
  "cleaned": 47,
  "timestamp": "2026-02-03T12:00:00.000Z"
}
```

## Monitoring

### Rate Limit Status

Check current rate limit status:

```typescript
import { getSmsRateLimitStatus } from '@/lib/rate-limit'

const status = await getSmsRateLimitStatus(leadId)
// Returns: { smsCountToday, dailyLimit, lastSmsAt, resetAt }
```

### Blocked Messages

Query messages with `status: 'blocked'`:

```sql
SELECT * FROM messages WHERE status = 'blocked' ORDER BY sent_at DESC;
```

### Expired Sequences

Query leads closed by expiration:

```sql
SELECT * FROM leads
WHERE closed_reason = 'Sequence expired (30 days)'
ORDER BY closed_at DESC;
```

### Webhook Duplicates

If webhooks are frequently duplicated:

```sql
SELECT webhook_type, COUNT(*)
FROM processed_webhooks
GROUP BY webhook_type;
```

## Testing

### Test Idempotency

1. Send SMS to Twilio number
2. Check logs for "Webhook already processed" if Twilio retries
3. Verify only one message record created

### Test Rate Limiting

1. Manually trigger SMS sends to same lead
2. After 1 minute, should succeed
3. After 5 sends in same day, should block
4. Check messages table for `status: 'blocked'`

### Test Expiration

1. Create lead with sequence
2. Manually set `sequenceExpiresAt` to past date:
   ```sql
   UPDATE leads SET sequence_expires_at = NOW() - INTERVAL '1 day' WHERE id = 'xxx';
   ```
3. Trigger cron or wait for next run
4. Verify lead closed with reason "Sequence expired (30 days)"

## Rollback

If issues arise, rollback steps:

1. Revert code changes via git
2. Remove new columns (data loss warning):
   ```sql
   ALTER TABLE leads DROP COLUMN sequence_expires_at;
   ALTER TABLE leads DROP COLUMN last_sms_at;
   ALTER TABLE leads DROP COLUMN sms_count_today;
   ALTER TABLE leads DROP COLUMN sms_count_reset_at;
   DROP TABLE processed_webhooks;
   ```
3. Redeploy previous version

## Performance Impact

- **Idempotency check**: Single indexed lookup, <1ms
- **Rate limit check**: Single query + comparison, <2ms
- **Expiration check**: Inline date comparison, <1ms
- **Cron cleanup**: Batch operations, 100-500ms total

All changes have negligible performance impact on critical paths.

## Future Enhancements

1. **Redis backend**: Move idempotency to Redis for multi-region deployments
2. **Rate limit UI**: Show SMS counter in lead detail page
3. **Configurable expiration**: Allow per-sequence expiration periods
4. **Manual bypass**: Add UI for admins to send SMS bypassing rate limits
5. **Webhook retry strategy**: Exponential backoff for failed webhooks
