import prisma from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GBP_API_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const GBP_POSTS_API_BASE = 'https://mybusiness.googleapis.com/v4'

interface TokenResponse {
  access_token: string
  expires_in: number
  refresh_token?: string
  token_type: string
}

interface GoogleTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export async function getGoogleAuthUrl(franchiseId: string): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/google/callback`

  const scopes = [
    'https://www.googleapis.com/auth/business.manage',
  ]

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: franchiseId,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  const data: TokenResponse = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token!,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const data: TokenResponse = await response.json()

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  }
}

export async function getValidAccessToken(franchiseId: string): Promise<string> {
  const franchise = await prisma.franchise.findUnique({
    where: { id: franchiseId },
    select: {
      googleAccessToken: true,
      googleRefreshToken: true,
      googleTokenExpiresAt: true,
      googleAuthValid: true,
    },
  })

  if (!franchise?.googleRefreshToken) {
    throw new Error('Google account not connected')
  }

  if (franchise.googleAuthValid === false) {
    throw new Error('Google authentication requires re-authorization')
  }

  const refreshToken = decrypt(franchise.googleRefreshToken)

  // Check if token is expired or will expire within 5 minutes
  const now = new Date()
  const expiresAt = franchise.googleTokenExpiresAt
  const needsRefresh = !expiresAt || expiresAt.getTime() - now.getTime() < 5 * 60 * 1000

  if (needsRefresh) {
    try {
      const tokens = await refreshAccessToken(refreshToken)

      // Update tokens in database and mark auth as valid
      await prisma.franchise.update({
        where: { id: franchiseId },
        data: {
          googleAccessToken: encrypt(tokens.accessToken),
          googleRefreshToken: encrypt(tokens.refreshToken),
          googleTokenExpiresAt: tokens.expiresAt,
          googleAuthValid: true,
        },
      })

      return tokens.accessToken
    } catch (error) {
      // Mark auth as invalid if refresh fails
      await prisma.franchise.update({
        where: { id: franchiseId },
        data: {
          googleAuthValid: false,
        },
      })

      throw new Error(`Token refresh failed - re-authorization required: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return decrypt(franchise.googleAccessToken!)
}

export async function storeGoogleTokens(
  franchiseId: string,
  tokens: GoogleTokens
): Promise<void> {
  await prisma.franchise.update({
    where: { id: franchiseId },
    data: {
      googleAccessToken: encrypt(tokens.accessToken),
      googleRefreshToken: encrypt(tokens.refreshToken),
      googleTokenExpiresAt: tokens.expiresAt,
      googleAuthValid: true,
    },
  })
}

export async function fetchGoogleAccountInfo(accessToken: string): Promise<{
  accountId: string
  locationId: string
}> {
  // First, get accounts
  const accountsResponse = await fetch(
    `${GBP_API_BASE}/accounts`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!accountsResponse.ok) {
    throw new Error('Failed to fetch Google Business accounts')
  }

  const accountsData = await accountsResponse.json()
  const account = accountsData.accounts?.[0]

  if (!account) {
    throw new Error('No Google Business accounts found')
  }

  // Get locations for the account
  const locationsResponse = await fetch(
    `${GBP_API_BASE}/${account.name}/locations`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!locationsResponse.ok) {
    throw new Error('Failed to fetch locations')
  }

  const locationsData = await locationsResponse.json()
  const location = locationsData.locations?.[0]

  if (!location) {
    throw new Error('No locations found for this account')
  }

  // Extract IDs from resource names
  // Format: accounts/123456789 and locations/987654321
  const accountId = account.name.replace('accounts/', '')
  const locationId = location.name.split('/').pop()

  return { accountId, locationId }
}

export async function disconnectGoogle(franchiseId: string): Promise<void> {
  await prisma.franchise.update({
    where: { id: franchiseId },
    data: {
      googleAccountId: null,
      googleLocationId: null,
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiresAt: null,
      googleAuthValid: true, // Reset to true for next connection
    },
  })
}

interface CreatePostParams {
  body: string
  callToAction?: {
    type: string
    url?: string
  }
  imageUrls?: string[]
}

export async function createGooglePost(
  franchiseId: string,
  params: CreatePostParams
): Promise<{ postId: string; postUrl: string }> {
  const accessToken = await getValidAccessToken(franchiseId)

  const franchise = await prisma.franchise.findUnique({
    where: { id: franchiseId },
    select: {
      googleAccountId: true,
      googleLocationId: true,
    },
  })

  if (!franchise?.googleAccountId || !franchise?.googleLocationId) {
    throw new Error('Google account not properly connected')
  }

  const parent = `accounts/${franchise.googleAccountId}/locations/${franchise.googleLocationId}`

  const postBody: {
    languageCode: string
    summary: string
    callToAction?: { actionType: string; url?: string }
    media?: Array<{ mediaFormat: string; sourceUrl: string }>
  } = {
    languageCode: 'en-US',
    summary: params.body,
  }

  if (params.callToAction?.type) {
    postBody.callToAction = {
      actionType: params.callToAction.type,
      url: params.callToAction.url,
    }
  }

  if (params.imageUrls && params.imageUrls.length > 0) {
    postBody.media = params.imageUrls.map((url) => ({
      mediaFormat: 'PHOTO',
      sourceUrl: url,
    }))
  }

  const response = await fetch(`${GBP_POSTS_API_BASE}/${parent}/localPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postBody),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create Google post: ${error}`)
  }

  const data = await response.json()

  return {
    postId: data.name,
    postUrl: data.searchUrl || `https://business.google.com/posts/l/${franchise.googleLocationId}`,
  }
}
