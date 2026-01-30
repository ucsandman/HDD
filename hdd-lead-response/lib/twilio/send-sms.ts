import prisma from '@/lib/db'
import twilioClient, { getTwilioPhoneNumber } from './client'

interface SendSmsOptions {
  leadId: string
  to: string
  body: string
  sequenceStep?: number
  sentById?: string
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
  const { leadId, to, body, sequenceStep, sentById } = options

  try {
    // Send via Twilio
    const message = await twilioClient.messages.create({
      from: getTwilioPhoneNumber(),
      to,
      body,
    })

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
