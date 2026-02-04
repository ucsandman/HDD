import type { DashboardStats } from '../types';

interface StatsBarProps {
  stats: DashboardStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  const statCards = [
    {
      label: 'Materials',
      value: stats.totalMaterials.toString(),
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Suppliers',
      value: stats.totalSuppliers.toString(),
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Price Entries',
      value: stats.totalPriceEntries.toString(),
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Recent Changes',
      value: stats.recentPriceChanges.toString(),
      subtitle: '(30 days)',
      color: 'bg-orange-50 text-orange-700',
    },
    {
      label: 'Avg Savings',
      value: `${stats.avgSavingsOpportunity.toFixed(1)}%`,
      subtitle: 'opportunity',
      color: stats.avgSavingsOpportunity > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {statCards.map(stat => (
        <div
          key={stat.label}
          className={`${stat.color} rounded-lg p-4 text-center`}
        >
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-sm opacity-80">{stat.label}</div>
          {stat.subtitle && (
            <div className="text-xs opacity-60">{stat.subtitle}</div>
          )}
        </div>
      ))}
    </div>
  );
}
