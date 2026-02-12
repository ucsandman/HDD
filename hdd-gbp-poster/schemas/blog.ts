import { z } from 'zod'

export const generateBlogSchema = z.object({
  topic: z.string().min(10).max(255),
  neighborhood: z.string().max(100).optional(),
  materials: z.string().max(255).optional(),
  targetKeywords: z.array(z.string().max(100)).optional(),
})

export type GenerateBlogInput = z.infer<typeof generateBlogSchema>
