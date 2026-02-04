import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/db'
import { normalizePhone } from '@/lib/phone'
import { webhookLeadSchema } from '@/schemas/lead'
import { processInstantResponse } from '@/lib/sequence'

/**
 * Verify HMAC signature for webhook requests
 * Uses timing-safe comparison to prevent timing attacks
 */
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) return false

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  // Length check must happen before timing-safe comparison
  // to prevent length-based timing attacks
  if (signature.length !== expectedSignature.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8')
  )
}

export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()

    // Verify signature
    const signature = request.headers.get('x-webhook-signature')
    if (!signature || !verifySignature(rawBody, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse and validate body
    const body = JSON.parse(rawBody)
    const validation = webhookLeadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check for duplicate external ID
    if (data.externalId) {
      const existing = await prisma.lead.findFirst({
        where: { externalId: data.externalId },
      })

      if (existing) {
        return NextResponse.json(
          { message: 'Lead already exists', leadId: existing.id },
          { status: 200 }
        )
      }
    }

    // Normalize phone number
    const phoneNormalized = normalizePhone(data.phone)

    // Create the lead
    const lead = await prisma.lead.create({
      data: {
        ...data,
        phoneNormalized,
        source: data.source || 'webhook',
      },
    })

    // Trigger instant response asynchronously
    processInstantResponse(lead.id).catch((error) => {
      console.error('Error processing instant response:', error)
    })

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
