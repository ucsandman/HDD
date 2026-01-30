import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { leadId: id },
        orderBy: { sentAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          sentBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.message.count({ where: { leadId: id } }),
    ])

    return NextResponse.json({
      messages,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
