import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { stopSequence } from '@/lib/sequence'
import { closeLeadSchema } from '@/schemas/lead'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const body = await request.json()
    const validation = closeLeadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { reason, notes } = validation.data

    // Determine status based on reason
    const status = reason === 'booked' ? 'won' : 'lost'

    await stopSequence(id, reason, status)

    // Update notes if provided
    if (notes) {
      const prisma = (await import('@/lib/db')).default
      await prisma.lead.update({
        where: { id },
        data: { notes },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error closing lead:', error)
    return NextResponse.json(
      { error: 'Failed to close lead' },
      { status: 500 }
    )
  }
}
