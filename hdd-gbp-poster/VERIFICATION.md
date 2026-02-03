# Verification Checklist

This document helps verify that all production fixes are working correctly.

## Pre-Deployment Verification

### 1. Schema Changes Applied
```bash
cd C:\Projects\HDD\hdd-gbp-poster
npx prisma generate
```

**Expected Output:**
- ✅ No errors
- ✅ "Generated Prisma Client" message appears

### 2. TypeScript Compilation
```bash
npm run build
```

**Expected Output:**
- ✅ No TypeScript errors
- ✅ Build completes successfully

### 3. Lint Check
```bash
npm run lint
```

**Expected Output:**
- ✅ No new errors in modified files
- ℹ️ Pre-existing warnings in other files are OK

## Post-Deployment Verification

### 1. Health Check Endpoint
```bash
# Local testing
curl http://localhost:3000/api/health | jq

# Production testing
curl https://your-domain.vercel.app/api/health | jq
```

**Expected Response:**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2026-02-03T...",
  "checks": {
    "database": {
      "status": "pass",
      "message": "Database connection successful",
      "responseTime": <number>
    },
    "googleAuth": {
      "status": "pass" | "warn" | "fail",
      "franchises": [...],
      "message": "..."
    },
    "anthropic": {
      "status": "pass",
      "message": "Anthropic API connection successful",
      "responseTime": <number>
    }
  }
}
```

**Verify:**
- ✅ Returns 200 status code when healthy
- ✅ Returns 503 status code when unhealthy
- ✅ All checks have valid status
- ✅ Response times are reasonable (< 5000ms)

### 2. Database Schema Verification
```sql
-- Connect to your database and run:

-- Verify publishingAt field exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'publishing_at';

-- Expected: publishing_at | timestamp without time zone | YES

-- Verify googleAuthValid field exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'franchises' AND column_name = 'google_auth_valid';

-- Expected: google_auth_valid | boolean | NO | true
```

**Verify:**
- ✅ Both fields exist
- ✅ Data types match expectations
- ✅ Defaults are correct

### 3. Cron Job Endpoints Accessible
```bash
# Test with valid CRON_SECRET (replace YOUR_SECRET)
CRON_SECRET="YOUR_SECRET"

# Test publish-scheduled
curl -X POST http://localhost:3000/api/cron/publish-scheduled \
  -H "Authorization: Bearer $CRON_SECRET"

# Test generate-drafts
curl -X POST http://localhost:3000/api/cron/generate-drafts \
  -H "Authorization: Bearer $CRON_SECRET"

# Test process-generation-queue (NEW)
curl -X POST http://localhost:3000/api/cron/process-generation-queue \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Verify:**
- ✅ All return 200 status code
- ✅ All return JSON response with results
- ✅ Without Authorization header, all return 401

### 4. Optimistic Locking Test

**Test Scenario:** Prevent duplicate publishing

```sql
-- 1. Create a test post scheduled for now
INSERT INTO posts (
  id, franchise_id, post_type, body, status, scheduled_for, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM franchises LIMIT 1),
  'educational',
  'Test post for optimistic locking',
  'scheduled',
  NOW(),
  NOW(),
  NOW()
) RETURNING id;

-- 2. Note the post ID, then trigger the cron twice in quick succession
-- (Run via two terminal windows simultaneously)

-- 3. Check the post status
SELECT id, status, publishing_at, published_at, google_post_id
FROM posts
WHERE id = '<YOUR_POST_ID>';

-- 4. Check Google Business Profile to ensure only ONE post was created
```

**Verify:**
- ✅ Post status is either "published" or "failed" (not "scheduled")
- ✅ `publishing_at` is NULL (lock was released)
- ✅ Only ONE post appears on Google Business Profile
- ✅ Cron logs show one success, one "skipped" (lock acquired by another process)

### 5. Google Auth Validation Test

**Test Scenario:** Fail fast when auth is invalid

```sql
-- 1. Mark a franchise auth as invalid
UPDATE franchises
SET google_auth_valid = false
WHERE id = (SELECT id FROM franchises LIMIT 1)
RETURNING id, name;

-- 2. Try to publish a post for that franchise
-- (Either via cron or manual API call)

-- 3. Check the post status
SELECT id, status, publish_error
FROM posts
WHERE franchise_id = '<FRANCHISE_ID>'
  AND status = 'failed'
ORDER BY created_at DESC
LIMIT 1;
```

**Verify:**
- ✅ Post status is "failed"
- ✅ `publish_error` mentions "re-authorization required"
- ✅ No API call was made to Google (check logs)

**Reset:**
```sql
UPDATE franchises SET google_auth_valid = true WHERE id = '<FRANCHISE_ID>';
```

### 6. Generation Queue Flow Test

**Test Scenario:** Queue-based post generation works end-to-end

```bash
# 1. Run generate-drafts cron
curl -X POST http://localhost:3000/api/cron/generate-drafts \
  -H "Authorization: Bearer $CRON_SECRET"

# 2. Check database for pending queue items
```

```sql
SELECT id, franchise_id, post_type, status, created_at
FROM generation_queue
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 5;
```

**Verify:**
- ✅ Queue entries exist with status = "pending"
- ✅ Post types rotate (project_showcase, educational, seasonal)

