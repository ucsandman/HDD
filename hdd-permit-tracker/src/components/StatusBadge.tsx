import type { PermitStatus, InspectionStatus, InspectionResult } from '../types';
import {
  PERMIT_STATUS_LABELS,
  PERMIT_STATUS_COLORS,
  INSPECTION_STATUS_LABELS,
  INSPECTION_STATUS_COLORS,
  INSPECTION_RESULT_LABELS,
  INSPECTION_RESULT_COLORS,
} from '../types';

interface PermitStatusBadgeProps {
  status: PermitStatus;
}

export function PermitStatusBadge({ status }: PermitStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PERMIT_STATUS_COLORS[status]}`}
    >
      {PERMIT_STATUS_LABELS[status]}
    </span>
  );
}

interface InspectionStatusBadgeProps {
  status: InspectionStatus;
}

export function InspectionStatusBadge({ status }: InspectionStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${INSPECTION_STATUS_COLORS[status]}`}
    >
      {INSPECTION_STATUS_LABELS[status]}
    </span>
  );
}

interface InspectionResultBadgeProps {
  result: InspectionResult;
}

export function InspectionResultBadge({ result }: InspectionResultBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${INSPECTION_RESULT_COLORS[result]}`}
    >
      {INSPECTION_RESULT_LABELS[result]}
    </span>
  );
}
