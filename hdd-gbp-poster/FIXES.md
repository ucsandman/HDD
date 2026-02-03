# Production Fixes Documentation

This document describes the production issues fixed in the GBP Post Scheduler application.

## Issues Fixed

### 1. Race Condition on Scheduled Publish

**Problem**: Multiple concurrent cron runs could publish the same post twice, leading to duplicate Google Business Profile posts.

**Solution**: Implemented optimistic locking using a `publishingAt` timestamp field on the Post model.

**Changes**:
- Added `publishingAt` field to Post model (nullable DateTime)
- Updated `/api/cron/publish-scheduled` to acquire a lock before processing each post
- Lock is set to the current timestamp when processing begins
- Stale locks (> 5 minutes old) are automatically released
- Lock is cleared when post is published or fails

**How it works**:
```typescript
// Acquire lock using optimistic locking pattern
const lockAcquired = await prisma.post.updateMany({
  where: {
    id: post.id,
    publishingAt: post.publishingAt, // Ensure lock hasn't changed
  },
  data: {
    publishingAt: now,
  },
})

// If no rows updated, another process acquired the lock
if (lockAcquired.count === 0) {
  // Skip this post
  continue
}
```

---

### 2. Google Token Expiration Handling

**Problem**: When Google refresh tokens expire or become invalid (user revokes access), the application would repeatedly attempt to refresh, failing silently without alerting users.

**Solution**: Added `googleAuthValid` boolean field to track auth status and fail fast when re-authorization is required.

**Changes**:
- Added `googleAuthValid` field to Franchise model (boolean, defaults to true)
- Updated `getValidAccessToken()` to check auth validity before attempting refresh
- Token refresh failures now mark the franchise as requiring re-authorization
- Publishing cron checks auth validity and skips posts with invalid auth
- Successful token operations reset `googleAuthValid` to true

**Benefits**:
- Prevents wasted API calls on invalid tokens
- Clear error messages indicating re-authorization is needed
- UI can display warnings when auth is invalid
- Graceful degradation instead of silent failures

---

### 3. Generation Queue Clarification

**Problem**: The `generation_queue` table existed in the schema, but the workflow was unclear. The `generate-drafts` cron was both queuing and processing items, making it prone to timeouts.

**Solution**: Separated concerns into two distinct cron jobs:
1. `generate-drafts` - Only adds items to the queue (fast, deterministic)
2. `process-generation-queue` - Processes pending queue items (slow, can be rate-limited)

**Changes**:
- Created `/api/cron/process-generation-queue` endpoint
- Refactored `/api/cron/generate-drafts` to only create queue entries
- Added "processing" status to queue items to prevent duplicate processing
- Process queue runs every 15 minutes (same as publish-scheduled)
- Generate drafts runs weekly on Sundays

**Queue Statuses**:
- `pending` - Newly created, not yet processed
- `processing` - Currently being processed (prevents duplicates)
- `completed` - Successfully generated and created draft post
- `failed` - Processing failed (logged for review)

