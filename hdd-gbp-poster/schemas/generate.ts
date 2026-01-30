import { z } from 'zod'

export const generatePostSchema = z.object({
  postType: z.enum(['project_showcase', 'educational', 'seasonal']),
  // Project showcase fields
  projectTypeName: z.string().max(100).optional(),
  neighborhood: z.string().max(100).optional(),
  materials: z.string().max(255).optional(),
  features: z.string().max(500).optional(),
  // Educational fields
  topic: z.string().max(255).optional(),
  // Seasonal fields
  season: z.string().max(50).optional(),
})

export type GeneratePostInput = z.infer<typeof generatePostSchema>
