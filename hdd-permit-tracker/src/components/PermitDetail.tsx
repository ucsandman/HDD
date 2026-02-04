import { useState } from 'react';
import type {
  Permit,
  PermitStatus,
  Municipality,
  Inspection,
  PermitDocument,
} from '../types';
import {
  PERMIT_STATUS_LABELS,
  PERMIT_TYPE_LABELS,
  INSPECTION_TYPE_LABELS,
} from '../types';
import { PermitStatusBadge, InspectionStatusBadge, InspectionResultBadge } from './StatusBadge';
import { InspectionForm } from './InspectionForm';
import {
  formatDate,
  getDaysUntil,
  getDaysSince,
  isExpiringSoon,
  calculateEstimatedApproval,
} from '../utils/dates';

interface PermitDetailProps {
  permit: Permit;
  municipality: Municipality | undefined;
  onUpdatePermit: (updates: Partial<Permit>) => void;
  onUpdateStatus: (status: PermitStatus, notes?: string) => void;
  onDelete: () => void;
  onAddInspection: (inspection: Omit<Inspection, 'id'>) => void;
  onUpdateInspection: (inspectionId: string, updates: Partial<Inspection>) => void;
  onDeleteInspection: (inspectionId: string) => void;
  onAddDocument: (document: Omit<PermitDocument, 'id' | 'uploadedAt'>) => void;
  onDeleteDocument: (documentId: string) => void;
  onBack: () => void;
}

type Tab = 'details' | 'inspections' | 'documents' | 'history';

