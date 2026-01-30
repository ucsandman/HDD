import { z } from 'zod'

export const updateFranchiseSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  postsPerWeek: z.number().int().min(1).max(7).optional(),
  preferredPostDays: z.string().max(50).optional(),
  preferredPostTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timezone: z.string().max(50).optional(),
  contextInfo: z.string().max(5000).optional().nullable(),
})

export type UpdateFranchiseInput = z.infer<typeof updateFranchiseSchema>
