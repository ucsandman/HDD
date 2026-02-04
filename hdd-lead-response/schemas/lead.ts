import { z } from 'zod'

export const createLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional().nullable(),
  email: z.string().email('Invalid email address').max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  projectType: z.string().max(100).optional().nullable(),
  projectDescription: z.string().max(5000).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
  externalId: z.string().max(255).optional().nullable(),
})

export const updateLeadSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().max(100).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  projectType: z.string().max(100).optional().nullable(),
  projectDescription: z.string().max(5000).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  status: z.enum(['new', 'contacted', 'engaged', 'qualified', 'booked', 'won', 'lost']).optional(),
  notes: z.string().max(10000).optional().nullable(),
})

export const closeLeadSchema = z.object({
  reason: z.enum([
    'booked',
    'not_interested',
    'budget',
    'timeline',
    'competitor',
    'no_response',
    'other',
  ]),
  notes: z.string().max(5000).optional().nullable(),
})

export const webhookLeadSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().max(100).optional().nullable(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  projectType: z.string().max(100).optional().nullable(),
  projectDescription: z.string().max(5000).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  externalId: z.string().max(255).optional().nullable(),
})

export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type CloseLeadInput = z.infer<typeof closeLeadSchema>
export type WebhookLeadInput = z.infer<typeof webhookLeadSchema>
