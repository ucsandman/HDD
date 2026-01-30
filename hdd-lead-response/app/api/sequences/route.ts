import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { updateAllSequenceStepsSchema } from '@/schemas/sequence'

export async function GET() {
  try {
    await requireAuth()

    const steps = await prisma.sequenceStep.findMany({
      orderBy: { stepNumber: 'asc' },
    })

    return NextResponse.json(steps)
  } catch (error) {
    console.error('Error fetching sequences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sequences' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const validation = updateAllSequenceStepsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const updates = validation.data

    // Update each step
    const results = await Promise.all(
      updates.map((update) =>
        prisma.sequenceStep.update({
          where: { id: update.id },
          data: {
            name: update.name,
            delayMinutes: update.delayMinutes,
            smsTemplate: update.smsTemplate,
            emailSubject: update.emailSubject,
            emailTemplate: update.emailTemplate,
            sendSms: update.sendSms,
            sendEmail: update.sendEmail,
            isActive: update.isActive,
          },
        })
      )
    )

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error updating sequences:', error)
    return NextResponse.json(
      { error: 'Failed to update sequences' },
      { status: 500 }
    )
  }
}
