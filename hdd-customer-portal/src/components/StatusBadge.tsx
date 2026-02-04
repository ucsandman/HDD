import type { ProjectStatus } from '../types';
import { PROJECT_STATUSES } from '../types';

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string; ring: string }> = {
  quote_sent: { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-600/20' },
  quote_accepted: { bg: 'bg-purple-100', text: 'text-purple-800', ring: 'ring-purple-600/20' },
  permit_pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-600/20' },
  permit_approved: { bg: 'bg-green-100', text: 'text-green-800', ring: 'ring-green-600/20' },
  materials_ordered: { bg: 'bg-orange-100', text: 'text-orange-800', ring: 'ring-orange-600/20' },
  scheduled: { bg: 'bg-cyan-100', text: 'text-cyan-800', ring: 'ring-cyan-600/20' },
  in_progress: { bg: 'bg-[#2F5233]/10', text: 'text-[#2F5233]', ring: 'ring-[#2F5233]/20' },
  inspection_scheduled: { bg: 'bg-indigo-100', text: 'text-indigo-800', ring: 'ring-indigo-600/20' },
  complete: { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-600/20' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusInfo = PROJECT_STATUSES.find(s => s.value === status);
  const colors = STATUS_COLORS[status];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ring-1 ring-inset ${colors.bg} ${colors.text} ${colors.ring} ${sizeClasses[size]}`}
    >
      {statusInfo?.label || status}
    </span>
  );
}
