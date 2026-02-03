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

const GBP_POSTER_URL = import.meta.env.VITE_GBP_POSTER_URL || 'http://localhost:3000'
const API_KEY = import.meta.env.VITE_GBP_POSTER_API_KEY
const FRANCHISE_ID = import.meta.env.VITE_GBP_FRANCHISE_ID

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

export async function createDraft(request: CreateDraftRequest): Promise<CreateDraftResponse> {
  if (!API_KEY || !FRANCHISE_ID) {
    throw new GBPApiError(
      'GBP integration not configured. Please set VITE_GBP_POSTER_API_KEY and VITE_GBP_FRANCHISE_ID in .env',
      0
    )
  }

  try {
    const response = await fetch(`${GBP_POSTER_URL}/api/external/create-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-franchise-id': FRANCHISE_ID,
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
      'Unable to connect to GBP Post Scheduler. Make sure it is running.',
      0
    )
  }
}

export function getGBPPosterUrl(path: string = ''): string {
  return `${GBP_POSTER_URL}${path}`
}

export function isConfigured(): boolean {
  return !!(API_KEY && FRANCHISE_ID)
}
