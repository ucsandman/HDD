# Next Steps - Lead Response Hardening

## Immediate Actions Required

### 1. Apply Database Schema Changes ⚠️

These changes must be applied before deploying the code:

```bash
cd C:\Projects\HDD\hdd-lead-response
npx prisma db push
npx prisma generate
```

This will:
- Create `processed_webhooks` table
- Add rate limiting fields to `leads` table
- Add sequence expiration field to `leads` table
- Create necessary indexes

**Status**: ⏳ Pending

---

### 2. Run Tests (Optional but Recommended)

Verify all features work correctly:

```bash
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

**Status**: ⏳ Pending

---

### 3. Review Configuration

Check if default settings need adjustment:

**Rate Limits** (`lib/rate-limit.ts`):
- ⏱️ 1 minute between SMS to same lead
- 📊 5 SMS per day per lead

**Sequence Expiration** (`lib/sequence.ts`):
- ⏰ 30 days until auto-close

**Webhook TTL** (`lib/idempotency.ts`):
- 🗑️ 24 hours before cleanup

**Status**: ⏳ Pending review

---

### 4. Deploy to Production

Once schema is updated and tests pass:

```bash
git add .
git commit -m "Add production hardening: idempotency, rate limiting, expiration

- Webhook idempotency prevents duplicate processing (24hr TTL)
- SMS rate limiting: 1min interval, 5/day limit per lead
- Sequence expiration: auto-close after 30 days
- Enhanced cron to handle cleanup tasks

See IMPLEMENTATION-SUMMARY.md for details"
git push origin main
```

**Status**: ⏳ Pending

---

### 5. Post-Deployment Verification

After deployment, verify everything works:

#### Check Cron Endpoint
```bash
curl https://your-domain.vercel.app/api/cron/process-followups \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Should return:
```json
{
  "success": true,
  "processed": N,
  "expired": N,
  "cleaned": N,
  "timestamp": "..."
}
```

#### Check Database Tables
```sql
-- Verify new table exists
SELECT COUNT(*) FROM processed_webhooks;

-- Verify new columns exist
SELECT id, sequence_expires_at, last_sms_at, sms_count_today
FROM leads LIMIT 1;
```

#### Monitor for Issues
- Check Vercel logs for errors
- Check for blocked messages: `SELECT * FROM messages WHERE status = 'blocked';`
- Check webhook deduplication: `SELECT COUNT(*) FROM processed_webhooks;`

**Status**: ⏳ Pending

---

## Documentation Reference

All documentation is in the `docs/` folder:

| File | Purpose |
|------|---------|
| `docs/HARDENING.md` | Complete feature documentation with technical details |
| `docs/HARDENING-SUMMARY.md` | Quick reference guide (2 pages) |
| `docs/DEPLOYMENT-CHECKLIST.md` | Step-by-step deployment instructions |
| `docs/TROUBLESHOOTING.md` | Debug guide with SQL queries |
| `IMPLEMENTATION-SUMMARY.md` | What was built and why (this document) |

---

## What Changed

### New Files (8)
- ✅ `lib/idempotency.ts` - Webhook deduplication
- ✅ `lib/rate-limit.ts` - SMS rate limiting
- ✅ `scripts/test-hardening.ts` - Test suite
- ✅ `docs/HARDENING.md` - Full documentation
- ✅ `docs/HARDENING-SUMMARY.md` - Quick reference
- ✅ `docs/DEPLOYMENT-CHECKLIST.md` - Deployment guide
- ✅ `docs/TROUBLESHOOTING.md` - Debug guide
- ✅ `IMPLEMENTATION-SUMMARY.md` - Implementation summary

### Modified Files (7)
- ✅ `prisma/schema.prisma` - Database schema changes
- ✅ `lib/sequence.ts` - Added expiration logic
- ✅ `lib/twilio/send-sms.ts` - Added rate limiting
- ✅ `app/api/webhooks/twilio/route.ts` - Added idempotency
- ✅ `app/api/cron/process-followups/route.ts` - Added cleanup tasks
- ✅ `CLAUDE.md` - Updated project docs
- ✅ `README.md` - Updated features list

