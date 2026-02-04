export interface CreateDraftRequest {
  title?: string
  body: string
  postType?: 'project_showcase' | 'educational' | 'seasonal'
  suggestedDate?: string
  source?: string
}

export interface CreateDraftResponse {
  success: boolean
  postId: string
  message: string
  editUrl: string
}

// GBP Poster URL is safe to expose (it's just a URL, no credentials)
// Used for generating edit links that open in new tab
// In production, this must be set; in development, falls back to localhost
const GBP_POSTER_URL = import.meta.env.VITE_GBP_POSTER_URL ||
  (import.meta.env.DEV ? 'http://localhost:3000' : '')

export class GBPApiError extends Error {
  status?: number
  details?: unknown

  constructor(message: string, status?: number, details?: unknown) {
    super(message)
    this.name = 'GBPApiError'
    this.status = status
    this.details = details
  }
}

/**
 * Create a draft post via server-side proxy
 * API credentials are kept secure on the server, not exposed in client bundle
 */
export async function createDraft(request: CreateDraftRequest): Promise<CreateDraftResponse> {
  try {
    // Call our own server-side proxy which holds the API credentials
    const response = await fetch('/api/create-draft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new GBPApiError(
        data.error || 'Failed to create draft',
        response.status,
        data.details
      )
    }

    return data
  } catch (error) {
    if (error instanceof GBPApiError) {
      throw error
    }

    // Network or other errors
    throw new GBPApiError(
      'Unable to connect to GBP Post Scheduler. Make sure the server is configured.',
      0
    )
  }
}

export function getGBPPosterUrl(path: string = ''): string {
  return `${GBP_POSTER_URL}${path}`
}

/**
 * Check if GBP integration is configured
 * Note: This only checks if the URL is configured (for edit links)
 * Server-side credentials are validated when making API calls
 */
export function isConfigured(): boolean {
  // In production, require explicit configuration
  if (!import.meta.env.DEV && !import.meta.env.VITE_GBP_POSTER_URL) {
    return false
  }
  return !!GBP_POSTER_URL
}
