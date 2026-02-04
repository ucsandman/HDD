import { useState } from 'react';
import type { CampaignTemplate, Season, CampaignType } from '../types';
import {
  SEASON_LABELS,
  SEASON_COLORS,
  SEASON_ICONS,
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_TYPE_COLORS,
} from '../types';
import { TemplatePreview } from './TemplatePreview';

interface TemplateLibraryProps {
  templates: CampaignTemplate[];
  onUseTemplate: (template: CampaignTemplate) => void;
  onDeleteTemplate?: (id: string) => void;
}

const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter'];
const TYPES: CampaignType[] = ['email', 'sms', 'social', 'gbp'];

export function TemplateLibrary({
  templates,
  onUseTemplate,
  onDeleteTemplate,
}: TemplateLibraryProps) {
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all');
  const [selectedType, setSelectedType] = useState<CampaignType | 'all'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<CampaignTemplate | null>(
    null
  );

  const filteredTemplates = templates.filter((template) => {
    if (selectedSeason !== 'all' && template.season !== selectedSeason)
      return false;
    if (selectedType !== 'all' && template.type !== selectedType) return false;
    return true;
  });

  const groupedBySeason = SEASONS.reduce(
    (acc, season) => {
      acc[season] = filteredTemplates.filter((t) => t.season === season);
      return acc;
    },
    {} as Record<Season, CampaignTemplate[]>
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Season
          </label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value as Season | 'all')}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
          >
            <option value="all">All Seasons</option>
            {SEASONS.map((season) => (
              <option key={season} value={season}>
                {SEASON_ICONS[season]} {SEASON_LABELS[season]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Type
          </label>
          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value as CampaignType | 'all')
            }
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
          >
            <option value="all">All Types</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {CAMPAIGN_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates by Season */}
      {selectedSeason === 'all' ? (
        SEASONS.map((season) => {
          const seasonTemplates = groupedBySeason[season];
          if (seasonTemplates.length === 0) return null;

          return (
            <div key={season} className="mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">{SEASON_ICONS[season]}</span>
                {SEASON_LABELS[season]} Templates
                <span className="text-sm font-normal text-slate-500">
                  ({seasonTemplates.length})
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seasonTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onPreview={() => setPreviewTemplate(template)}
                    onUse={() => onUseTemplate(template)}
                    onDelete={
                      template.id.startsWith('custom-') && onDeleteTemplate
                        ? () => onDeleteTemplate(template.id)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={() => setPreviewTemplate(template)}
              onUse={() => onUseTemplate(template)}
              onDelete={
                template.id.startsWith('custom-') && onDeleteTemplate
                  ? () => onDeleteTemplate(template.id)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No templates match your filters.
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onUseTemplate={(template) => {
            onUseTemplate(template);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: CampaignTemplate;
  onPreview: () => void;
  onUse: () => void;
  onDelete?: () => void;
}

function TemplateCard({ template, onPreview, onUse, onDelete }: TemplateCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-slate-800 line-clamp-2">
          {template.name}
        </h4>
        {template.id.startsWith('custom-') && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
            Custom
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-3">
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

      <p className="text-sm text-slate-600 line-clamp-3 mb-4">
        {template.subject || template.content.substring(0, 100)}...
      </p>

      <div className="flex gap-2">
        <button
          onClick={onPreview}
          className="flex-1 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors"
        >
          Preview
        </button>
        <button
          onClick={onUse}
          className="flex-1 px-3 py-1.5 text-sm bg-[#2F5233] hover:bg-[#234025] text-white rounded transition-colors"
        >
          Use
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
