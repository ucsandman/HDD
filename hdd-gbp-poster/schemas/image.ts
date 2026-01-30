import { z } from 'zod'

export const createImageSchema = z.object({
  url: z.string().url().max(500),
  filename: z.string().max(255).optional(),
  altText: z.string().max(255).optional(),
  projectType: z.string().max(100).optional(),
  tags: z.array(z.string().max(255)).optional(),
})

export const updateImageSchema = z.object({
  altText: z.string().max(255).optional().nullable(),
  projectType: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(255)).optional(),
})

export type CreateImageInput = z.infer<typeof createImageSchema>
export type UpdateImageInput = z.infer<typeof updateImageSchema>
