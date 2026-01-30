import { z } from 'zod'

export const updateSettingsSchema = z.object({
  businessName: z.string().min(1).max(255).optional(),
  businessPhone: z.string().max(50).optional(),
  ownerName: z.string().max(100).optional(),
  bookingLink: z.string().url().max(500).optional(),
  websiteUrl: z.string().url().max(500).optional(),
  googleReviewUrl: z.string().url().max(500).optional(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>

export const SETTING_KEYS = [
  'businessName',
  'businessPhone',
  'ownerName',
  'bookingLink',
  'websiteUrl',
  'googleReviewUrl',
] as const

export type SettingKey = typeof SETTING_KEYS[number]
