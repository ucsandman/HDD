import { z } from 'zod'

export const postTypeSchema = z.enum(['project_showcase', 'educational', 'seasonal'])

export const postStatusSchema = z.enum([
  'draft',
  'pending_review',
  'approved',
  'scheduled',
  'published',
  'failed'
])

export const callToActionSchema = z.enum([
  'LEARN_MORE',
  'CALL',
  'BOOK',
  'ORDER',
  'SHOP',
  'SIGN_UP',
  'GET_OFFER'
])

export const createPostSchema = z.object({
  postType: postTypeSchema,
  title: z.string().max(255).optional(),
  body: z.string().min(1).max(1500),
  callToAction: callToActionSchema.optional(),
  callToActionUrl: z.string().url().max(500).optional(),
  imageIds: z.array(z.string().uuid()).max(10).optional(),
  generatedBy: z.enum(['ai', 'manual']).optional(),
  generationPrompt: z.string().optional(),
})

export const updatePostSchema = z.object({
  postType: postTypeSchema.optional(),
  title: z.string().max(255).optional().nullable(),
  body: z.string().min(1).max(1500).optional(),
  callToAction: callToActionSchema.optional().nullable(),
  callToActionUrl: z.string().url().max(500).optional().nullable(),
  imageIds: z.array(z.string().uuid()).max(10).optional(),
  status: postStatusSchema.optional(),
})

export const approvePostSchema = z.object({
  scheduledFor: z.string().datetime().optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type ApprovePostInput = z.infer<typeof approvePostSchema>