---

## Testing Checklist

Before marking complete, verify:

- [ ] Database schema updated (`npx prisma db push`)
- [ ] Prisma client regenerated (`npx prisma generate`)
- [ ] Test suite passes (`npx tsx scripts/test-hardening.ts`)
- [ ] Code deployed to production
- [ ] Cron endpoint responding correctly
- [ ] No errors in Vercel logs
- [ ] New database columns exist
- [ ] Webhook deduplication working (check `processed_webhooks` table)
- [ ] Rate limiting working (send test SMS, check `messages` table)
- [ ] Sequence expiration working (check cron response for `expired` count)

---

## Rollback Instructions

If critical issues occur:

### Quick Rollback (Code Only)
```bash
git revert HEAD
git push origin main
```

### Full Rollback (Code + Database)
```sql
-- WARNING: This will delete data!
ALTER TABLE leads DROP COLUMN sequence_expires_at;
ALTER TABLE leads DROP COLUMN last_sms_at;
ALTER TABLE leads DROP COLUMN sms_count_today;
ALTER TABLE leads DROP COLUMN sms_count_reset_at;
DROP TABLE processed_webhooks;
```

Then regenerate Prisma:
```bash
npx prisma db pull
npx prisma generate
```

---

## Monitoring After Deployment

### First 24 Hours

Check every 6 hours:

1. **Error rate**: Should be unchanged
2. **Blocked messages**: Should be zero or very low
   ```sql
   SELECT COUNT(*) FROM messages WHERE status = 'blocked';
   ```
3. **Webhook deduplication**: Should be growing
   ```sql
   SELECT COUNT(*) FROM processed_webhooks;
   ```
4. **Expired sequences**: Should close old leads
   ```sql
   SELECT COUNT(*) FROM leads WHERE closed_reason = 'Sequence expired (30 days)';
   ```

### First Week

Check daily:
- Review Vercel logs for errors
- Check rate limiting stats
- Verify cron running smoothly
- Monitor customer feedback (any spam complaints?)

---

## Success Metrics

After 48 hours, confirm:

- ✅ Zero increase in error rates
- ✅ Zero customer complaints about spam
- ✅ Webhook deduplication preventing duplicates
- ✅ Old sequences closing automatically
- ✅ Rate limits not blocking legitimate sends

---

## Support Resources

### Quick Debugging

**Find blocked SMS**:
```sql
SELECT * FROM messages WHERE status = 'blocked' ORDER BY sent_at DESC LIMIT 10;
```

**Find rate-limited leads**:
```sql
SELECT id, first_name, sms_count_today, last_sms_at
FROM leads WHERE sms_count_today >= 5;
```

**Find expired sequences**:
```sql
SELECT * FROM leads
WHERE closed_reason = 'Sequence expired (30 days)'
ORDER BY closed_at DESC LIMIT 10;
```

**Check webhook deduplication**:
```sql
SELECT webhook_type, COUNT(*) FROM processed_webhooks GROUP BY webhook_type;
```

### Manual Fixes

**Reset SMS counter**:
```sql
UPDATE leads
SET sms_count_today = 0, sms_count_reset_at = NOW() + INTERVAL '1 day'
WHERE id = 'lead-id-here';
```

**Extend sequence expiration**:
```sql
UPDATE leads
SET sequence_expires_at = NOW() + INTERVAL '30 days'
WHERE id = 'lead-id-here';
```

**Clear old webhooks**:
```sql
DELETE FROM processed_webhooks WHERE expires_at < NOW();
```

---

## Contact

For questions or issues:
1. Review documentation in `docs/` folder
2. Check `docs/TROUBLESHOOTING.md` for specific problems
3. Run test suite to verify setup
4. Contact development team with logs and error details

---

**Implementation Date**: 2026-02-03
**Status**: ✅ Code complete, ⏳ awaiting deployment
**Risk Level**: Low (additive changes, zero downtime)
**Estimated Deployment Time**: 15 minutes
