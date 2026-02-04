// NPS Categories
export type NPSCategory = 'promoter' | 'passive' | 'detractor';

// Survey Status
export type SurveyStatus = 'pending' | 'sent' | 'completed' | 'expired';

// Question Types
export type QuestionType = 'nps' | 'rating' | 'text' | 'yesno';

// Survey Question
export interface SurveyQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
}

// Survey Response
export interface SurveyResponse {
  questionId: string;
  value: number | string | boolean;
}

// Survey
export interface Survey {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  projectName: string;
  status: SurveyStatus;
  sentAt: string | null;
  completedAt: string | null;
  responses: SurveyResponse[];
  npsScore: number | null;
  accessCode: string;
  createdAt: string;
  updatedAt: string;
}

// Survey Stats
export interface SurveyStats {
  totalSent: number;
  completed: number;
  responseRate: number;
  npsScore: number | null;
  promoters: number;
  passives: number;
  detractors: number;
}

// Default Survey Questions
export const DEFAULT_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'nps',
    text: 'How likely are you to recommend Hickory Dickory Decks to a friend or family member?',
    type: 'nps',
    required: true,
  },
  {
    id: 'quality',
    text: 'How satisfied are you with the quality of work?',
    type: 'rating',
    required: true,
  },
  {
    id: 'communication',
    text: 'How would you rate our communication throughout the project?',
    type: 'rating',
    required: true,
  },
  {
    id: 'timeline',
    text: 'How satisfied are you with the project timeline?',
    type: 'rating',
    required: true,
  },
  {
    id: 'use_again',
    text: 'Would you use Hickory Dickory Decks again for future projects?',
    type: 'yesno',
    required: true,
  },
  {
    id: 'what_went_well',
    text: 'What did we do well?',
    type: 'text',
    required: false,
  },
  {
    id: 'improvements',
    text: 'How could we improve?',
    type: 'text',
    required: false,
  },
];

// Status Labels
export const STATUS_LABELS: Record<SurveyStatus, string> = {
  pending: 'Pending',
  sent: 'Sent',
  completed: 'Completed',
  expired: 'Expired',
};

// Status Colors
export const STATUS_COLORS: Record<SurveyStatus, string> = {
  pending: 'bg-slate-100 text-slate-700 border-slate-300',
  sent: 'bg-blue-100 text-blue-700 border-blue-300',
  completed: 'bg-green-100 text-green-700 border-green-300',
  expired: 'bg-red-100 text-red-700 border-red-300',
};
