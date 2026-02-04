import type { SliderComparison } from '../types';

interface StatsBarProps {
  comparisons: SliderComparison[];
}

export function StatsBar({ comparisons }: StatsBarProps) {
  const totalComparisons = comparisons.length;
  const horizontalCount = comparisons.filter((c) => c.orientation === 'horizontal').length;
  const verticalCount = comparisons.filter((c) => c.orientation === 'vertical').length;

  // Get this month's comparisons
  const now = new Date();
  const thisMonth = comparisons.filter((c) => {
    const created = new Date(c.createdAt);
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
        <div className="text-2xl font-bold text-[#2F5233]">{totalComparisons}</div>
        <div className="text-sm text-slate-600">Total Comparisons</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
        <div className="text-2xl font-bold text-blue-600">{horizontalCount}</div>
        <div className="text-sm text-slate-600">Horizontal</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
        <div className="text-2xl font-bold text-purple-600">{verticalCount}</div>
        <div className="text-sm text-slate-600">Vertical</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
        <div className="text-2xl font-bold text-amber-600">{thisMonth}</div>
        <div className="text-sm text-slate-600">This Month</div>
      </div>
    </div>
  );
}
