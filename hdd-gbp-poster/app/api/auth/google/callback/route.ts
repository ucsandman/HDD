import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import {
  exchangeCodeForTokens,
  storeGoogleTokens,
  fetchGoogleAccountInfo,
  verifyOAuthState,
} from '@/lib/google/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL!))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL('/settings?error=google_denied', process.env.NEXTAUTH_URL!)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings?error=no_code', process.env.NEXTAUTH_URL!)
      )
    }

    if (!state) {
      return NextResponse.redirect(
        new URL('/settings?error=missing_state', process.env.NEXTAUTH_URL!)
      )
    }

    // Verify the encrypted state parameter (contains franchiseId, nonce, timestamp)
    const franchiseIdFromState = verifyOAuthState(state)
    if (!franchiseIdFromState) {
      return NextResponse.redirect(
        new URL('/settings?error=invalid_state', process.env.NEXTAUTH_URL!)
      )
    }

    // Verify the state's franchiseId matches the user's franchise (prevents CSRF)
    if (franchiseIdFromState !== session.user.franchiseId) {
      return NextResponse.redirect(
        new URL('/settings?error=franchise_mismatch', process.env.NEXTAUTH_URL!)
      )
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Store tokens
    await storeGoogleTokens(session.user.franchiseId, tokens)

    // Fetch and store account info
    const accountInfo = await fetchGoogleAccountInfo(tokens.accessToken)

    await prisma.franchise.update({
      where: { id: session.user.franchiseId },
      data: {
        googleAccountId: accountInfo.accountId,
        googleLocationId: accountInfo.locationId,
      },
    })

    return NextResponse.redirect(
      new URL('/settings?success=google_connected', process.env.NEXTAUTH_URL!)
    )
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/settings?error=google_callback_failed', process.env.NEXTAUTH_URL!)
    )
  }
}
