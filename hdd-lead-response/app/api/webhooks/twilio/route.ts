import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { validateTwilioSignature } from '@/lib/twilio/client'
import { logInboundSms } from '@/lib/twilio/send-sms'
import { normalizePhone } from '@/lib/phone'

export async function POST(request: Request) {
  try {
    // Get form data from Twilio
    const formData = await request.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      params[key] = value.toString()
    })

    // Validate Twilio signature
    const signature = request.headers.get('x-twilio-signature')
    const url = request.url

    if (!signature || !validateTwilioSignature(signature, url, params)) {
      console.error('Invalid Twilio signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Extract message details
    const from = params.From
    const body = params.Body
    const messageSid = params.MessageSid

    if (!from || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Normalize phone number and find matching lead
    const normalizedPhone = normalizePhone(from)
    if (!normalizedPhone) {
      console.log('Could not normalize phone:', from)
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    const lead = await prisma.lead.findFirst({
      where: { phoneNormalized: normalizedPhone },
      orderBy: { createdAt: 'desc' },
    })

    if (!lead) {
      console.log('No lead found for phone:', normalizedPhone)
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Log the inbound message
    await logInboundSms({
      leadId: lead.id,
      from: normalizedPhone,
      body,
      externalId: messageSid,
    })

    console.log(`Received SMS from ${normalizedPhone} for lead ${lead.id}`)

    // Return empty TwiML response
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('Error processing Twilio webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}
