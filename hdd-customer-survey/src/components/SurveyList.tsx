import type { Survey, SurveyStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';
import { categorizeNPS } from '../utils/storage';

interface SurveyListProps {
  surveys: Survey[];
  filterStatus: SurveyStatus | 'all';
  onFilterChange: (status: SurveyStatus | 'all') => void;
  onSelectSurvey: (survey: Survey) => void;
  onCreateNew: () => void;
}

export function SurveyList({
  surveys,
  filterStatus,
  onFilterChange,
  onSelectSurvey,
  onCreateNew,
}: SurveyListProps) {
  const filteredSurveys =
    filterStatus === 'all'
      ? surveys
      : surveys.filter((s) => s.status === filterStatus);

  const sortedSurveys = [...filteredSurveys].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getNPSBadge = (score: number | null) => {
    if (score === null) return null;
    const category = categorizeNPS(score);
    const colors = {
      promoter: 'bg-green-100 text-green-700',
      passive: 'bg-yellow-100 text-yellow-700',
      detractor: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[category]}`}>
        {score}
      </span>
    );
  };

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-700">
            Filter by status:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value as SurveyStatus | 'all')}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F5233]"
          >
            <option value="all">All Surveys</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-[#2F5233] text-white font-medium rounded-lg hover:bg-[#243F28] transition-colors"
        >
          + New Survey
        </button>
      </div>

      {/* Survey List */}
      {sortedSurveys.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <p className="text-slate-600">
            {filterStatus === 'all'
              ? 'No surveys yet. Create your first survey to get started.'
              : `No surveys with status "${STATUS_LABELS[filterStatus]}".`}
          </p>
          {filterStatus === 'all' && (
            <button
              onClick={onCreateNew}
              className="mt-4 px-4 py-2 bg-[#2F5233] text-white font-medium rounded-lg hover:bg-[#243F28] transition-colors"
            >
              Create Survey
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                  Customer
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                  Project
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                  Sent
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">
                  NPS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedSurveys.map((survey) => (
                <tr
                  key={survey.id}
                  onClick={() => onSelectSurvey(survey)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">
                      {survey.customerName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {survey.customerEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {survey.projectName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium border ${
                        STATUS_COLORS[survey.status]
                      }`}
                    >
                      {STATUS_LABELS[survey.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {formatDate(survey.sentAt)}
                  </td>
                  <td className="px-4 py-3">
                    {getNPSBadge(survey.npsScore)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
