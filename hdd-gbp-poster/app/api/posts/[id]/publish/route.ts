import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { isDemoMode, demoDelay, generateDemoGooglePostId, generateDemoGooglePostUrl } from '@/lib/demo'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can publish
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Get post with images
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
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Can only publish approved or scheduled posts
    if (!['approved', 'scheduled', 'draft', 'pending_review'].includes(post.status)) {
      return NextResponse.json(
        { error: `Cannot publish post with status: ${post.status}` },
        { status: 400 }
      )
    }

    // Already published
    if (post.status === 'published') {
      return NextResponse.json(
        { error: 'Post is already published' },
        { status: 400 }
      )
    }

    try {
      let result: { postId: string; postUrl: string }

      if (isDemoMode) {
        // Demo mode: simulate publishing with delay
        await demoDelay(2000)

        const demoPostId = generateDemoGooglePostId()
        result = {
          postId: demoPostId,
          postUrl: generateDemoGooglePostUrl(id),
        }
      } else {
        // Production mode: publish to Google
        const { createGooglePost } = await import('@/lib/google/client')
        result = await createGooglePost(session.user.franchiseId, {
          body: post.body,
          callToAction: post.callToAction
            ? {
                type: post.callToAction,
                url: post.callToActionUrl || undefined,
              }
            : undefined,
          imageUrls: post.postImages.map((pi) => pi.image.url),
        })
      }

      // Update post status
      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          status: 'published',
          publishedAt: new Date(),
          googlePostId: result.postId,
          googlePostUrl: result.postUrl,
          publishError: null,
        },
        include: {
          postImages: {
            include: { image: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      })

      return NextResponse.json({
        ...updatedPost,
        images: updatedPost.postImages.map((pi) => pi.image),
        postImages: undefined,
      })
    } catch (publishError) {
      // Store the error but don't auto-retry
      const errorMessage =
        publishError instanceof Error ? publishError.message : 'Unknown error'

      await prisma.post.update({
        where: { id },
        data: {
          status: 'failed',
          publishError: errorMessage,
        },
      })

      return NextResponse.json(
        { error: 'Failed to publish to Google', details: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error publishing post:', error)
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    )
  }
}