**Benefits**:
- Faster draft generation cron (no AI calls)
- Better error isolation (queue processing failures don't break queueing)
- Easier to scale (can process queue more frequently if needed)
- Clear audit trail of generation attempts

---

### 4. Health Check Endpoint

**Problem**: No way to monitor system health or diagnose issues without manual database/API checks.

**Solution**: Created comprehensive health check endpoint at `/api/health`.

**Checks Performed**:
1. **Database Connectivity** - Verifies Prisma can connect to PostgreSQL
2. **Google OAuth Status** - Lists all franchises and their auth status
3. **Anthropic API Availability** - Makes a minimal API call to verify connectivity

**Response Format**:
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2026-02-03T12:00:00.000Z",
  "checks": {
    "database": {
      "status": "pass",
      "message": "Database connection successful",
      "responseTime": 45
    },
    "googleAuth": {
      "status": "warn",
      "franchises": [
        {
          "id": "uuid",
          "name": "Cincinnati",
          "connected": true,
          "authValid": false
        }
      ],
      "message": "Some franchises require re-authorization"
    },
    "anthropic": {
      "status": "pass",
      "message": "Anthropic API connection successful",
      "responseTime": 1200
    }
  }
}
```

**HTTP Status Codes**:
- 200 - Healthy or degraded
- 503 - Unhealthy (critical failure)

**Use Cases**:
- Uptime monitoring (UptimeRobot, Pingdom, etc.)
- Dashboard health indicator
- Debugging deployment issues
- Pre-deployment smoke tests

---

## Database Migration

After pulling these changes, run:

```bash
npx prisma generate  # Generate updated Prisma client
npx prisma db push   # Push schema changes to database
```

**Schema Changes**:
- `posts.publishing_at` - DateTime, nullable
- `franchises.google_auth_valid` - Boolean, default true

---

## New Cron Jobs

### Process Generation Queue
**Endpoint**: `POST /api/cron/process-generation-queue`
**Schedule**: Every 15 minutes (recommended)
**Authentication**: `Authorization: Bearer {CRON_SECRET}`

**Example Vercel Cron Configuration** (`vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-drafts",
      "schedule": "0 5 * * 0"
    },
    {
      "path": "/api/cron/process-generation-queue",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## Testing

### Test Optimistic Locking
1. Schedule a post for immediate publish
2. Run publish-scheduled cron twice simultaneously
3. Verify only one post is created on Google
4. Check logs for "Lock acquired by another process" message

### Test Token Refresh Failure
1. Manually set `google_auth_valid = false` in database
2. Try to publish a post
3. Verify error message mentions re-authorization
4. Reconnect Google account
5. Verify `google_auth_valid` is reset to true

### Test Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response should show all checks passing when system is healthy.

### Test Generation Queue
1. Run generate-drafts cron
2. Verify queue entries are created with status "pending"
3. Run process-generation-queue cron
4. Verify posts are created and queue items marked "completed"

---

## Monitoring Recommendations

### Health Check Monitoring
Set up uptime monitoring (e.g., UptimeRobot) to hit `/api/health` every 5 minutes:
- Alert on 503 responses (unhealthy)
- Alert on degraded status for > 30 minutes
- Track response time trends

### Cron Job Monitoring
Monitor cron execution logs for:
- Failed queue processing (status: "failed" in results)
- Token refresh failures
- Publishing errors
- Stale locks (posts stuck with old publishingAt timestamps)

### Database Queries
Useful queries for monitoring:

```sql
-- Posts stuck in publishing state (potential stale locks)
SELECT id, franchise_id, status, publishing_at
FROM posts
WHERE publishing_at IS NOT NULL
  AND publishing_at < NOW() - INTERVAL '10 minutes';

-- Franchises requiring re-auth
SELECT id, name, google_auth_valid
FROM franchises
WHERE google_refresh_token IS NOT NULL
  AND google_auth_valid = false;

-- Queue processing backlog
SELECT franchise_id, COUNT(*)
FROM generation_queue
WHERE status = 'pending'
GROUP BY franchise_id;
```

---

## Rollback Plan

If issues occur after deployment:

1. **Revert schema changes** (if needed):
   ```sql
   ALTER TABLE posts DROP COLUMN publishing_at;
   ALTER TABLE franchises DROP COLUMN google_auth_valid;
   ```

2. **Remove new cron job** from Vercel dashboard

3. **Restore previous code** from git:
   ```bash
   git revert <commit-hash>
   git push
   ```

---

## Future Improvements

1. **Add UI warnings** - Display alert when `googleAuthValid = false`
2. **Automatic re-auth flow** - Send email to franchise admin when auth becomes invalid
3. **Queue retry mechanism** - Automatically retry failed queue items with exponential backoff
4. **Publishing metrics** - Track publish success rate, average time to publish, etc.
5. **Lock monitoring** - Alert on posts stuck in publishing state for > 10 minutes
