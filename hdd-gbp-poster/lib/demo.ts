/**
 * Demo mode utilities and constants
 *
 * When DEMO_MODE=true, the application runs entirely locally with:
 * - SQLite database instead of PostgreSQL
 * - Bypassed authentication (auto-login as demo user)
 * - Mock AI generation (if no ANTHROPIC_API_KEY)
 * - Mock Google Business Profile publishing
 * - Local file storage instead of Vercel Blob
 */

// Check if demo mode is enabled
export const isDemoMode = process.env.DEMO_MODE === 'true'

// Demo user credentials (used for auto-login)
export const DEMO_USER = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'demo.reviewer@hickorydickorydecks.com',
  name: 'Nathan Ricke',
  franchiseId: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  role: 'admin' as const,
}

export const DEMO_FRANCHISE = {
  id: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  name: 'Hickory Dickory Decks - Cincinnati',
  slug: 'cincinnati',
}

// Demo session object that matches NextAuth session structure
export const DEMO_SESSION = {
  user: DEMO_USER,
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
}

/**
 * Generate a fake Google Post ID for demo publishing
 */
export function generateDemoGooglePostId(): string {
  return `demo-post-${Date.now()}`
}

/**
 * Generate a fake Google Post URL for demo publishing
 */
export function generateDemoGooglePostUrl(postId: string): string {
  return `https://business.google.com/posts/demo/${postId}`
}

/**
 * Simulate API latency for demo mode
 */
export function demoDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Normalize tags field for demo mode (SQLite stores as JSON string)
 * In production PostgreSQL, tags is an array
 * In demo SQLite, tags is a JSON string that needs parsing
 */
export function normalizeTags(tags: string | string[] | null | undefined): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
