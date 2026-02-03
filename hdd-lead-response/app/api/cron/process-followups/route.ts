import { NextResponse } from 'next/server'
import { processAllFollowups, closeExpiredSequences } from '@/lib/sequence'
import { cleanupExpiredWebhooks } from '@/lib/idempotency'

export async function POST() {
  // Note: Authorization is verified in middleware

  try {
    // Process pending followups
    const processed = await processAllFollowups(20)

    // Close expired sequences (30 day timeout)
    const expired = await closeExpiredSequences(50)

    // Clean up old webhook records (24 hour TTL)
    const cleaned = await cleanupExpiredWebhooks()

    return NextResponse.json({
      success: true,
      processed,
      expired,
      cleaned,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error processing followups:', error)
    return NextResponse.json(
      { error: 'Failed to process followups' },
      { status: 500 }
    )
  }
}

// Also support GET for manual testing
export async function GET() {
  return POST()
}
