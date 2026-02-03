import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { isDemoMode, demoDelay, generateDemoGooglePostId, generateDemoGooglePostUrl } from '@/lib/demo'

/**
 * Publish Scheduled Posts Cron Job
 *
 * Runs: Every 15 minutes
 * Purpose: Publishes posts scheduled for the current time or earlier to Google Business Profile.
 *
 * In demo mode, this simulates publishing without actually calling Google APIs.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (middleware handles this, but double-check)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()

    // Find scheduled posts ready to publish
    const posts = await prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: { lte: now },
      },
      include: {
        franchise: {
          select: {
            id: true,
            googleAccountId: true,
            googleLocationId: true,
            googleRefreshToken: true,
          },
        },
        postImages: {
          include: { image: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      take: 5, // Process max 5 posts per run to avoid rate limits
    })

    const results = []

    for (const post of posts) {
      // Skip if Google not connected (except in demo mode where it's mocked)
      if (
        !isDemoMode &&
        (!post.franchise.googleAccountId ||
          !post.franchise.googleLocationId ||
          !post.franchise.googleRefreshToken)
      ) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'failed',
            publishError: 'Google account not connected',
          },
        })
        results.push({
          id: post.id,
          status: 'failed',
          error: 'Google not connected',
        })
        continue
      }

      try {
        let result: { postId: string; postUrl: string }

        if (isDemoMode) {
          // Demo mode: simulate publishing
          await demoDelay(500)
          const demoPostId = generateDemoGooglePostId()
          result = {
            postId: demoPostId,
            postUrl: generateDemoGooglePostUrl(post.id),
          }
        } else {
          // Production mode: publish to Google
          const { createGooglePost, getValidAccessToken } = await import(
            '@/lib/google/client'
          )

          // Ensure we have a valid access token
          await getValidAccessToken(post.franchise.id)

          // Publish to Google
          result = await createGooglePost(post.franchise.id, {
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
        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'published',
            publishedAt: new Date(),
            googlePostId: result.postId,
            googlePostUrl: result.postUrl,
            publishError: null,
          },
        })

        results.push({
          id: post.id,
          status: 'published',
          googlePostId: result.postId,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        await prisma.post.update({
          where: { id: post.id },
          data: {
            status: 'failed',
            publishError: errorMessage,
          },
        })

        results.push({ id: post.id, status: 'failed', error: errorMessage })
      }
    }

    return NextResponse.json({
      processed: posts.length,
      results,
    })
  } catch (error) {
    console.error('Error in publish-scheduled cron:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
