import type { Permit, Municipality } from '../types';
import { isExpiringSoon, isPendingTooLong } from '../utils/dates';

interface StatsBarProps {
  permits: Permit[];
  municipalities: Municipality[];
}

export function StatsBar({ permits, municipalities }: StatsBarProps) {
  const activePermits = permits.filter(
    (p) =>
      p.status !== 'approved' &&
      p.status !== 'expired' &&
      p.status !== 'not_started'
  );

  const pendingReview = permits.filter(
    (p) => p.status === 'pending_review' || p.status === 'application_submitted'
  );

  const needsAttention = permits.filter(
    (p) =>
      isExpiringSoon(p.expirationDate) ||
      isPendingTooLong(p.applicationDate, p.status) ||
      p.status === 'revisions_required'
  );

  const upcomingInspections = permits.reduce((count, permit) => {
    return (
      count +
      permit.inspections.filter((i) => i.status === 'scheduled').length
    );
  }, 0);

  const stats = [
    {
      label: 'Total Permits',
      value: permits.length,
      color: 'bg-slate-100 text-slate-800',
    },
    {
      label: 'In Progress',
      value: activePermits.length,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      label: 'Pending Review',
      value: pendingReview.length,
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      label: 'Needs Attention',
      value: needsAttention.length,
      color: needsAttention.length > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800',
    },
    {
      label: 'Scheduled Inspections',
      value: upcomingInspections,
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
        >
          <div className="text-sm text-slate-600 mb-1">{stat.label}</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {stat.value}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.color}`}
            >
              {stat.value === 1 ? 'permit' : 'permits'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
