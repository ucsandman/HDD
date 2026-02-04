import { useState } from 'react';
import type { Campaign, CampaignTemplate, CampaignStatus, Season } from '../types';
import {
  SEASON_LABELS,
  SEASON_COLORS,
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_TYPE_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../types';

interface CampaignListProps {
  campaigns: Campaign[];
  templates: CampaignTemplate[];
  onSelectCampaign: (campaign: Campaign) => void;
}

const SEASONS: (Season | 'all')[] = ['all', 'spring', 'summer', 'fall', 'winter'];
const STATUSES: (CampaignStatus | 'all')[] = ['all', 'draft', 'scheduled', 'sent', 'completed'];

export function CampaignList({
  campaigns,
  templates,
  onSelectCampaign,
}: CampaignListProps) {
  const [filterSeason, setFilterSeason] = useState<Season | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getTemplate = (templateId: string) =>
    templates.find((t) => t.id === templateId);

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filterSeason !== 'all' && campaign.season !== filterSeason) return false;
    if (filterStatus !== 'all' && campaign.status !== filterStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const template = getTemplate(campaign.templateId);
      return (
        campaign.name.toLowerCase().includes(search) ||
        template?.name.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Sort by scheduled date (most recent first)
  const sortedCampaigns = [...filteredCampaigns].sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });

    if (diffDays === 0) return `Today`;
    if (diffDays === 1) return `Tomorrow`;
    if (diffDays > 0 && diffDays <= 7) return `${formatted} (${diffDays} days)`;
    if (diffDays < 0) return `${formatted} (past)`;
    return formatted;
  };

  const isUpcoming = (campaign: Campaign) => {
    if (campaign.status !== 'scheduled') return false;
    const date = new Date(campaign.scheduledDate);
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 0 && diffDays <= 7;
  };

  const isPastDue = (campaign: Campaign) => {
    if (campaign.status !== 'scheduled') return false;
    const date = new Date(campaign.scheduledDate);
    return date < new Date();
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
        />
        <select
          value={filterSeason}
          onChange={(e) => setFilterSeason(e.target.value as Season | 'all')}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
        >
          {SEASONS.map((season) => (
            <option key={season} value={season}>
              {season === 'all' ? 'All Seasons' : SEASON_LABELS[season]}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as CampaignStatus | 'all')}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {/* Campaign Table */}
      {sortedCampaigns.length > 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                  Campaign
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700 hidden md:table-cell">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedCampaigns.map((campaign) => {
                const template = getTemplate(campaign.templateId);
                const upcoming = isUpcoming(campaign);
                const pastDue = isPastDue(campaign);

                return (
                  <tr
                    key={campaign.id}
                    onClick={() => onSelectCampaign(campaign)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      upcoming ? 'bg-amber-50' : ''
                    } ${pastDue ? 'bg-red-50' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">
                        {campaign.name}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            SEASON_COLORS[campaign.season]
                          }`}
                        >
                          {SEASON_LABELS[campaign.season]}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      {template && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            CAMPAIGN_TYPE_COLORS[template.type]
                          }`}
                        >
                          {CAMPAIGN_TYPE_LABELS[template.type]}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm ${
                          pastDue
                            ? 'text-red-600 font-medium'
                            : upcoming
                            ? 'text-amber-600 font-medium'
                            : 'text-slate-600'
                        }`}
                      >
                        {formatDate(campaign.scheduledDate)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          STATUS_COLORS[campaign.status]
                        }`}
                      >
                        {STATUS_LABELS[campaign.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <div className="text-slate-400 text-4xl mb-3">📋</div>
          <div className="text-slate-600 font-medium">No campaigns found</div>
          <div className="text-slate-500 text-sm mt-1">
            {campaigns.length === 0
              ? 'Create your first campaign from the Templates tab'
              : 'Try adjusting your filters'}
          </div>
        </div>
      )}
    </div>
  );
}
