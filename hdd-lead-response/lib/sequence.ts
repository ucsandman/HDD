import prisma from '@/lib/db'
import { sendSms } from '@/lib/twilio/send-sms'
import { sendEmail } from '@/lib/resend/client'
import { renderSmsTemplate, renderEmailTemplates } from '@/lib/templates'
import type { Lead, SequenceStep } from '@prisma/client'

/**
 * Get all settings as a key-value map
 */
async function getSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany()
  return settings.reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    },
    {} as Record<string, string>
  )
}

/**
 * Calculate the next followup time based on the step's delay
 */
function calculateNextFollowup(step: SequenceStep): Date {
  const now = new Date()
  return new Date(now.getTime() + step.delayMinutes * 60 * 1000)
}

/**
 * Process the instant response for a new lead
 * Called immediately when a lead is created
 */
export async function processInstantResponse(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!lead) {
    console.error(`Lead not found: ${leadId}`)
    return
  }

  // Get the first sequence step (step 0 = instant)
  const step = await prisma.sequenceStep.findUnique({
    where: { stepNumber: 0 },
  })

  if (!step || !step.isActive) {
    console.log('No active instant step configured')
    // Still schedule the next step
    await scheduleNextStep(lead, 0)
    return
  }

  const settings = await getSettings()
  const context = { lead, settings }

  // Send SMS if configured and lead has phone
  if (step.sendSms && step.smsTemplate && lead.phoneNormalized) {
    const smsBody = renderSmsTemplate(step, context)
    if (smsBody) {
      await sendSms({
        leadId: lead.id,
        to: lead.phoneNormalized,
        body: smsBody,
        sequenceStep: 0,
      })
    }
  }

  // Send email if configured and lead has email
  if (step.sendEmail && lead.email) {
    const emailContent = renderEmailTemplates(step, context)
    if (emailContent) {
      await sendEmail({
        leadId: lead.id,
        to: lead.email,
        subject: emailContent.subject,
        body: emailContent.body,
        sequenceStep: 0,
      })
    }
  }

  // Update lead status and schedule next step
  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      status: 'contacted',
      sequenceStep: 0,
    },
  })

  await scheduleNextStep(lead, 0)
}

/**
 * Schedule the next followup step for a lead
 */
async function scheduleNextStep(
  lead: Lead,
  currentStep: number
): Promise<void> {
  // Get the next step
  const nextStep = await prisma.sequenceStep.findFirst({
    where: {
      stepNumber: { gt: currentStep },
      isActive: true,
    },
    orderBy: { stepNumber: 'asc' },
  })

  if (!nextStep) {
    // No more steps - mark sequence as completed
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        sequenceStatus: 'completed',
        nextFollowupAt: null,
      },
    })
    return
  }

  // Schedule the next followup
  const nextFollowupAt = calculateNextFollowup(nextStep)
  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      nextFollowupAt,
    },
  })
}

/**
 * Process a single followup for a lead
 * Called by the cron job when nextFollowupAt is reached
 */
