import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { normalizePhone } from '@/lib/phone'
import { createLeadSchema } from '@/schemas/lead'
import { processInstantResponse } from '@/lib/sequence'

export async function GET(request: Request) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const sequenceStatus = searchParams.get('sequenceStatus')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (sequenceStatus) {
      where.sequenceStatus = sequenceStatus
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.lead.count({ where }),
    ])

    return NextResponse.json({
      leads,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    const body = await request.json()
    const validation = createLeadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Normalize phone number
    const phoneNormalized = normalizePhone(data.phone)

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        ...data,
        phoneNormalized,
        createdById: user.id,
      },
    })

    // Trigger instant response asynchronously
    processInstantResponse(lead.id).catch((error) => {
      console.error('Error processing instant response:', error)
    })

    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}
