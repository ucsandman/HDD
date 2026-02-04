import type { Permit, PermitStatus, Municipality } from '../types';
import { PERMIT_STATUS_LABELS, PERMIT_TYPE_LABELS } from '../types';
import { PermitStatusBadge } from './StatusBadge';
import { formatDate, isExpiringSoon, isPendingTooLong } from '../utils/dates';
import { exportPermitsCSV } from '../utils/storage';

interface PermitListProps {
  permits: Permit[];
  statusFilter: PermitStatus | 'all';
  onStatusFilterChange: (status: PermitStatus | 'all') => void;
  onViewPermit: (permit: Permit) => void;
  getMunicipalityById: (id: string) => Municipality | undefined;
}

const STATUS_OPTIONS: (PermitStatus | 'all')[] = [
  'all',
  'not_started',
  'application_submitted',
  'pending_review',
  'revisions_required',
  'approved',
  'expired',
];

export function PermitList({
  permits,
  statusFilter,
  onStatusFilterChange,
  onViewPermit,
  getMunicipalityById,
}: PermitListProps) {
  const getWarningMessage = (permit: Permit): string | null => {
    if (isExpiringSoon(permit.expirationDate)) {
      return 'Expiring soon';
    }
    if (isPendingTooLong(permit.applicationDate, permit.status)) {
      return 'Pending > 14 days';
    }
    if (permit.status === 'revisions_required') {
      return 'Revisions needed';
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm text-slate-600">
            Filter:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) =>
              onStatusFilterChange(e.target.value as PermitStatus | 'all')
            }
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Statuses' : PERMIT_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => exportPermitsCSV(permits)}
          disabled={permits.length === 0}
          className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {permits.length === 0 ? (
        <div className="p-12 text-center">
          <svg
            className="w-12 h-12 mx-auto text-slate-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No permits found
          </h3>
          <p className="text-slate-600">
            {statusFilter === 'all'
              ? 'Create your first permit to get started.'
              : 'No permits match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {permits.map((permit) => {
            const municipality = getMunicipalityById(permit.municipality);
            const warning = getWarningMessage(permit);
            const scheduledInspections = permit.inspections.filter(
              (i) => i.status === 'scheduled'
            ).length;

            return (
              <div
                key={permit.id}
                onClick={() => onViewPermit(permit)}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900 truncate">
                        {permit.projectAddress}
                      </h3>
                      <PermitStatusBadge status={permit.status} />
                      {warning && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {warning}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                      <span>{permit.customerName}</span>
                      <span className="text-slate-400">|</span>
                      <span>{municipality?.name || permit.municipality}</span>
                      <span className="text-slate-400">|</span>
                      <span>{PERMIT_TYPE_LABELS[permit.permitType]}</span>
                    </div>
                    {permit.permitNumber && (
                      <div className="text-sm text-slate-500 mt-1">
                        Permit #{permit.permitNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 text-sm text-slate-600">
                    {permit.applicationDate && (
                      <span>Applied: {formatDate(permit.applicationDate)}</span>
                    )}
                    {scheduledInspections > 0 && (
                      <span className="text-purple-600 font-medium">
                        {scheduledInspections} inspection{scheduledInspections > 1 ? 's' : ''} scheduled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
