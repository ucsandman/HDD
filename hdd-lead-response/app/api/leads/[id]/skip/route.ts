import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { skipToNextStep } from '@/lib/sequence'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params

    await skipToNextStep(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error skipping step:', error)
    return NextResponse.json(
      { error: 'Failed to skip step' },
      { status: 500 }
    )
  }
}
