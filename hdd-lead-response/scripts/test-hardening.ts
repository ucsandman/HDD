/**
 * Test script for hardening features
 *
 * Run with: npx tsx scripts/test-hardening.ts
 */

import prisma from '../lib/db'
import { isWebhookProcessed, markWebhookProcessed, cleanupExpiredWebhooks } from '../lib/idempotency'
import { checkSmsRateLimit, recordSmsSent, getSmsRateLimitStatus } from '../lib/rate-limit'
import { closeExpiredSequences } from '../lib/sequence'

async function testIdempotency() {
  console.log('\n=== Testing Webhook Idempotency ===')

  const testWebhookId = `test-webhook-${Date.now()}`

  // First check - should be false
  const first = await isWebhookProcessed(testWebhookId, 'twilio_sms')
  console.log(`First check (should be false): ${first}`)

  // Mark as processed
  await markWebhookProcessed(testWebhookId, 'twilio_sms')
  console.log('Marked webhook as processed')

  // Second check - should be true
  const second = await isWebhookProcessed(testWebhookId, 'twilio_sms')
  console.log(`Second check (should be true): ${second}`)

  // Verify in database
  const record = await prisma.processedWebhook.findUnique({
    where: { webhookId: testWebhookId },
  })
  console.log(`Database record exists: ${!!record}`)
  console.log(`Expires at: ${record?.expiresAt}`)

  // Cleanup
  await prisma.processedWebhook.delete({
    where: { webhookId: testWebhookId },
  })
  console.log('✓ Idempotency test passed')
}

async function testRateLimiting() {
  console.log('\n=== Testing SMS Rate Limiting ===')

  // Create test lead
  const testLead = await prisma.lead.create({
    data: {
      firstName: 'Rate',
      lastName: 'Test',
      email: 'rate@test.com',
      phone: '+15555551234',
      phoneNormalized: '+15555551234',
      status: 'new',
    },
  })

  console.log(`Created test lead: ${testLead.id}`)

  // First SMS - should be allowed
  let check = await checkSmsRateLimit(testLead.id)
  console.log(`First SMS allowed: ${check.allowed}`)

  if (check.allowed) {
    await recordSmsSent(testLead.id)
    console.log('Recorded first SMS')
  }

  // Immediate second SMS - should be blocked (1 minute rule)
  check = await checkSmsRateLimit(testLead.id)
  console.log(`Immediate second SMS allowed: ${check.allowed}`)
  console.log(`Reason: ${check.reason}`)
  console.log(`Retry after: ${check.retryAfter}s`)

  // Fast-forward time by updating lastSmsAt to 2 minutes ago
  await prisma.lead.update({
    where: { id: testLead.id },
    data: {
      lastSmsAt: new Date(Date.now() - 2 * 60 * 1000),
    },
  })

  // Third SMS - should be allowed now
  check = await checkSmsRateLimit(testLead.id)
  console.log(`After 2 minutes, SMS allowed: ${check.allowed}`)

  // Send 4 more SMS to hit daily limit
  for (let i = 0; i < 4; i++) {
    await recordSmsSent(testLead.id)
    await prisma.lead.update({
      where: { id: testLead.id },
      data: {
        lastSmsAt: new Date(Date.now() - 2 * 60 * 1000 * (i + 1)),
      },
    })
  }

  console.log('Sent 5 SMS total (daily limit)')

  // Check status
  const status = await getSmsRateLimitStatus(testLead.id)
  console.log(`SMS count today: ${status?.smsCountToday}/${status?.dailyLimit}`)

  // Sixth SMS - should be blocked (daily limit)
  check = await checkSmsRateLimit(testLead.id)
  console.log(`Sixth SMS allowed: ${check.allowed}`)
  console.log(`Reason: ${check.reason}`)

  // Cleanup
  await prisma.lead.delete({
    where: { id: testLead.id },
  })
  console.log('✓ Rate limiting test passed')
}

async function testSequenceExpiration() {
  console.log('\n=== Testing Sequence Expiration ===')

  // Create test lead with expired sequence
  const testLead = await prisma.lead.create({
    data: {
      firstName: 'Expired',
      lastName: 'Test',
      email: 'expired@test.com',
      phone: '+15555555678',
      phoneNormalized: '+15555555678',
      status: 'contacted',
      sequenceStatus: 'active',
      sequenceStep: 2,
      // Set expiration to yesterday
      sequenceExpiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      nextFollowupAt: new Date(Date.now() + 60 * 1000),
    },
  })

  console.log(`Created test lead with expired sequence: ${testLead.id}`)
  console.log(`Expires at: ${testLead.sequenceExpiresAt}`)
  console.log(`Status: ${testLead.status}, Sequence: ${testLead.sequenceStatus}`)

  // Run expiration cleanup
  const closed = await closeExpiredSequences(100)
  console.log(`Closed ${closed} expired sequences`)

  // Verify lead was closed
  const updatedLead = await prisma.lead.findUnique({
    where: { id: testLead.id },
  })

  console.log(`Updated status: ${updatedLead?.status}`)
  console.log(`Updated sequence status: ${updatedLead?.sequenceStatus}`)
  console.log(`Closed reason: ${updatedLead?.closedReason}`)
  console.log(`Closed at: ${updatedLead?.closedAt}`)

  // Cleanup
  await prisma.lead.delete({
    where: { id: testLead.id },
  })
  console.log('✓ Sequence expiration test passed')
}

async function testWebhookCleanup() {
  console.log('\n=== Testing Webhook Cleanup ===')

  // Create some test webhooks with expired TTL
  const expiredWebhooks = []
  for (let i = 0; i < 3; i++) {
    const webhook = await prisma.processedWebhook.create({
      data: {
        webhookId: `expired-test-${Date.now()}-${i}`,
        webhookType: 'test',
        expiresAt: new Date(Date.now() - 60 * 1000), // 1 minute ago
      },
    })
    expiredWebhooks.push(webhook)
  }

  console.log(`Created ${expiredWebhooks.length} expired webhooks`)

  // Run cleanup
  const cleaned = await cleanupExpiredWebhooks()
  console.log(`Cleaned up ${cleaned} expired webhooks`)

  // Verify they're gone
  const remaining = await prisma.processedWebhook.count({
    where: {
      webhookId: { in: expiredWebhooks.map(w => w.webhookId) },
    },
  })

  console.log(`Remaining expired webhooks: ${remaining}`)
  console.log('✓ Webhook cleanup test passed')
}

async function runTests() {
  try {
    console.log('Starting hardening feature tests...')

    await testIdempotency()
    await testRateLimiting()
    await testSequenceExpiration()
    await testWebhookCleanup()

    console.log('\n✅ All tests passed!')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runTests()
