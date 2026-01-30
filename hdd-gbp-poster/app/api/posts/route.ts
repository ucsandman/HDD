import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { createPostSchema } from '@/schemas/post'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: { franchiseId: string; status?: string } = {
      franchiseId: session.user.franchiseId,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          postImages: {
            include: {
              image: true,
            },
            orderBy: { displayOrder: 'asc' },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          approvedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.post.count({ where }),
    ])

    // Transform posts to include images array
    const transformedPosts = posts.map((post) => ({
      ...post,
      images: post.postImages.map((pi) => pi.image),
      postImages: undefined,
    }))

    return NextResponse.json({
      posts: transformedPosts,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createPostSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const { imageIds, ...postData } = validation.data

    const post = await prisma.post.create({
      data: {
        ...postData,
        franchiseId: session.user.franchiseId,
        createdById: session.user.id,
        status: 'draft',
        ...(imageIds && imageIds.length > 0 && {
          postImages: {
            create: imageIds.map((imageId, index) => ({
              imageId,
              displayOrder: index,
            })),
          },
        }),
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
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