export async function processFollowup(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!lead) {
    console.error(`Lead not found: ${leadId}`)
    return
  }

  // Check skip conditions
  if (lead.sequenceStatus !== 'active') {
    console.log(`Skipping lead ${leadId}: sequence status is ${lead.sequenceStatus}`)
    return
  }

  if (lead.lastRespondedAt) {
    console.log(`Skipping lead ${leadId}: lead has responded`)
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        sequenceStatus: 'paused',
        nextFollowupAt: null,
      },
    })
    return
  }

  if (lead.consultationBookedAt) {
    console.log(`Skipping lead ${leadId}: consultation booked`)
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        sequenceStatus: 'completed',
        status: 'booked',
        nextFollowupAt: null,
      },
    })
    return
  }

  // Get the next step to execute
  const nextStepNumber = lead.sequenceStep + 1
  const step = await prisma.sequenceStep.findUnique({
    where: { stepNumber: nextStepNumber },
  })

  if (!step || !step.isActive) {
    // No more steps - mark sequence as completed
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        sequenceStatus: 'completed',
        nextFollowupAt: null,
      },
    })
    return
  }

  const settings = await getSettings()
  const context = { lead, settings }

  // Send SMS if configured and lead has phone
  if (step.sendSms && step.smsTemplate && lead.phoneNormalized) {
    const smsBody = renderSmsTemplate(step, context)
    if (smsBody) {
      await sendSms({
        leadId: lead.id,
        to: lead.phoneNormalized,
        body: smsBody,
        sequenceStep: nextStepNumber,
      })
    }
  }

  // Send email if configured and lead has email
  if (step.sendEmail && lead.email) {
    const emailContent = renderEmailTemplates(step, context)
    if (emailContent) {
      await sendEmail({
        leadId: lead.id,
        to: lead.email,
        subject: emailContent.subject,
        body: emailContent.body,
        sequenceStep: nextStepNumber,
      })
    }
  }

  // Update lead's sequence step
  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      sequenceStep: nextStepNumber,
    },
  })

  // Schedule next step
  await scheduleNextStep(lead, nextStepNumber)
}

/**
 * Process all pending followups
 * Called by the cron job every 5 minutes
 */
export async function processAllFollowups(maxLeads = 20): Promise<number> {
  const now = new Date()

  // Find leads with pending followups
  const leads = await prisma.lead.findMany({
    where: {
      sequenceStatus: 'active',
      nextFollowupAt: { lte: now },
    },
    take: maxLeads,
    orderBy: { nextFollowupAt: 'asc' },
  })

  console.log(`Processing ${leads.length} followups`)

  for (const lead of leads) {
    try {
      await processFollowup(lead.id)
    } catch (error) {
      console.error(`Error processing followup for lead ${lead.id}:`, error)
    }
  }

  return leads.length
}

/**
 * Pause the sequence for a lead
 */
export async function pauseSequence(leadId: string): Promise<void> {
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      sequenceStatus: 'paused',
      nextFollowupAt: null,
    },
  })
}

/**
 * Resume the sequence for a lead
 */
export async function resumeSequence(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!lead) return

  // Get the next step
  const nextStep = await prisma.sequenceStep.findFirst({
    where: {
      stepNumber: { gt: lead.sequenceStep },
      isActive: true,
    },
    orderBy: { stepNumber: 'asc' },
  })

  if (!nextStep) {
    // No more steps
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        sequenceStatus: 'completed',
        nextFollowupAt: null,
      },
    })
    return
  }

  // Schedule next followup
  const nextFollowupAt = calculateNextFollowup(nextStep)
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      sequenceStatus: 'active',
      nextFollowupAt,
    },
  })
}

/**
 * Skip to the next step in the sequence
 */
export async function skipToNextStep(leadId: string): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  })

  if (!lead) return

  // Increment sequence step
  const newStep = lead.sequenceStep + 1

  // Get the step after that
  const nextStep = await prisma.sequenceStep.findFirst({
    where: {
      stepNumber: { gt: newStep },
      isActive: true,
    },
    orderBy: { stepNumber: 'asc' },
  })

  if (!nextStep) {
    // No more steps
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        sequenceStep: newStep,
        sequenceStatus: 'completed',
        nextFollowupAt: null,
      },
    })
    return
  }

  // Schedule next followup
  const nextFollowupAt = calculateNextFollowup(nextStep)
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      sequenceStep: newStep,
      nextFollowupAt,
    },
  })
}

/**
 * Stop the sequence completely (won/lost)
 */
export async function stopSequence(
  leadId: string,
  reason: string,
  status: 'won' | 'lost'
): Promise<void> {
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      sequenceStatus: 'stopped',
      nextFollowupAt: null,
      status,
      closedAt: new Date(),
      closedReason: reason,
    },
  })
}
