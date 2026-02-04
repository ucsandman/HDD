import { useState } from 'react';
import type { Campaign, CampaignTemplate, Season } from '../types';
import {
  SEASON_LABELS,
  SEASON_COLORS,
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_TYPE_COLORS,
} from '../types';

// Get default date (tomorrow) for scheduling
function getDefaultDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

interface CampaignFormProps {
  template: CampaignTemplate;
  onSubmit: (campaign: Omit<Campaign, 'id'>) => void;
  onCancel: () => void;
}

export function CampaignForm({ template, onSubmit, onCancel }: CampaignFormProps) {
  const [name, setName] = useState(template.name);
  const [scheduledDate, setScheduledDate] = useState(getDefaultDate);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    if (!scheduledDate) {
      alert('Please select a scheduled date');
      return;
    }

    onSubmit({
      templateId: template.id,
      name: name.trim(),
      season: template.season as Season,
      scheduledDate,
      status,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              Create Campaign
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              From template: {template.name}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Template Info */}
            <div className="flex gap-2 mb-4">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  SEASON_COLORS[template.season]
                }`}
              >
                {SEASON_LABELS[template.season]}
              </span>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  CAMPAIGN_TYPE_COLORS[template.type]
                }`}
              >
                {CAMPAIGN_TYPE_LABELS[template.type]}
              </span>
            </div>

            {/* Campaign Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                placeholder="e.g., Spring 2024 Email Blast"
                required
              />
            </div>

            {/* Scheduled Date */}
            <div>
              <label
                htmlFor="scheduledDate"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Scheduled Date *
              </label>
              <input
                type="date"
                id="scheduledDate"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                required
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Initial Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={status === 'draft'}
                    onChange={(e) => setStatus(e.target.value as 'draft')}
                    className="text-[#2F5233] focus:ring-[#2F5233]"
                  />
                  <span className="text-sm text-slate-700">Save as Draft</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value="scheduled"
                    checked={status === 'scheduled'}
                    onChange={(e) => setStatus(e.target.value as 'scheduled')}
                    className="text-[#2F5233] focus:ring-[#2F5233]"
                  />
                  <span className="text-sm text-slate-700">Schedule Now</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent resize-none"
                placeholder="Any additional notes about this campaign..."
              />
            </div>

            {/* Template Preview */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Template Content Preview
              </label>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600 max-h-32 overflow-y-auto whitespace-pre-wrap">
                {template.subject && (
                  <div className="font-medium mb-2">
                    Subject: {template.subject}
                  </div>
                )}
                {template.content.substring(0, 200)}...
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#2F5233] hover:bg-[#234025] text-white font-medium rounded-lg transition-colors"
            >
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
