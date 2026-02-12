import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { getSystemPrompt, getBlogPrompt } from '@/lib/anthropic/prompts'
import { generateBlogSchema } from '@/schemas/blog'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = generateBlogSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { topic, neighborhood, materials, targetKeywords } = validation.data

    // Dynamic import to avoid loading Anthropic SDK when not needed
    const anthropic = (await import('@/lib/anthropic/client')).default

    // Get franchise context info
    const franchise = await prisma.franchise.findUnique({
      where: { id: session.user.franchiseId },
      select: { contextInfo: true },
    })

    // Build prompts
    const systemPrompt = getSystemPrompt(franchise?.contextInfo)
    const userPrompt = getBlogPrompt({ topic, neighborhood, materials, targetKeywords })

    // Call Claude API - using the latest Sonnet 4.5 model as requested
    const message = await anthropic.messages.create({
      model: 'claude-4-5-sonnet-20250514',
      max_tokens: 4096,
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

    const rawText = textBlock.text
    
    // Parse the AI output based on markers
    const title = extractValue(rawText, 'TITLE') || topic
    const slug = extractValue(rawText, 'SLUG') || slugify(title)
    const content = extractValue(rawText, 'CONTENT') || rawText
    const metaTitle = extractValue(rawText, 'META_TITLE')
    const metaDescription = extractValue(rawText, 'META_DESCRIPTION')
    const keywordsRaw = extractValue(rawText, 'KEYWORDS')
    const keywords = keywordsRaw ? keywordsRaw.split(',').map(k => k.trim()) : []

    // Save to database
    const blog = await prisma.blog.create({
      data: {
        franchiseId: session.user.franchiseId,
        title,
        slug,
        content,
        excerpt: content.slice(0, 200) + '...',
        metaTitle,
        metaDescription,
        keywords,
        generatedBy: 'ai',
        generationPrompt: userPrompt,
        createdById: session.user.id,
        status: 'draft'
      }
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error generating blog:', error)
    return NextResponse.json(
      { error: 'Failed to generate blog' },
      { status: 500 }
    )
  }
}

function extractValue(text: string, marker: string): string | null {
  const regex = new RegExp(`\[${marker}\]\s*([\s\S]*?)(?=\s*\[|$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : null
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
}
