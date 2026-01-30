import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { updatePostSchema } from '@/schemas/post'

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

    const post = await prisma.post.findFirst({
      where: {
        id,
        franchiseId: session.user.franchiseId,
      },
      include: {
        postImages: {
          include: { image: true },
          orderBy: { displayOrder: 'asc' },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        approvedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...post,
      images: post.postImages.map((pi) => pi.image),
      postImages: undefined,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
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
    const validation = updatePostSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        franchiseId: session.user.franchiseId,
      },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const { imageIds, ...updateData } = validation.data

    // Update post and images in a transaction
    const post = await prisma.$transaction(async (tx) => {
      // Update post data
      const updatedPost = await tx.post.update({
        where: { id },
        data: updateData,
      })

      // Update images if provided
      if (imageIds !== undefined) {
        // Delete existing post images
        await tx.postImage.deleteMany({
          where: { postId: id },
        })

        // Create new post images
        if (imageIds.length > 0) {
          await tx.postImage.createMany({
            data: imageIds.map((imageId, index) => ({
              postId: id,
              imageId,
              displayOrder: index,
            })),
          })
        }
      }

      // Fetch updated post with images
      return tx.post.findUnique({
        where: { id },
        include: {
          postImages: {
            include: { image: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      })
    })

    if (!post) {
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }

    return NextResponse.json({
      ...post,
      images: post.postImages.map((pi) => pi.image),
      postImages: undefined,
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
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
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        franchiseId: session.user.franchiseId,
      },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Don't allow deletion of published posts
    if (existingPost.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot delete published posts' },
        { status: 400 }
      )
    }

    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
