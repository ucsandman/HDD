export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  source: string
  referralCode?: string
  referredBy?: string
  status: 'new' | 'contacted' | 'quoted' | 'qualified' | 'sold' | 'lost'
  value?: number
  createdAt: string
  notes: string
}

export interface RewardEvent {
  id: string
  date: string
  type: 'lead' | 'sold' | 'bonus' | 'payout'
  amount: number
  leadId?: string
  note?: string
}

export interface Referrer {
  id: string
  name: string
  code: string
  phone?: string
  email?: string
  projectDate?: string
  referralCount: number
  totalValue: number
  rewards?: {
    earned: number
    paid: number
    pending: number
    history: RewardEvent[]
  }
}

export interface RewardConfig {
  leadReward: number
  soldReward: number
  bonusThreshold: number
  bonusAmount: number
}

export type DateRange = 'week' | 'month' | 'quarter' | 'all'
