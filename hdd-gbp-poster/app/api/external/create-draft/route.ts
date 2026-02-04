import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'

// Schema for external draft creation
const externalDraftSchema = z.object({
  title: z.string().max(255).optional(),
  body: z.string().min(1).max(1500),
  postType: z.enum(['project_showcase', 'educational', 'seasonal']).default('seasonal'),
  suggestedDate: z.string().datetime().optional(),
  source: z.string().max(100).optional(), // e.g., "weather-content"
})

// Rate limiting: track requests per franchise
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20 // drafts per hour per franchise
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in ms

function checkRateLimit(franchiseId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const key = `external_${franchiseId}`
  const limit = rateLimitMap.get(key)

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true }
  }

  if (limit.count >= RATE_LIMIT) {
    return {
      allowed: false,
      retryAfter: Math.ceil((limit.resetAt - now) / 1000),
    }
  }

  limit.count++
  return { allowed: true }
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify franchise ID header
    const franchiseId = request.headers.get('x-franchise-id')
    if (!franchiseId) {
      return NextResponse.json(
        { error: 'Missing franchise ID header' },
        { status: 400 }
      )
    }

    // Check rate limit before database operations
    const rateCheck = checkRateLimit(franchiseId)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateCheck.retryAfter },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfter) },
        }
      )
    }

    // Verify franchise exists
    const franchise = await prisma.franchise.findUnique({
      where: { id: franchiseId },
    })

    if (!franchise) {
      return NextResponse.json({ error: 'Franchise not found' }, { status: 404 })
    }

    // Parse and validate body
    const body = await request.json()
    const validation = externalDraftSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { suggestedDate, source, ...postData } = validation.data

    // Create draft post
    const post = await prisma.post.create({
      data: {
        ...postData,
        franchiseId,
        status: 'draft',
        generatedBy: 'manual',
        generationPrompt: source
          ? `Created via ${source}${suggestedDate ? ` for ${suggestedDate}` : ''}`
          : undefined,
        ...(suggestedDate && { scheduledFor: new Date(suggestedDate) }),
      },
    })

    return NextResponse.json(
      {
        success: true,
        postId: post.id,
        message: 'Draft created successfully',
        editUrl: `/posts/${post.id}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating external draft:', error)
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    )
  }
}
