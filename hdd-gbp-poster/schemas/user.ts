import { z } from 'zod'

export const inviteUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255).optional(),
  role: z.enum(['admin', 'editor']).default('editor'),
})

export type InviteUserInput = z.infer<typeof inviteUserSchema>
