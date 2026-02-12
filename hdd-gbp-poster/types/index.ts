export type UserRole = 'admin' | 'editor'

export type PostStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed'

export type PostType = 'project_showcase' | 'educational' | 'seasonal'

export interface BlogData {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: string
  metaTitle: string | null
  metaDescription: string | null
  keywords: string[]
  generatedBy: GeneratedBy | null
  createdAt: string
  updatedAt: string
}

export type CallToActionType =
  | 'LEARN_MORE'
  | 'CALL'
  | 'BOOK'
  | 'ORDER'
  | 'SHOP'
  | 'SIGN_UP'
  | 'GET_OFFER'

export type GeneratedBy = 'ai' | 'manual'

export interface SessionUser {
  id: string
  email: string
  name: string | null
  franchiseId: string
  role: UserRole
}

export interface FranchiseSettings {
  id: string
  name: string
  slug: string
  postsPerWeek: number
  preferredPostDays: string
  preferredPostTime: string
  timezone: string
  contextInfo: string | null
  googleConnected: boolean
}

export interface PostData {
  id: string
  postType: PostType
  title: string | null
  body: string
  callToAction: CallToActionType | null
  callToActionUrl: string | null
  status: PostStatus
  scheduledFor: string | null
  publishedAt: string | null
  googlePostUrl: string | null
  publishError: string | null
  generatedBy: GeneratedBy | null
  createdAt: string
  updatedAt: string
  images: ImageData[]
}

export interface ImageData {
  id: string
  url: string
  filename: string | null
  altText: string | null
  projectType: string | null
  tags: string[]
  createdAt: string
}

export interface GeneratePostParams {
  postType: PostType
  // Project showcase fields
  projectTypeName?: string
  neighborhood?: string
  materials?: string
  features?: string
  // Educational fields
  topic?: string
  // Seasonal fields
  season?: string
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
  'other'
] as const

export type ProjectType = typeof PROJECT_TYPES[number]

export const EDUCATIONAL_TOPICS = [
  'Composite vs. wood decking: What Cincinnati homeowners should know',
  'How long does a composite deck last?',
  'Best decking materials for Ohio weather',
  'What to expect during the deck building process',
  'How to plan your deck layout',
  'Deck features that add the most value to your home',
  'Pool deck considerations: Materials that stay cool',
  'Hot tub deck requirements and ideas',
  'Multi-level deck designs for sloped yards',
  'Deck lighting options and benefits',
  'Railing choices: Cable, glass, composite, and aluminum',
  'Pergola vs. gazebo: Which is right for your backyard?',
  'When is the best time of year to build a deck?',
  'How to prepare your yard for deck construction',
  'Understanding deck permits in Ohio',
  'Deck maintenance: Composite vs. wood comparison',
  'Adding privacy to your deck: Screen and fence options',
  'Choosing deck colors that complement your home',
  'What questions to ask a deck contractor',
  'Signs your old deck needs replacement'
] as const

export const SEASONS = [
  'Spring',
  'Summer',
  'Fall',
  'Winter'
] as const
