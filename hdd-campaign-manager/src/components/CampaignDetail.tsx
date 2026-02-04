import { useState } from 'react';
import type { Campaign, CampaignTemplate, CampaignStatus } from '../types';
import {
  SEASON_LABELS,
  SEASON_COLORS,
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_TYPE_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../types';

interface CampaignDetailProps {
  campaign: Campaign;
  template: CampaignTemplate | undefined;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Campaign>) => void;
  onMarkAsSent: (id: string) => void;
  onMarkAsCompleted: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CampaignDetail({
  campaign,
  template,
  onClose,
  onUpdate,
  onMarkAsSent,
  onMarkAsCompleted,
  onDelete,
}: CampaignDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(campaign.name);
  const [editDate, setEditDate] = useState(campaign.scheduledDate);
  const [editNotes, setEditNotes] = useState(campaign.notes);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    onUpdate(campaign.id, {
      name: editName.trim(),
      scheduledDate: editDate,
      notes: editNotes.trim(),
    });
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: CampaignStatus) => {
    if (newStatus === 'sent') {
      onMarkAsSent(campaign.id);
    } else if (newStatus === 'completed') {
      onMarkAsCompleted(campaign.id);
    } else {
      onUpdate(campaign.id, { status: newStatus });
    }
  };

  const handleCopyContent = () => {
    if (!template) return;
    const content = template.subject
      ? `Subject: ${template.subject}\n\n${template.content}`
      : template.content;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-xl font-semibold text-slate-800 w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-[#2F5233]"
                />
              ) : (
                <h2 className="text-xl font-semibold text-slate-800">
                  {campaign.name}
                </h2>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    SEASON_COLORS[campaign.season]
                  }`}
                >
                  {SEASON_LABELS[campaign.season]}
                </span>
                {template && (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      CAMPAIGN_TYPE_COLORS[template.type]
                    }`}
                  >
                    {CAMPAIGN_TYPE_LABELS[template.type]}
                  </span>
                )}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    STATUS_COLORS[campaign.status]
                  }`}
                >
                  {STATUS_LABELS[campaign.status]}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none ml-4"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Scheduled Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Scheduled Date
            </label>
            {isEditing ? (
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233]"
              />
            ) : (
              <div className="text-slate-800">{formatDate(campaign.scheduledDate)}</div>
            )}
          </div>

          {/* Sent At */}
          {campaign.sentAt && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Sent At
              </label>
              <div className="text-slate-800">
                {new Date(campaign.sentAt).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            {isEditing ? (
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] resize-none"
              />
            ) : (
              <div className="text-slate-600">
                {campaign.notes || 'No notes'}
              </div>
            )}
          </div>

          {/* Template Content */}
          {template && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Campaign Content
                </label>
                <button
                  onClick={handleCopyContent}
                  className="text-sm text-[#2F5233] hover:text-[#234025]"
                >
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>
              </div>
              {template.subject && (
                <div className="p-3 bg-slate-50 rounded-t-lg border border-b-0 border-slate-200">
                  <span className="text-sm font-medium text-slate-700">Subject: </span>
                  <span className="text-sm text-slate-800">{template.subject}</span>
                </div>
              )}
              <div
                className={`p-4 bg-slate-50 border border-slate-200 text-sm whitespace-pre-wrap ${
                  template.subject ? 'rounded-b-lg' : 'rounded-lg'
                }`}
              >
                {template.content}
              </div>
            </div>
          )}

          {/* Status Actions */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Update Status
            </label>
            <div className="flex flex-wrap gap-2">
              {campaign.status === 'draft' && (
                <button
                  onClick={() => handleStatusChange('scheduled')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Schedule
                </button>
              )}
              {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                <button
                  onClick={() => handleStatusChange('sent')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
                >
                  Mark as Sent
                </button>
              )}
              {campaign.status === 'sent' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  Mark as Completed
                </button>
              )}
              {campaign.status !== 'draft' && (
                <button
                  onClick={() => handleStatusChange('draft')}
                  className="px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
                >
                  Revert to Draft
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-between">
          <button
            onClick={() => onDelete(campaign.id)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete Campaign
          </button>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-[#2F5233] hover:bg-[#234025] text-white font-medium rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-[#2F5233] hover:bg-[#234025] text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
