import type { QuoteStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';

interface StatusBadgeProps {
  status: QuoteStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
