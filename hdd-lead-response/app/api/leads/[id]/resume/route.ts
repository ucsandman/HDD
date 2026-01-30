import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { resumeSequence } from '@/lib/sequence'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params

    await resumeSequence(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resuming sequence:', error)
    return NextResponse.json(
      { error: 'Failed to resume sequence' },
      { status: 500 }
    )
  }
}
