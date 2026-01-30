import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import anthropic from '@/lib/anthropic/client'
import { getSystemPrompt, getPromptForPostType } from '@/lib/anthropic/prompts'
import { generatePostSchema } from '@/schemas/generate'

// Rate limiting: track generations per user
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT = 10 // generations per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in ms

function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true }
  }

  if (userLimit.count >= RATE_LIMIT) {
    return {
      allowed: false,
      retryAfter: Math.ceil((userLimit.resetAt - now) / 1000),
    }
  }

  userLimit.count++
  return { allowed: true }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit
    const rateCheck = checkRateLimit(session.user.id)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateCheck.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfter),
          },
        }
      )
    }

    const body = await request.json()
    const validation = generatePostSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { postType, ...params } = validation.data

    // Get franchise context info
    const franchise = await prisma.franchise.findUnique({
      where: { id: session.user.franchiseId },
      select: { contextInfo: true },
    })

    // Build prompts
    const systemPrompt = getSystemPrompt(franchise?.contextInfo)
    const userPrompt = getPromptForPostType(postType, params)

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
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
        { error: 'Failed to generate content' },
        { status: 500 }
      )
    }

    let generatedBody = textBlock.text.trim()

    // Ensure content is within limit
    if (generatedBody.length > 1500) {
      generatedBody = generatedBody.slice(0, 1497) + '...'
    }

    return NextResponse.json({
      body: generatedBody,
      postType,
      generationPrompt: userPrompt,
      characterCount: generatedBody.length,
    })
  } catch (error) {
    console.error('Error generating post:', error)
    return NextResponse.json(
      { error: 'Failed to generate post' },
      { status: 500 }
    )
  }
}
