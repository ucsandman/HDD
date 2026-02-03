import { useState } from 'react';
import type { Project, ProjectStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';
import { MessageCard } from './MessageCard';
import { formatDate, formatDateTime, formatPhoneForDisplay } from '../utils/helpers';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onUpdateStatus: (newStatus: ProjectStatus, additionalData?: { date?: string }) => void;
  onMarkNotificationSent: (statusChangeId: string, type: 'sms' | 'email' | 'both') => void;
  onDelete: () => void;
}

export function ProjectDetail({
  project,
  onClose,
  onUpdateStatus,
  onMarkNotificationSent,
  onDelete,
}: ProjectDetailProps) {
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState<ProjectStatus>(project.status);
  const [statusDate, setStatusDate] = useState('');

  const handleStatusUpdate = () => {
    if (newStatus !== project.status) {
      onUpdateStatus(newStatus, statusDate ? { date: formatDate(statusDate) } : undefined);
      setShowStatusUpdate(false);
      setStatusDate('');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      onDelete();
      onClose();
    }
  };

  const pendingNotifications = project.statusHistory.filter((sh) => !sh.notificationSent);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {project.customerName}
            </h2>
            <p className="text-slate-600 mt-1">{project.projectType}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Info */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">
              Project Information
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Status:</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                    STATUS_COLORS[project.status]
                  }`}
                >
                  {STATUS_LABELS[project.status]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Phone:</span>
                <span className="text-sm text-slate-800">
                  {formatPhoneForDisplay(project.customerPhone)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Email:</span>
                <span className="text-sm text-slate-800">{project.customerEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Address:</span>
                <span className="text-sm text-slate-800">{project.address}</span>
              </div>
              {project.scheduledStartDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Scheduled Start:</span>
                  <span className="text-sm text-slate-800">
                    {formatDate(project.scheduledStartDate)}
                  </span>
                </div>
              )}
              {project.estimatedCompletion && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Est. Completion:</span>
                  <span className="text-sm text-slate-800">
                    {formatDate(project.estimatedCompletion)}
                  </span>
                </div>
              )}
              {project.notes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Notes:</span>
                  <p className="text-sm text-slate-800 mt-1">{project.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-800">Update Status</h3>
              <button
                onClick={() => setShowStatusUpdate(!showStatusUpdate)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
              >
                {showStatusUpdate ? 'Cancel' : 'Change Status'}
              </button>
            </div>

            {showStatusUpdate && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="quoted">Quoted</option>
                    <option value="sold">Sold</option>
                    <option value="materials_ordered">Materials Ordered</option>
                    <option value="materials_received">Materials Received</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="inspection_scheduled">Inspection Scheduled</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>

                {(newStatus === 'materials_ordered' ||
                  newStatus === 'scheduled' ||
                  newStatus === 'inspection_scheduled') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date for Message (Optional)
                    </label>
                    <input
                      type="date"
                      value={statusDate}
                      onChange={(e) => setStatusDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <button
                  onClick={handleStatusUpdate}
                  disabled={newStatus === project.status}
                  className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status & Generate Message
                </button>
              </div>
            )}
          </div>

          {/* Pending Notifications */}
          {pendingNotifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                Pending Notifications ({pendingNotifications.length})
              </h3>
              <div className="space-y-3">
                {pendingNotifications.map((statusChange) => {
                  const messageData = statusChange.messageContent
                    ? JSON.parse(statusChange.messageContent)
                    : null;

                  return (
                    <div key={statusChange.id} className="space-y-2">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-orange-900">
                          Status change: {STATUS_LABELS[statusChange.fromStatus || 'quoted']} →{' '}
                          {STATUS_LABELS[statusChange.toStatus]}
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          {formatDateTime(statusChange.changedAt)}
                        </p>
                      </div>

                      {messageData && (
                        <>
                          <MessageCard
                            title="SMS Message"
                            content={messageData.sms}
                            onMarkSent={() => onMarkNotificationSent(statusChange.id, 'sms')}
                          />

                          {messageData.email && (
                            <MessageCard
                              title="Email Message"
                              content={messageData.email.body}
                              secondaryContent={{
                                label: 'Subject',
                                content: messageData.email.subject,
                              }}
                              onMarkSent={() => onMarkNotificationSent(statusChange.id, 'email')}
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status History */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Status History</h3>
            <div className="space-y-2">
              {project.statusHistory
                .slice()
                .reverse()
                .map((statusChange) => (
                  <div
                    key={statusChange.id}
                    className="bg-slate-50 rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {statusChange.fromStatus
                            ? `${STATUS_LABELS[statusChange.fromStatus]} → `
                            : ''}
                          {STATUS_LABELS[statusChange.toStatus]}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {formatDateTime(statusChange.changedAt)}
                        </p>
                      </div>
                      {statusChange.notificationSent && (
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                          {statusChange.notificationType?.toUpperCase()} Sent
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
          >
            Delete Project
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
