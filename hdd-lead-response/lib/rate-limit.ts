import prisma from '@/lib/db'

const SMS_MIN_INTERVAL_MS = 60 * 1000 // 1 minute between SMS
const SMS_DAILY_LIMIT = 5 // Max 5 SMS per day per lead

export interface RateLimitResult {
  allowed: boolean
  reason?: string
  retryAfter?: number // Seconds until next attempt allowed
}

/**
 * Check if SMS can be sent to a lead based on rate limits
 */
export async function checkSmsRateLimit(leadId: string): Promise<RateLimitResult> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      lastSmsAt: true,
      smsCountToday: true,
      smsCountResetAt: true,
    },
  })

  if (!lead) {
    return { allowed: false, reason: 'Lead not found' }
  }

  const now = new Date()

  // Check if we need to reset daily counter
  let smsCountToday = lead.smsCountToday
  let needsReset = false

  if (!lead.smsCountResetAt) {
    needsReset = true
  } else {
    const resetTime = new Date(lead.smsCountResetAt)
    if (now >= resetTime) {
      needsReset = true
    }
  }

  if (needsReset) {
    smsCountToday = 0
  }

  // Check daily limit
  if (smsCountToday >= SMS_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: `Daily SMS limit reached (${SMS_DAILY_LIMIT}/day)`,
    }
  }

  // Check minimum interval between SMS
  if (lead.lastSmsAt) {
    const timeSinceLastSms = now.getTime() - lead.lastSmsAt.getTime()
    if (timeSinceLastSms < SMS_MIN_INTERVAL_MS) {
      const retryAfter = Math.ceil((SMS_MIN_INTERVAL_MS - timeSinceLastSms) / 1000)
      return {
        allowed: false,
        reason: 'Too soon since last SMS (min 1 minute)',
        retryAfter,
      }
    }
  }

  return { allowed: true }
}

/**
 * Record an SMS send attempt and update rate limit counters
 */
export async function recordSmsSent(leadId: string): Promise<void> {
  const now = new Date()

  // Get current counters
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      smsCountToday: true,
      smsCountResetAt: true,
    },
  })

  if (!lead) return

  // Determine if we need to reset
  let smsCountToday = lead.smsCountToday
  let smsCountResetAt = lead.smsCountResetAt

  if (!smsCountResetAt || now >= smsCountResetAt) {
    smsCountToday = 0
    // Set next reset to tomorrow at midnight
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    smsCountResetAt = tomorrow
  }

  // Increment counter
  smsCountToday += 1

  // Update lead
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      lastSmsAt: now,
      smsCountToday,
      smsCountResetAt,
    },
  })
}

/**
 * Get rate limit status for display purposes
 */
export async function getSmsRateLimitStatus(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      lastSmsAt: true,
      smsCountToday: true,
      smsCountResetAt: true,
    },
  })

  if (!lead) return null

  const now = new Date()
  let smsCountToday = lead.smsCountToday

  // Check if counter needs reset
  if (lead.smsCountResetAt && now >= lead.smsCountResetAt) {
    smsCountToday = 0
  }

  return {
    smsCountToday,
    dailyLimit: SMS_DAILY_LIMIT,
    lastSmsAt: lead.lastSmsAt,
    resetAt: lead.smsCountResetAt,
  }
}
