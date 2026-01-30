import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { approvePostSchema } from '@/schemas/post'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can approve
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validation = approvePostSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Verify ownership and check status
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        franchiseId: session.user.franchiseId,
      },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Can only approve drafts or pending_review posts
    if (!['draft', 'pending_review'].includes(existingPost.status)) {
      return NextResponse.json(
        { error: `Cannot approve post with status: ${existingPost.status}` },
        { status: 400 }
      )
    }

    const { scheduledFor } = validation.data

    // Determine new status based on whether scheduled
    const newStatus = scheduledFor ? 'scheduled' : 'approved'

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: newStatus,
        approvedById: session.user.id,
        approvedAt: new Date(),
        ...(scheduledFor && { scheduledFor: new Date(scheduledFor) }),
      },
      include: {
        postImages: {
          include: { image: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    })

    return NextResponse.json({
      ...post,
      images: post.postImages.map((pi) => pi.image),
      postImages: undefined,
    })
  } catch (error) {
    console.error('Error approving post:', error)
    return NextResponse.json(
      { error: 'Failed to approve post' },
      { status: 500 }
    )
  }
}
