import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { pauseSequence } from '@/lib/sequence'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params

    await pauseSequence(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error pausing sequence:', error)
    return NextResponse.json(
      { error: 'Failed to pause sequence' },
      { status: 500 }
    )
  }
}
