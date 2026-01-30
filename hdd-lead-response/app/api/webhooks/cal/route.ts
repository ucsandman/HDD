import { NextResponse } from 'next/server'
import crypto from 'crypto'
import prisma from '@/lib/db'

/**
 * Verify Cal.com webhook signature
 */
function verifyCalSignature(payload: string, signature: string): boolean {
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) return false

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

interface CalBookingPayload {
  triggerEvent: string
  createdAt: string
  payload: {
    email: string
    name: string
    startTime: string
    endTime: string
    attendees: Array<{
      email: string
      name: string
    }>
  }
}

export async function POST(request: Request) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()

    // Verify signature
    const signature = request.headers.get('x-cal-signature-256')
    if (!signature || !verifyCalSignature(rawBody, signature)) {
      console.error('Invalid Cal.com signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse body
    const body: CalBookingPayload = JSON.parse(rawBody)

    // Only process BOOKING_CREATED events
    if (body.triggerEvent !== 'BOOKING_CREATED') {
      return NextResponse.json({ message: 'Event ignored' })
    }

    const { payload } = body
    const attendeeEmail = payload.attendees?.[0]?.email || payload.email

    if (!attendeeEmail) {
      console.log('No attendee email in Cal.com webhook')
      return NextResponse.json({ message: 'No attendee email' })
    }

    // Find matching lead by email
    const lead = await prisma.lead.findFirst({
      where: { email: attendeeEmail },
      orderBy: { createdAt: 'desc' },
    })

    if (!lead) {
      console.log('No lead found for email:', attendeeEmail)
      return NextResponse.json({ message: 'No matching lead' })
    }

    // Update lead status
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        consultationBookedAt: new Date(payload.startTime),
        status: 'booked',
        sequenceStatus: 'completed',
        nextFollowupAt: null,
      },
    })

    console.log(`Booking recorded for lead ${lead.id}`)

    return NextResponse.json({ success: true, leadId: lead.id })
  } catch (error) {
    console.error('Error processing Cal.com webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
