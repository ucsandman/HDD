import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { createImageSchema } from '@/schemas/image'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectType = searchParams.get('projectType')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: { franchiseId: string; projectType?: string } = {
      franchiseId: session.user.franchiseId,
    }

    if (projectType) {
      where.projectType = projectType
    }

    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.image.count({ where }),
    ])

    return NextResponse.json({
      images,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createImageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const image = await prisma.image.create({
      data: {
        ...validation.data,
        franchiseId: session.user.franchiseId,
        uploadedBy: session.user.id,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Error creating image:', error)
    return NextResponse.json(
      { error: 'Failed to create image' },
      { status: 500 }
    )
  }
}
