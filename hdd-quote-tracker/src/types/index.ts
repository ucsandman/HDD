export type QuoteStatus =
  | 'sent'
  | 'viewed'
  | 'followup1'
  | 'followup2'
  | 'followup3'
  | 'closed_won'
  | 'closed_lost';

export interface FollowUpEvent {
  id: string;
  date: string;
  type: 'sms' | 'email' | 'call';
  message: string;
  response?: string;
}

export interface Quote {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  projectType: string;
  squareFootage: number;
  material: string;
  estimatedTotal: number;
  status: QuoteStatus;
  createdAt: string;
  lastFollowUp: string | null;
  nextFollowUp: string | null;
  notes: string;
  followUpHistory: FollowUpEvent[];
}

export const PROJECT_TYPES = [
  'Deck',
  'Pergola',
  'Pool Surround',
  'Gazebo',
  'Patio Cover',
  'Railing Only',
] as const;

export const MATERIALS = [
  'Trex Select',
  'Trex Enhance',
  'Trex Transcend',
  'TimberTech PRO',
  'TimberTech AZEK',
  'Pressure-Treated',
  'Cedar',
] as const;

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  sent: 'Sent',
  viewed: 'Viewed',
  followup1: 'Follow-up 1',
  followup2: 'Follow-up 2',
  followup3: 'Follow-up 3',
  closed_won: 'Closed (Won)',
  closed_lost: 'Closed (Lost)',
};

export const STATUS_COLORS: Record<QuoteStatus, string> = {
  sent: 'bg-blue-100 text-blue-800',
  viewed: 'bg-purple-100 text-purple-800',
  followup1: 'bg-yellow-100 text-yellow-800',
  followup2: 'bg-orange-100 text-orange-800',
  followup3: 'bg-red-100 text-red-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-gray-100 text-gray-800',
};
