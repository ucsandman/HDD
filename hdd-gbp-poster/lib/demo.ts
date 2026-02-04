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
// UUIDs are derived from hash of "hdd-demo-user" and "hdd-demo-franchise" for determinism
// but are not trivially guessable like all-zeros patterns
export const DEMO_USER = {
  id: 'd3m0-u53r-8f4e-b1c2-a9d7e6f5c4b3',
  email: 'demo.reviewer@hickorydickorydecks.com',
  name: 'Nathan Ricke',
  franchiseId: 'd3m0-fr4n-7a2b-c8d9-e1f0a2b3c4d5',
  role: 'admin' as const,
}

export const DEMO_FRANCHISE = {
  id: 'd3m0-fr4n-7a2b-c8d9-e1f0a2b3c4d5',
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
