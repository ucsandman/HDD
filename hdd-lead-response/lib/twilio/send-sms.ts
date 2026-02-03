import prisma from '@/lib/db'
import twilioClient, { getTwilioPhoneNumber } from './client'
import { checkSmsRateLimit, recordSmsSent } from '@/lib/rate-limit'

interface SendSmsOptions {
  leadId: string
  to: string
  body: string
  sequenceStep?: number
  sentById?: string
  bypassRateLimit?: boolean // Allow manual sends to bypass rate limit
}

interface SendSmsResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an SMS and log it to the messages table
 */
export async function sendSms(options: SendSmsOptions): Promise<SendSmsResult> {
  const { leadId, to, body, sequenceStep, sentById, bypassRateLimit = false } = options

  try {
    // Check rate limit (unless bypassed for manual sends)
    if (!bypassRateLimit) {
      const rateLimitCheck = await checkSmsRateLimit(leadId)
      if (!rateLimitCheck.allowed) {
        const errorMessage = `Rate limit exceeded: ${rateLimitCheck.reason}`
        console.warn(`SMS rate limit for lead ${leadId}: ${rateLimitCheck.reason}`)

        // Log blocked attempt
        await prisma.message.create({
          data: {
            leadId,
            channel: 'sms',
            direction: 'outbound',
            body,
            status: 'blocked',
            errorMessage,
            sequenceStep,
            sentById,
          },
        })

        return {
          success: false,
          error: errorMessage,
        }
      }
    }

    // Send via Twilio
    const message = await twilioClient.messages.create({
      from: getTwilioPhoneNumber(),
      to,
      body,
    })

    // Record SMS sent for rate limiting
    if (!bypassRateLimit) {
      await recordSmsSent(leadId)
    }

    // Log to database
    await prisma.message.create({
      data: {
        leadId,
        channel: 'sms',
        direction: 'outbound',
        body,
        status: message.status === 'failed' ? 'failed' : 'sent',
        externalId: message.sid,
        sequenceStep,
        sentById,
      },
    })

    // Update lead's last contacted timestamp
    await prisma.lead.update({
      where: { id: leadId },
      data: { lastContactedAt: new Date() },
    })

    return {
      success: true,
      messageId: message.sid,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    // Log failed message to database
    await prisma.message.create({
      data: {
        leadId,
        channel: 'sms',
        direction: 'outbound',
        body,
        status: 'failed',
        errorMessage,
        sequenceStep,
        sentById,
      },
    })

    console.error('Failed to send SMS:', errorMessage)

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Log an inbound SMS message
 */
export async function logInboundSms(options: {
  leadId: string
  from: string
  body: string
  externalId?: string
}): Promise<void> {
  const { leadId, body, externalId } = options

  await prisma.message.create({
    data: {
      leadId,
      channel: 'sms',
      direction: 'inbound',
      body,
      status: 'delivered',
      externalId,
    },
  })

  // Update lead's response tracking
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      lastRespondedAt: new Date(),
      status: 'engaged',
      sequenceStatus: 'paused', // Pause sequence when lead responds
    },
  })
}
