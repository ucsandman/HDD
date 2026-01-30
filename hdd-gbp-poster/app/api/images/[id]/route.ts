import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { updateImageSchema } from '@/schemas/image'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const image = await prisma.image.findFirst({
      where: {
        id,
        franchiseId: session.user.franchiseId,
      },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    return NextResponse.json(image)
  } catch (error) {
    console.error('Error fetching image:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = updateImageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingImage = await prisma.image.findFirst({
      where: {
        id,
        franchiseId: session.user.franchiseId,
      },
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const image = await prisma.image.update({
      where: { id },
      data: validation.data,
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const existingImage = await prisma.image.findFirst({
      where: {
        id,
        franchiseId: session.user.franchiseId,
      },
      include: {
        postImages: {
          select: { postId: true },
        },
      },
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Check if image is attached to any posts
    if (existingImage.postImages.length > 0) {
      return NextResponse.json(
        {
          error: 'Image is attached to posts',
          postIds: existingImage.postImages.map((pi) => pi.postId),
        },
        { status: 400 }
      )
    }

    await prisma.image.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}
