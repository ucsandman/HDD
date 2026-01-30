import { z } from 'zod'

export const updateSequenceStepSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  delayMinutes: z.number().int().min(0).optional(),
  smsTemplate: z.string().optional().nullable(),
  emailSubject: z.string().max(255).optional().nullable(),
  emailTemplate: z.string().optional().nullable(),
  sendSms: z.boolean().optional(),
  sendEmail: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

export const updateAllSequenceStepsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100).optional(),
    delayMinutes: z.number().int().min(0).optional(),
    smsTemplate: z.string().optional().nullable(),
    emailSubject: z.string().max(255).optional().nullable(),
    emailTemplate: z.string().optional().nullable(),
    sendSms: z.boolean().optional(),
    sendEmail: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
)

export type UpdateSequenceStepInput = z.infer<typeof updateSequenceStepSchema>
export type UpdateAllSequenceStepsInput = z.infer<typeof updateAllSequenceStepsSchema>
