import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Resend from 'next-auth/providers/resend'
import prisma from './db'
import type { SessionUser, UserRole } from '@/types'
import { isDemoMode, DEMO_SESSION } from './demo'

declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }
}

export const { handlers, signIn, signOut, auth: nextAuth } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Resend({
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      apiKey: process.env.RESEND_API_KEY,
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login?verify=true',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      // Only allow users that exist in our users table
      if (!user.email) return false

      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      return !!dbUser
    },
    async session({ session, user }) {
      // Fetch user from our users table to get franchiseId and role
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: {
          id: true,
          email: true,
          name: true,
          franchiseId: true,
          role: true,
        },
      })

      if (dbUser) {
        // Extend session.user with custom fields while preserving required fields
        session.user = {
          ...session.user,
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          franchiseId: dbUser.franchiseId,
          role: dbUser.role as UserRole,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
      }

      return session
    },
  },
  session: {
    strategy: 'database',
  },
})

/**
 * Auth wrapper that returns demo session in demo mode
 */
export async function auth() {
  if (isDemoMode) {
    // Return a mock session for demo mode
    return DEMO_SESSION as Awaited<ReturnType<typeof nextAuth>>
  }
  return nextAuth()
}

export async function getSession() {
  return await auth()
}

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
  return user
}
