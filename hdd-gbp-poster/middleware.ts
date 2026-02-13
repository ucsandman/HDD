import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Check for demo mode at edge runtime
// SECURITY: Demo mode is only allowed in non-production environments
const isDemoMode = process.env.DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // In demo mode, bypass all auth checks (except cron secret)
  // This block only executes in development/test environments
  if (isDemoMode) {
    // Cron endpoints still require CRON_SECRET header even in demo mode
    if (pathname.startsWith('/api/cron')) {
      const authHeader = request.headers.get('authorization')
      const expectedToken = `Bearer ${process.env.CRON_SECRET}`

      if (authHeader !== expectedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Redirect login page to dashboard in demo mode
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  }

  // Production mode: standard auth flow
  // We check for session cookies instead of using auth() because Prisma cannot run in Edge Runtime
  const hasSession = request.cookies.has('authjs.session-token') || 
                     request.cookies.has('__Secure-authjs.session-token') ||
                     request.cookies.has('next-auth.session-token') || 
                     request.cookies.has('__Secure-next-auth.session-token')

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth', '/api/health']
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path))

  // Cron endpoints require CRON_SECRET header
  if (pathname.startsWith('/api/cron')) {
    const authHeader = request.headers.get('authorization')
    const expectedToken = `Bearer ${process.env.CRON_SECRET}`

    if (authHeader !== expectedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Allow public paths
  if (isPublicPath) {
    // Redirect to dashboard if already logged in and trying to access login
    if (pathname === '/login' && hasSession) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // Require authentication for all other paths
  if (!hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
