import { Resend } from 'resend'
import prisma from '@/lib/db'

const globalForResend = globalThis as unknown as {
  resendClient: Resend | undefined
}

function createResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY')
  }
  return new Resend(apiKey)
}

export const resendClient =
  globalForResend.resendClient ?? createResendClient()

if (process.env.NODE_ENV !== 'production') {
  globalForResend.resendClient = resendClient
}

export default resendClient

interface SendEmailOptions {
  leadId: string
  to: string
  subject: string
  body: string
  sequenceStep?: number
  sentById?: string
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email and log it to the messages table
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const { leadId, to, subject, body, sequenceStep, sentById } = options

  try {
    const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com'

    // Send via Resend
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to,
      subject,
      text: body,
    })

    if (error) {
      throw new Error(error.message)
    }

    // Log to database
    await prisma.message.create({
      data: {
        leadId,
        channel: 'email',
        direction: 'outbound',
        subject,
        body,
        status: 'sent',
        externalId: data?.id,
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
      messageId: data?.id,
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    // Log failed message to database
    await prisma.message.create({
      data: {
        leadId,
        channel: 'email',
        direction: 'outbound',
        subject,
        body,
        status: 'failed',
        errorMessage,
        sequenceStep,
        sentById,
      },
    })

    console.error('Failed to send email:', errorMessage)

    return {
      success: false,
      error: errorMessage,
    }
  }
}
