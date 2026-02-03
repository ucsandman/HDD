import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { createImageSchema } from '@/schemas/image'
import { isDemoMode, normalizeTags } from '@/lib/demo'

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

    // In demo mode, normalize tags from JSON string to array
    const normalizedImages = isDemoMode
      ? images.map((img) => ({
          ...img,
          tags: normalizeTags(img.tags as unknown as string | string[]),
        }))
      : images

    return NextResponse.json({
      images: normalizedImages,
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

    // In demo mode, store tags as JSON string for SQLite compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = isDemoMode
      ? {
          ...validation.data,
          tags: JSON.stringify(validation.data.tags || []),
          franchiseId: session.user.franchiseId,
          uploadedBy: session.user.id,
        }
      : {
          ...validation.data,
          franchiseId: session.user.franchiseId,
          uploadedBy: session.user.id,
        }

    const image = await prisma.image.create({
      data,
    })

    // Normalize tags in response for demo mode
    const normalizedImage = isDemoMode
      ? { ...image, tags: normalizeTags(image.tags as unknown as string | string[]) }
      : image

    return NextResponse.json(normalizedImage)
  } catch (error) {
    console.error('Error creating image:', error)
    return NextResponse.json(
      { error: 'Failed to create image' },
      { status: 500 }
    )
  }
}
