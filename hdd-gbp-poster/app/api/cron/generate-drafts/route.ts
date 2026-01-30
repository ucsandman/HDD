import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import anthropic from '@/lib/anthropic/client'
import { getSystemPrompt, getPromptForPostType } from '@/lib/anthropic/prompts'
import { EDUCATIONAL_TOPICS } from '@/types'

const POST_TYPE_ROTATION = ['project_showcase', 'educational', 'seasonal'] as const

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

      // Process pending queue items for this franchise
      const pendingItems = await prisma.generationQueue.findMany({
        where: {
          franchiseId: franchise.id,
          status: 'pending',
        },
        take: 3, // Process max 3 per franchise per run
      })

      let generated = 0
      for (const item of pendingItems) {
        try {
          const systemPrompt = getSystemPrompt(franchise.contextInfo)

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
              franchiseId: franchise.id,
              postType: item.postType,
              body,
              status: 'draft',
              generatedBy: 'ai',
              generationPrompt: userPrompt,
            },
          })

          // Mark queue item complete
          await prisma.generationQueue.update({
            where: { id: item.id },
            data: {
              status: 'completed',
              completedAt: new Date(),
            },
          })

          generated++
        } catch (error) {
          console.error(`Failed to generate draft for queue item ${item.id}:`, error)

          await prisma.generationQueue.update({
            where: { id: item.id },
            data: { status: 'failed' },
          })
        }
      }

      results.push({
        franchiseId: franchise.id,
        name: franchise.name,
        generated,
        queued: queueEntries.length,
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
