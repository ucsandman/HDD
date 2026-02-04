import type { CampaignTemplate } from '../types';
import {
  SEASON_LABELS,
  SEASON_COLORS,
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_TYPE_COLORS,
} from '../types';

interface TemplatePreviewProps {
  template: CampaignTemplate;
  onClose: () => void;
  onUseTemplate: (template: CampaignTemplate) => void;
}

export function TemplatePreview({
  template,
  onClose,
  onUseTemplate,
}: TemplatePreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {template.name}
              </h2>
              <div className="flex gap-2 mt-2">
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
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {template.subject && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject Line
              </label>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm">
                {template.subject}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Content
            </label>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm whitespace-pre-wrap font-mono">
              {template.content}
            </div>
          </div>

          {template.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onUseTemplate(template)}
            className="px-6 py-2 bg-[#2F5233] hover:bg-[#234025] text-white font-medium rounded-lg transition-colors"
          >
            Create Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
