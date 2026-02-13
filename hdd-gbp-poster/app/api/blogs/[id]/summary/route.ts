import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { getSystemPrompt, getGBPSummaryPrompt } from '@/lib/anthropic/prompts'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const blogId = params.id

    const blog = await prisma.blog.findUnique({
      where: { 
        id: blogId,
        franchiseId: session.user.franchiseId
      }
    })

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    // Dynamic import to avoid loading Anthropic SDK when not needed
    const anthropic = (await import('@/lib/anthropic/client')).default

    // Get franchise context info
    const franchise = await prisma.franchise.findUnique({
      where: { id: session.user.franchiseId },
      select: { contextInfo: true },
    })

    // Build prompts
    const systemPrompt = getSystemPrompt(franchise?.contextInfo)
    const userPrompt = getGBPSummaryPrompt(blog.content)

    // Call Claude API - using Sonnet 4.5
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Extract text from response
    const textBlock = message.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 500 }
      )
    }

    const summary = textBlock.text.trim()

    return NextResponse.json({
      summary,
      postType: 'educational', // Default for blog summaries
      blogId: blog.id,
      title: `Update: ${blog.title}`
    })
  } catch (error) {
    console.error('Error generating blog summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
