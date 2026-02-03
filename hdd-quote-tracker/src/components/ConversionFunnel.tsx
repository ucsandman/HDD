import type { Quote } from '../types';

interface ConversionFunnelProps {
  quotes: Quote[];
}

export function ConversionFunnel({ quotes }: ConversionFunnelProps) {
  const stages = [
    { key: 'sent', label: 'Sent', color: 'bg-blue-500' },
    { key: 'viewed', label: 'Viewed', color: 'bg-purple-500' },
    { key: 'followup1', label: 'Follow-up 1', color: 'bg-yellow-500' },
    { key: 'followup2', label: 'Follow-up 2', color: 'bg-orange-500' },
    { key: 'closed_won', label: 'Closed Won', color: 'bg-green-500' },
  ];

  const total = quotes.length;
  const counts = stages.map((stage) => ({
    ...stage,
    count: quotes.filter((q) => q.status === stage.key).length,
    percentage: total > 0 ? ((quotes.filter((q) => q.status === stage.key).length / total) * 100).toFixed(0) : 0,
  }));

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">
        Conversion Funnel
      </h3>
      <div className="space-y-3">
        {counts.map((stage) => (
          <div key={stage.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">
                {stage.label}
              </span>
              <span className="text-sm text-slate-600">
                {stage.count} ({stage.percentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className={`${stage.color} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${stage.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
