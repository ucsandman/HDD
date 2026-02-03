import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import anthropic from '@/lib/anthropic/client'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  checks: {
    database: {
      status: 'pass' | 'fail'
      message?: string
      responseTime?: number
    }
    googleAuth: {
      status: 'pass' | 'warn' | 'fail'
      franchises?: {
        id: string
        name: string
        connected: boolean
        authValid: boolean
      }[]
      message?: string
    }
    anthropic: {
      status: 'pass' | 'fail'
      message?: string
      responseTime?: number
    }
  }
}

export async function GET() {
  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'fail' },
      googleAuth: { status: 'fail' },
      anthropic: { status: 'fail' },
    },
  }

  // Check 1: Database connectivity
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbTime = Date.now() - dbStart

    result.checks.database = {
      status: 'pass',
      message: 'Database connection successful',
      responseTime: dbTime,
    }
  } catch (error) {
    result.checks.database = {
      status: 'fail',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
    result.status = 'unhealthy'
  }

  // Check 2: Google OAuth status for all franchises
  try {
    const franchises = await prisma.franchise.findMany({
      select: {
        id: true,
        name: true,
        googleRefreshToken: true,
        googleAuthValid: true,
      },
    })

    const franchiseStatuses = franchises.map((f) => ({
      id: f.id,
      name: f.name,
      connected: !!f.googleRefreshToken,
      authValid: f.googleAuthValid,
    }))

    const hasInvalidAuth = franchiseStatuses.some((f) => f.connected && !f.authValid)
    const allDisconnected = franchiseStatuses.every((f) => !f.connected)

    result.checks.googleAuth = {
      status: hasInvalidAuth ? 'warn' : allDisconnected ? 'fail' : 'pass',
      franchises: franchiseStatuses,
      message: hasInvalidAuth
        ? 'Some franchises require re-authorization'
        : allDisconnected
          ? 'No franchises connected to Google'
          : 'All connected franchises have valid auth',
    }

    if (hasInvalidAuth) {
      result.status = 'degraded'
    } else if (allDisconnected) {
      result.status = 'unhealthy'
    }
  } catch (error) {
    result.checks.googleAuth = {
      status: 'fail',
      message: `Failed to check Google auth status: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
    result.status = 'unhealthy'
  }

  // Check 3: Anthropic API availability
  try {
    const aiStart = Date.now()

    // Simple health check - just verify we can make a request
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    })

    const aiTime = Date.now() - aiStart

    if (message.content && message.content.length > 0) {
      result.checks.anthropic = {
        status: 'pass',
        message: 'Anthropic API connection successful',
        responseTime: aiTime,
      }
    } else {
      result.checks.anthropic = {
        status: 'fail',
        message: 'Anthropic API returned unexpected response',
      }
      result.status = 'degraded'
    }
  } catch (error) {
    result.checks.anthropic = {
      status: 'fail',
      message: `Anthropic API check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
    result.status = 'degraded'
  }

  // Return appropriate HTTP status code
  const httpStatus = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503

  return NextResponse.json(result, { status: httpStatus })
}