export function PermitDetail({
  permit,
  municipality,
  onUpdateStatus,
  onDelete,
  onAddInspection,
  onUpdateInspection,
  onDeleteInspection,
  onBack,
}: PermitDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState<PermitStatus>(permit.status);

  const daysUntilExpiration = getDaysUntil(permit.expirationDate);
  const daysSinceApplication = getDaysSince(permit.applicationDate);
  const estimatedApproval =
    municipality && permit.applicationDate
      ? calculateEstimatedApproval(
          permit.applicationDate,
          municipality.averageApprovalDays
        )
      : null;

  const handleStatusUpdate = () => {
    onUpdateStatus(newStatus, statusNotes || undefined);
    setShowStatusModal(false);
    setStatusNotes('');
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'details', label: 'Details' },
    { id: 'inspections', label: 'Inspections', count: permit.inspections.length },
    { id: 'documents', label: 'Documents', count: permit.documents.length },
    { id: 'history', label: 'History', count: permit.statusHistory.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {permit.projectAddress}
              </h2>
              <PermitStatusBadge status={permit.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span>{permit.customerName}</span>
              <span className="text-slate-400">|</span>
              <span>{municipality?.name || permit.municipality}</span>
              <span className="text-slate-400">|</span>
              <span>{PERMIT_TYPE_LABELS[permit.permitType]}</span>
              {permit.permitNumber && (
                <>
                  <span className="text-slate-400">|</span>
                  <span>Permit #{permit.permitNumber}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2F5233] hover:bg-[#234025] rounded-lg transition-colors"
            >
              Update Status
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div>
            <div className="text-sm text-slate-600">Applied</div>
            <div className="font-medium text-slate-900">
              {permit.applicationDate ? formatDate(permit.applicationDate) : '-'}
            </div>
            {daysSinceApplication !== null && (
              <div className="text-xs text-slate-500">
                {daysSinceApplication} days ago
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-slate-600">Est. Approval</div>
            <div className="font-medium text-slate-900">
              {estimatedApproval ? formatDate(estimatedApproval) : '-'}
            </div>
            {estimatedApproval && (
              <div className="text-xs text-slate-500">
                Based on {municipality?.averageApprovalDays} day avg
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-slate-600">Expires</div>
            <div
              className={`font-medium ${
                isExpiringSoon(permit.expirationDate)
                  ? 'text-amber-600'
                  : daysUntilExpiration !== null && daysUntilExpiration < 0
                  ? 'text-red-600'
                  : 'text-slate-900'
              }`}
            >
              {permit.expirationDate ? formatDate(permit.expirationDate) : '-'}
            </div>
            {daysUntilExpiration !== null && (
              <div className="text-xs text-slate-500">
                {daysUntilExpiration > 0
                  ? `${daysUntilExpiration} days remaining`
                  : `Expired ${Math.abs(daysUntilExpiration)} days ago`}
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-slate-600">Fee</div>
            <div className="font-medium text-slate-900">
              {permit.applicationFee
                ? `$${permit.applicationFee.toFixed(2)}`
                : '-'}
            </div>
            <div
              className={`text-xs ${
                permit.feePaid ? 'text-green-600' : 'text-amber-600'
              }`}
            >
              {permit.feePaid ? 'Paid' : 'Unpaid'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#2F5233] text-[#2F5233]'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-[#2F5233]/10 text-[#2F5233]'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <DetailsTab permit={permit} municipality={municipality} />
          )}

          {activeTab === 'inspections' && (
            <InspectionsTab
              inspections={permit.inspections}
              onAddInspection={() => setShowInspectionForm(true)}
              onUpdateInspection={onUpdateInspection}
              onDeleteInspection={onDeleteInspection}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab documents={permit.documents} />
          )}

          {activeTab === 'history' && (
            <HistoryTab statusHistory={permit.statusHistory} />
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Update Permit Status
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as PermitStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                >
                  {Object.entries(PERMIT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent resize-none"
                  placeholder="Add notes about this status change..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2F5233] hover:bg-[#234025] rounded-lg transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Form Modal */}
      {showInspectionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <InspectionForm
              onSubmit={(inspection) => {
                onAddInspection(inspection);
                setShowInspectionForm(false);
              }}
              onCancel={() => setShowInspectionForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsTab({
  permit,
  municipality,
}: {
  permit: Permit;
  municipality: Municipality | undefined;
}) {
  return (
    <div className="space-y-6">
      {/* Contact Info */}
      {(permit.contactName || permit.contactPhone || permit.contactEmail) && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">
            Municipality Contact
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {permit.contactName && (
              <div>
                <span className="text-slate-600">Name:</span>{' '}
                <span className="font-medium">{permit.contactName}</span>
              </div>
            )}
            {permit.contactPhone && (
              <div>
                <span className="text-slate-600">Phone:</span>{' '}
                <a
                  href={`tel:${permit.contactPhone}`}
                  className="font-medium text-[#2F5233] hover:underline"
                >
                  {permit.contactPhone}
                </a>
              </div>
            )}
            {permit.contactEmail && (
              <div>
                <span className="text-slate-600">Email:</span>{' '}
                <a
                  href={`mailto:${permit.contactEmail}`}
                  className="font-medium text-[#2F5233] hover:underline"
                >
                  {permit.contactEmail}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Municipality Info */}
      {municipality && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">
            Municipality Information
          </h4>
          <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-600">Website:</span>{' '}
                {municipality.website ? (
                  <a
                    href={municipality.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#2F5233] hover:underline"
                  >
                    {municipality.website}
                  </a>
                ) : (
                  '-'
                )}
              </div>
              {municipality.permitPortalUrl && (
                <div>
                  <span className="text-slate-600">Permit Portal:</span>{' '}
                  <a
                    href={municipality.permitPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#2F5233] hover:underline"
                  >
                    Open Portal
                  </a>
                </div>
              )}
              <div>
                <span className="text-slate-600">Phone:</span>{' '}
                <span className="font-medium">
                  {municipality.contactPhone || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Avg. Approval:</span>{' '}
                <span className="font-medium">
                  {municipality.averageApprovalDays} days
                </span>
              </div>
            </div>

            {municipality.requirements.length > 0 && (
              <div>
                <span className="text-slate-600">Requirements:</span>
                <ul className="mt-1 list-disc list-inside text-slate-700">
                  {municipality.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {municipality.notes && (
              <div>
                <span className="text-slate-600">Notes:</span>{' '}
                <span className="text-slate-700">{municipality.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permit Notes */}
      {permit.notes && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Notes</h4>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {permit.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function InspectionsTab({
  inspections,
  onAddInspection,
  onUpdateInspection,
  onDeleteInspection,
}: {
  inspections: Inspection[];
  onAddInspection: () => void;
  onUpdateInspection: (inspectionId: string, updates: Partial<Inspection>) => void;
  onDeleteInspection: (inspectionId: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-900">Inspections</h4>
        <button
          onClick={onAddInspection}
          className="px-3 py-1.5 text-sm font-medium text-[#2F5233] hover:bg-[#2F5233]/10 rounded-lg transition-colors flex items-center gap-1"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Inspection
        </button>
      </div>

      {inspections.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No inspections scheduled yet
        </div>
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <div
              key={inspection.id}
              className="border border-slate-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">
                      {INSPECTION_TYPE_LABELS[inspection.type]}
                    </span>
                    <InspectionStatusBadge status={inspection.status} />
                    {inspection.result && (
                      <InspectionResultBadge result={inspection.result} />
                    )}
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    {inspection.scheduledDate && (
                      <div>Scheduled: {formatDate(inspection.scheduledDate)}</div>
                    )}
                    {inspection.completedDate && (
                      <div>Completed: {formatDate(inspection.completedDate)}</div>
                    )}
                    {inspection.inspector && (
                      <div>Inspector: {inspection.inspector}</div>
                    )}
                    {inspection.notes && <div>Notes: {inspection.notes}</div>}
                    {inspection.corrections && inspection.corrections.length > 0 && (
                      <div>
                        Corrections needed:
                        <ul className="list-disc list-inside ml-2">
                          {inspection.corrections.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {inspection.status === 'scheduled' && (
                    <button
                      onClick={() =>
                        onUpdateInspection(inspection.id, {
                          status: 'completed',
                          completedDate: new Date().toISOString(),
                        })
                      }
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      Mark Complete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this inspection?')) {
                        onDeleteInspection(inspection.id);
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ documents }: { documents: PermitDocument[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-slate-900">Documents</h4>
        <span className="text-xs text-slate-500">
          Document upload coming soon
        </span>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          No documents attached yet
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-slate-400"
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
                <div>
                  <div className="font-medium text-slate-900">{doc.name}</div>
                  <div className="text-xs text-slate-500">
                    {doc.type} • {formatDate(doc.uploadedAt)}
                  </div>
                </div>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#2F5233] hover:underline"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTab({
  statusHistory,
}: {
  statusHistory: Permit['statusHistory'];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-900 mb-4">
        Status History
      </h4>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

        <div className="space-y-4">
          {[...statusHistory].reverse().map((entry, index) => (
            <div key={index} className="relative flex gap-4 pl-10">
              <div className="absolute left-2.5 w-3 h-3 bg-white border-2 border-[#2F5233] rounded-full" />
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <PermitStatusBadge status={entry.status} />
                  <span className="text-sm text-slate-500">
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
                {entry.notes && (
                  <p className="text-sm text-slate-600 mt-1">{entry.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
