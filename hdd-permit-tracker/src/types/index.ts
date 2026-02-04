// Permit status workflow
export type PermitStatus =
  | 'not_started'
  | 'application_submitted'
  | 'pending_review'
  | 'revisions_required'
  | 'approved'
  | 'expired';

export type PermitType = 'deck' | 'structural' | 'electrical' | 'other';

export type InspectionType = 'footing' | 'framing' | 'final' | 'electrical';

export type InspectionStatus =
  | 'not_scheduled'
  | 'scheduled'
  | 'completed'
  | 'failed_reschedule';

export type InspectionResult = 'passed' | 'failed' | 'conditional';

export interface PermitStatusUpdate {
  status: PermitStatus;
  timestamp: string;
  notes?: string;
}

export interface PermitDocument {
  id: string;
  name: string;
  type: 'application' | 'approval' | 'plans' | 'inspection_report' | 'other';
  url: string;
  uploadedAt: string;
}

export interface Inspection {
  id: string;
  type: InspectionType;
  status: InspectionStatus;
  scheduledDate?: string;
  completedDate?: string;
  inspector?: string;
  result?: InspectionResult;
  notes?: string;
  corrections?: string[];
}

export interface Permit {
  id: string;
  projectId: string;
  projectAddress: string;
  customerName: string;

  // Permit details
  permitNumber?: string;
  permitType: PermitType;
  municipality: string;

  // Status workflow
  status: PermitStatus;
  statusHistory: PermitStatusUpdate[];

  // Dates
  applicationDate?: string;
  approvalDate?: string;
  expirationDate?: string;

  // Fees
  applicationFee?: number;
  feePaid: boolean;
  feePaymentDate?: string;

  // Documents
  documents: PermitDocument[];

  // Inspections
  inspections: Inspection[];

  // Notes
  notes: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Municipality {
  id: string;
  name: string;
  county: string;
  website?: string;
  permitPortalUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  averageApprovalDays: number;
  fees: {
    deckPermit: number;
    inspectionFee: number;
  };
  requirements: string[];
  notes: string;
}

// Status labels and colors
export const PERMIT_STATUS_LABELS: Record<PermitStatus, string> = {
  not_started: 'Not Started',
  application_submitted: 'Submitted',
  pending_review: 'Under Review',
  revisions_required: 'Revisions Needed',
  approved: 'Approved',
  expired: 'Expired',
};

export const PERMIT_STATUS_COLORS: Record<PermitStatus, string> = {
  not_started: 'bg-slate-100 text-slate-800',
  application_submitted: 'bg-blue-100 text-blue-800',
  pending_review: 'bg-yellow-100 text-yellow-800',
  revisions_required: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
};

export const PERMIT_TYPE_LABELS: Record<PermitType, string> = {
  deck: 'Deck Permit',
  structural: 'Structural Permit',
  electrical: 'Electrical Permit',
  other: 'Other',
};

export const INSPECTION_TYPE_LABELS: Record<InspectionType, string> = {
  footing: 'Footing Inspection',
  framing: 'Framing Inspection',
  final: 'Final Inspection',
  electrical: 'Electrical Inspection',
};

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  not_scheduled: 'Not Scheduled',
  scheduled: 'Scheduled',
  completed: 'Completed',
  failed_reschedule: 'Failed - Reschedule',
};

export const INSPECTION_STATUS_COLORS: Record<InspectionStatus, string> = {
  not_scheduled: 'bg-slate-100 text-slate-800',
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed_reschedule: 'bg-red-100 text-red-800',
};

export const INSPECTION_RESULT_LABELS: Record<InspectionResult, string> = {
  passed: 'Passed',
  failed: 'Failed',
  conditional: 'Conditional Pass',
};

export const INSPECTION_RESULT_COLORS: Record<InspectionResult, string> = {
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  conditional: 'bg-yellow-100 text-yellow-800',
};
