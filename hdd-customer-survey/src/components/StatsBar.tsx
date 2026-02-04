import type { SurveyStats } from '../types';
import { NPSGauge } from './NPSGauge';

interface StatsBarProps {
  stats: SurveyStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* NPS Gauge */}
      <div className="md:col-span-1">
        <NPSGauge score={stats.npsScore} size="small" />
      </div>

      {/* Response Stats */}
      <div className="md:col-span-1 bg-white rounded-lg border border-slate-200 p-4">
        <div className="text-2xl font-bold text-blue-700">
          {stats.responseRate}%
        </div>
        <div className="text-sm text-slate-600 mt-1">Response Rate</div>
        <div className="text-xs text-slate-500 mt-2">
          {stats.completed} of {stats.totalSent} responded
        </div>
      </div>

      {/* Sent Count */}
      <div className="md:col-span-1 bg-white rounded-lg border border-slate-200 p-4">
        <div className="text-2xl font-bold text-slate-700">{stats.totalSent}</div>
        <div className="text-sm text-slate-600 mt-1">Surveys Sent</div>
        <div className="text-xs text-slate-500 mt-2">
          {stats.completed} completed
        </div>
      </div>

      {/* NPS Categories */}
      <div className="md:col-span-1 bg-white rounded-lg border border-slate-200 p-4">
        <div className="text-sm font-medium text-slate-700 mb-3">Responses by Category</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700">Promoters (9-10)</span>
            <span className="text-sm font-bold text-green-700">{stats.promoters}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-700">Passives (7-8)</span>
            <span className="text-sm font-bold text-yellow-700">{stats.passives}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-700">Detractors (0-6)</span>
            <span className="text-sm font-bold text-red-700">{stats.detractors}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
