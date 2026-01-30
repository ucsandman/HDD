import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { updateFranchiseSchema } from '@/schemas/franchise'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const franchise = await prisma.franchise.findUnique({
      where: { id: session.user.franchiseId },
      select: {
        id: true,
        name: true,
        slug: true,
        postsPerWeek: true,
        preferredPostDays: true,
        preferredPostTime: true,
        timezone: true,
        contextInfo: true,
        googleAccountId: true,
        googleLocationId: true,
        googleTokenExpiresAt: true,
      },
    })

    if (!franchise) {
      return NextResponse.json({ error: 'Franchise not found' }, { status: 404 })
    }

    // Check if Google is connected
    const googleConnected = !!(
      franchise.googleAccountId &&
      franchise.googleLocationId &&
      franchise.googleTokenExpiresAt
    )

    return NextResponse.json({
      ...franchise,
      googleConnected,
      // Remove sensitive fields
      googleAccountId: undefined,
      googleLocationId: undefined,
      googleTokenExpiresAt: undefined,
    })
  } catch (error) {
    console.error('Error fetching franchise:', error)
    return NextResponse.json(
      { error: 'Failed to fetch franchise' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update franchise settings
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = updateFranchiseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const franchise = await prisma.franchise.update({
      where: { id: session.user.franchiseId },
      data: validation.data,
      select: {
        id: true,
        name: true,
        slug: true,
        postsPerWeek: true,
        preferredPostDays: true,
        preferredPostTime: true,
        timezone: true,
        contextInfo: true,
      },
    })

    return NextResponse.json(franchise)
  } catch (error) {
    console.error('Error updating franchise:', error)
    return NextResponse.json(
      { error: 'Failed to update franchise' },
      { status: 500 }
    )
  }
}
