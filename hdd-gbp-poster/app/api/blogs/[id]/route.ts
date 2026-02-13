import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const blog = await prisma.blog.findUnique({
      where: {
        id,
        franchiseId: session.user.franchiseId,
      },
    })

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }

    return NextResponse.json(blog)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Whitelist fields that can be updated
    const { title, content, slug, metaTitle, metaDescription, keywords } = body

    const blog = await prisma.blog.update({
      where: {
        id,
        franchiseId: session.user.franchiseId,
      },
      data: {
        title,
        content,
        slug,
        metaTitle,
        metaDescription,
        keywords,
        // Update excerpt automatically if content changed
        excerpt: content ? content.slice(0, 200) + '...' : undefined,
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.blog.delete({
      where: {
        id,
        franchiseId: session.user.franchiseId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 })
  }
}