```bash
# 3. Run process-generation-queue cron
curl -X POST http://localhost:3000/api/cron/process-generation-queue \
  -H "Authorization: Bearer $CRON_SECRET"

# 4. Check results
```

```sql
-- Check queue items are completed
SELECT id, franchise_id, post_type, status, completed_at
FROM generation_queue
WHERE id IN (<IDS_FROM_STEP_2>);

-- Check posts were created
SELECT id, franchise_id, post_type, body, status, generated_by
FROM posts
WHERE generated_by = 'ai'
ORDER BY created_at DESC
LIMIT 5;
```

**Verify:**
- ✅ Queue items have status = "completed"
- ✅ `completed_at` is set
- ✅ Draft posts were created
- ✅ Post bodies contain AI-generated content
- ✅ Posts have status = "draft"

### 7. Stale Lock Recovery Test

**Test Scenario:** Locks older than 5 minutes are released

```sql
-- 1. Create a post with a stale lock
INSERT INTO posts (
  id, franchise_id, post_type, body, status,
  scheduled_for, publishing_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM franchises WHERE google_refresh_token IS NOT NULL LIMIT 1),
  'educational',
  'Test post for stale lock recovery',
  'scheduled',
  NOW(),
  NOW() - INTERVAL '10 minutes',  -- Stale lock (10 min old)
  NOW(),
  NOW()
) RETURNING id;

-- 2. Run the publish-scheduled cron
```

```bash
curl -X POST http://localhost:3000/api/cron/publish-scheduled \
  -H "Authorization: Bearer $CRON_SECRET"
```

```sql
-- 3. Check the post was published
SELECT id, status, publishing_at, published_at
FROM posts
WHERE id = '<YOUR_POST_ID>';
```

**Verify:**
- ✅ Post status is "published" (stale lock was ignored)
- ✅ `publishing_at` is NULL (lock was released after publish)
- ✅ `published_at` is set to recent timestamp

## Integration Tests

### End-to-End Weekly Workflow

**Day 0 (Sunday 5:00 UTC):**
1. `generate-drafts` cron runs
   - ✅ Queue entries created for the week

**Day 0 (Sunday 5:15 UTC):**
2. `process-generation-queue` cron runs
   - ✅ First batch of queue items processed
   - ✅ Draft posts created

**Day 0 (Sunday 5:30, 5:45, 6:00, etc.):**
3. `process-generation-queue` continues every 15 min
   - ✅ All pending queue items eventually processed

**Day 1-7 (Every 15 minutes):**
4. `publish-scheduled` cron runs
   - ✅ Posts published at scheduled times
   - ✅ No duplicate posts
   - ✅ Locks are properly released

### Monitoring Dashboard Check

After 24 hours of production use:

```sql
-- Published posts in last 24 hours
SELECT COUNT(*) as published_count
FROM posts
WHERE status = 'published'
  AND published_at > NOW() - INTERVAL '24 hours';

-- Failed posts in last 24 hours
SELECT COUNT(*) as failed_count,
       ARRAY_AGG(DISTINCT publish_error) as error_types
FROM posts
WHERE status = 'failed'
  AND updated_at > NOW() - INTERVAL '24 hours';

-- Queue processing success rate
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM generation_queue
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status;

-- Average publishing lock time
SELECT
  AVG(EXTRACT(EPOCH FROM (published_at - publishing_at))) as avg_lock_time_seconds
FROM posts
WHERE status = 'published'
  AND publishing_at IS NOT NULL
  AND published_at > NOW() - INTERVAL '24 hours';
```

**Verify:**
- ✅ Published count matches expectations
- ✅ Failed count is low or zero
- ✅ Queue completion rate is > 95%
- ✅ Average lock time is < 30 seconds

## Rollback Verification

If rollback is needed, verify:

```bash
# 1. Code rollback
git log --oneline -5  # Verify reverted commit

# 2. Schema still works (fields can remain)
npm run build  # Should succeed

# 3. Old cron jobs still work
curl -X POST http://localhost:3000/api/cron/publish-scheduled \
  -H "Authorization: Bearer $CRON_SECRET"
# Should return 200 even if new fields aren't used

# 4. Application functions normally
curl http://localhost:3000/api/health  # Should still work
```

## Performance Benchmarks

Expected performance metrics after fixes:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| generate-drafts execution time | 30-60s | < 1s | 30-60x faster |
| Duplicate post rate | Occasional | 0% | 100% reduction |
| Token refresh failures | Silent | Logged + flagged | 100% visibility |
| System health visibility | Manual checks | Automated | N/A |

## Sign-Off Checklist

Before marking deployment as complete:

- [ ] All pre-deployment checks pass
- [ ] All post-deployment checks pass
- [ ] Health check endpoint returns "healthy"
- [ ] At least one post published successfully
- [ ] At least one queue item processed successfully
- [ ] No errors in Vercel logs for 1 hour
- [ ] Monitoring alerts configured
- [ ] Team notified of changes
- [ ] Documentation reviewed

## Emergency Contacts

If issues occur:
1. Check `/api/health` endpoint
2. Review Vercel function logs
3. Run monitoring SQL queries above
4. Contact: [Your contact info]

---

**Document Version**: 1.0
**Last Updated**: 2026-02-03
**Next Review**: After first production run
