import type { ProjectSummary } from '../types';
import { formatCurrency } from '../utils/storage';

interface CostBreakdownProps {
  summary: ProjectSummary;
}

export function CostBreakdown({ summary }: CostBreakdownProps) {
  const categoriesWithCosts = summary.categorySummaries.filter(cat => cat.total > 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600">Quote Amount</div>
          <div className="text-xl font-bold text-blue-700">
            {formatCurrency(summary.quoteAmount)}
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-orange-600">Total Costs</div>
          <div className="text-xl font-bold text-orange-700">
            {formatCurrency(summary.totalCosts)}
          </div>
        </div>

        <div className={`rounded-lg p-4 ${summary.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`text-sm ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Profit
          </div>
          <div className={`text-xl font-bold ${summary.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(summary.profit)}
          </div>
        </div>

        <div className={`rounded-lg p-4 ${summary.profitMargin >= 20 ? 'bg-teal-50' : 'bg-amber-50'}`}>
          <div className={`text-sm ${summary.profitMargin >= 20 ? 'text-teal-600' : 'text-amber-600'}`}>
            Margin
          </div>
          <div className={`text-xl font-bold ${summary.profitMargin >= 20 ? 'text-teal-700' : 'text-amber-700'}`}>
            {summary.profitMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoriesWithCosts.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">By Category</h4>

          {/* Visual bar */}
          <div className="h-4 rounded-full bg-gray-100 overflow-hidden flex">
            {categoriesWithCosts.map(cat => (
              <div
                key={cat.category}
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color
                }}
                title={`${cat.label}: ${formatCurrency(cat.total)} (${cat.percentage.toFixed(1)}%)`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoriesWithCosts.map(cat => (
              <div key={cat.category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {cat.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(cat.total)} ({cat.percentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          No expenses recorded yet
        </div>
      )}
    </div>
  );
}
