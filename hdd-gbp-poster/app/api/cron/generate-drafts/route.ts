import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

const POST_TYPE_ROTATION = ['project_showcase', 'educational', 'seasonal'] as const

/**
 * Generate Drafts Cron Job
 *
 * Runs: Weekly on Sundays at 5:00 UTC
 * Purpose: Determines how many posts each franchise needs for the upcoming week
 *          and adds them to the generation queue.
 *
 * Flow:
 * 1. For each franchise, calculate needed posts (postsPerWeek - existing drafts)
 * 2. Add queue entries with post types in rotation (project/educational/seasonal)
 * 3. Queue entries are processed by the process-generation-queue cron
 *
 * Note: This endpoint does NOT generate content. It only creates queue entries.
 *       Actual AI generation happens in /api/cron/process-generation-queue
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all franchises
    const franchises = await prisma.franchise.findMany({
      select: {
        id: true,
        name: true,
        postsPerWeek: true,
        preferredPostDays: true,
        contextInfo: true,
      },
    })

    const results = []

    for (const franchise of franchises) {
      const days = franchise.preferredPostDays.split(',')
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay() + 7) // Next week starts
      startOfWeek.setHours(0, 0, 0, 0)

      // Get existing drafts for next week
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)

      const existingDrafts = await prisma.post.count({
        where: {
          franchiseId: franchise.id,
          status: { in: ['draft', 'pending_review', 'approved', 'scheduled'] },
          createdAt: { gte: startOfWeek, lt: endOfWeek },
        },
      })

      // Calculate how many drafts we need
      const neededDrafts = Math.max(0, franchise.postsPerWeek - existingDrafts)

      if (neededDrafts === 0) {
        results.push({
          franchiseId: franchise.id,
          name: franchise.name,
          generated: 0,
          message: 'Sufficient drafts exist',
        })
        continue
      }

      // Add to generation queue
      const queueEntries = []
      for (let i = 0; i < neededDrafts; i++) {
        const dayIndex = i % days.length
        const postTypeIndex = i % POST_TYPE_ROTATION.length
        const generateForDate = new Date(startOfWeek)

        // Find the actual date for this day
        const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(days[dayIndex])
        if (dayOfWeek !== -1) {
          generateForDate.setDate(startOfWeek.getDate() + dayOfWeek)
        } else {
          generateForDate.setDate(startOfWeek.getDate() + i)
        }

        queueEntries.push({
          franchiseId: franchise.id,
          postType: POST_TYPE_ROTATION[postTypeIndex],
          generateForDate,
          status: 'pending',
        })
      }

      await prisma.generationQueue.createMany({
        data: queueEntries,
      })

      results.push({
        franchiseId: franchise.id,
        name: franchise.name,
        queued: queueEntries.length,
        message: `Added ${queueEntries.length} items to generation queue`,
      })
    }

    return NextResponse.json({
      franchisesProcessed: franchises.length,
      results,
    })
  } catch (error) {
    console.error('Error in generate-drafts cron:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}
