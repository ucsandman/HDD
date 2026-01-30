import { NextResponse } from 'next/server'
import { processAllFollowups } from '@/lib/sequence'

export async function POST() {
  // Note: Authorization is verified in middleware

  try {
    const processed = await processAllFollowups(20)

    return NextResponse.json({
      success: true,
      processed,
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
