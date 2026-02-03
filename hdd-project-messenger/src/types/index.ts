export type ProjectStatus =
  | 'quoted'
  | 'sold'
  | 'materials_ordered'
  | 'materials_received'
  | 'scheduled'
  | 'in_progress'
  | 'inspection_scheduled'
  | 'complete';

export interface StatusChange {
  id: string;
  fromStatus: ProjectStatus | null;
  toStatus: ProjectStatus;
  changedAt: string;
  notificationSent: boolean;
  notificationType?: 'sms' | 'email' | 'both';
  messageContent?: string;
}

export interface Project {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  projectType: string;
  address: string;
  status: ProjectStatus;
  statusHistory: StatusChange[];
  scheduledStartDate: string | null;
  actualStartDate: string | null;
  estimatedCompletion: string | null;
  actualCompletion: string | null;
  notes: string;
  photos: ProjectPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
}

export interface WeatherDelay {
  projectId: string;
  originalDate: string;
  reason: string;
  notificationSent: boolean;
}

export const PROJECT_TYPES = [
  'Custom Deck',
  'Deck Replacement',
  'Deck Repair',
  'Deck Resurfacing',
  'Pergola',
  'Porch',
  'Gazebo',
  'Railings',
  'Stairs',
  'Screen Room',
  'Sunroom',
  'Other',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  quoted: 'Quoted',
  sold: 'Sold',
  materials_ordered: 'Materials Ordered',
  materials_received: 'Materials Received',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  inspection_scheduled: 'Inspection Scheduled',
  complete: 'Complete',
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  quoted: 'bg-slate-100 text-slate-700 border-slate-300',
  sold: 'bg-blue-100 text-blue-700 border-blue-300',
  materials_ordered: 'bg-purple-100 text-purple-700 border-purple-300',
  materials_received: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  scheduled: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  in_progress: 'bg-orange-100 text-orange-700 border-orange-300',
  inspection_scheduled: 'bg-teal-100 text-teal-700 border-teal-300',
  complete: 'bg-green-100 text-green-700 border-green-300',
};
