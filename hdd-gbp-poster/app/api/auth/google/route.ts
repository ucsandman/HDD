import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getGoogleAuthUrl } from '@/lib/google/client'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can connect Google
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    const authUrl = await getGoogleAuthUrl(session.user.franchiseId)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error initiating Google OAuth:', error)
    return NextResponse.redirect(
      new URL('/settings?error=google_auth_failed', process.env.NEXTAUTH_URL!)
    )
  }
}
