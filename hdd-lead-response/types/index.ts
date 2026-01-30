export type UserRole = 'admin' | 'editor'

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'engaged'
  | 'qualified'
  | 'booked'
  | 'won'
  | 'lost'

export type SequenceStatus = 'active' | 'paused' | 'completed' | 'stopped'

export type MessageChannel = 'sms' | 'email'

export type MessageDirection = 'inbound' | 'outbound'

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed'

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: UserRole
}

export interface LeadData {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  phoneNormalized: string | null
  address: string | null
  city: string | null
  projectType: string | null
  projectDescription: string | null
  source: string | null
  status: LeadStatus
  sequenceStatus: SequenceStatus
  sequenceStep: number
  nextFollowupAt: string | null
  lastContactedAt: string | null
  lastRespondedAt: string | null
  consultationBookedAt: string | null
  closedAt: string | null
  closedReason: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface MessageData {
  id: string
  leadId: string
  channel: MessageChannel
  direction: MessageDirection
  subject: string | null
  body: string
  status: MessageStatus
  externalId: string | null
  errorMessage: string | null
  sequenceStep: number | null
  sentAt: string
  createdAt: string
}

export interface SequenceStepData {
  id: string
  stepNumber: number
  name: string
  delayMinutes: number
  smsTemplate: string | null
  emailSubject: string | null
  emailTemplate: string | null
  sendSms: boolean
  sendEmail: boolean
  isActive: boolean
}

export interface SettingData {
  key: string
  value: string
}

export const PROJECT_TYPES = [
  'deck',
  'pergola',
  'railing',
  'sunroom',
  'hot_tub_deck',
  'pool_deck',
  'multi_level_deck',
  'screen_room',
  'other',
] as const

export type ProjectType = (typeof PROJECT_TYPES)[number]

export const LEAD_SOURCES = [
  'website',
  'google',
  'facebook',
  'referral',
  'home_show',
  'yard_sign',
  'phone',
  'other',
] as const

export type LeadSource = (typeof LEAD_SOURCES)[number]

export const CLOSE_REASONS = [
  'booked',
  'not_interested',
  'budget',
  'timeline',
  'competitor',
  'no_response',
  'other',
] as const

export type CloseReason = (typeof CLOSE_REASONS)[number]
