import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import anthropic from '@/lib/anthropic/client'
import { getSystemPrompt, getPromptForPostType } from '@/lib/anthropic/prompts'
import { EDUCATIONAL_TOPICS } from '@/types'

/**
 * Process Generation Queue Cron Job
 *
 * Runs: Every 15 minutes
 * Purpose: Processes pending items from the generation queue by calling the
 *          Anthropic API to generate post content.
 *
 * Flow:
 * 1. Find up to 5 pending queue items (oldest first)
 * 2. For each item:
 *    - Mark as "processing" to prevent duplicates
 *    - Generate content using Claude AI
 *    - Create draft post
 *    - Mark queue item as "completed" or "failed"
 *
 * Note: Separated from generate-drafts to avoid timeouts and enable better
 *       error isolation. Failed items remain in queue for manual review.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Process up to 5 pending queue items
    const queueItems = await prisma.generationQueue.findMany({
      where: { status: 'pending' },
      include: {
        franchise: {
          select: {
            id: true,
            name: true,
            contextInfo: true,
          },
        },
      },
      take: 5,
      orderBy: { createdAt: 'asc' },
    })

    if (queueItems.length === 0) {
      return NextResponse.json({
        processed: 0,
        message: 'No pending items in queue',
      })
    }

    const results = []

    for (const item of queueItems) {
      try {
        // Mark as processing (prevents duplicate processing)
        await prisma.generationQueue.update({
          where: { id: item.id },
          data: { status: 'processing' },
        })

        const systemPrompt = getSystemPrompt(item.franchise.contextInfo)

        // Generate appropriate params based on post type
        let params: { topic?: string; season?: string; projectTypeName?: string } = {}
        if (item.postType === 'educational') {
          // Pick a random educational topic
          const randomTopic = EDUCATIONAL_TOPICS[Math.floor(Math.random() * EDUCATIONAL_TOPICS.length)]
          params = { topic: randomTopic }
        } else if (item.postType === 'seasonal') {
          const month = new Date().getMonth()
          if (month >= 2 && month <= 4) params = { season: 'Spring' }
          else if (month >= 5 && month <= 7) params = { season: 'Summer' }
          else if (month >= 8 && month <= 10) params = { season: 'Fall' }
          else params = { season: 'Winter' }
        } else {
          params = { projectTypeName: 'composite deck' }
        }

        const postType = item.postType as 'project_showcase' | 'educational' | 'seasonal'
        const userPrompt = getPromptForPostType(postType, params)

        // Call Claude API
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        })

        const textBlock = message.content.find((block) => block.type === 'text')
        if (!textBlock || textBlock.type !== 'text') {
          throw new Error('No text in response')
        }

        let body = textBlock.text.trim()
        if (body.length > 1500) {
          body = body.slice(0, 1497) + '...'
        }

        // Create post
        await prisma.post.create({
          data: {
            franchiseId: item.franchiseId,
            postType: item.postType,
            body,
            status: 'draft',
            generatedBy: 'ai',
            generationPrompt: userPrompt,
          },
        })

        // Mark queue item as completed
        await prisma.generationQueue.update({
          where: { id: item.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
          },
        })

        results.push({
          id: item.id,
          franchiseId: item.franchiseId,
          franchiseName: item.franchise.name,
          postType: item.postType,
          status: 'completed',
        })
      } catch (error) {
        console.error(`Failed to process queue item ${item.id}:`, error)

        await prisma.generationQueue.update({
          where: { id: item.id },
          data: { status: 'failed' },
        })

        results.push({
          id: item.id,
          franchiseId: item.franchiseId,
          franchiseName: item.franchise.name,
          postType: item.postType,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      processed: queueItems.length,
      results,
    })
  } catch (error) {
    console.error('Error in process-generation-queue cron:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}
