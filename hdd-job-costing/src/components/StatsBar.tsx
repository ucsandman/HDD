import type { DashboardStats } from '../types';
import { formatCurrency } from '../utils/storage';

interface StatsBarProps {
  stats: DashboardStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects.toString(),
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects.toString(),
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      color: 'bg-green-50 text-green-700',
    },
    {
      label: 'Total Costs',
      value: formatCurrency(stats.totalCosts),
      color: 'bg-orange-50 text-orange-700',
    },
    {
      label: 'Total Profit',
      value: formatCurrency(stats.totalProfit),
      color: stats.totalProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
    },
    {
      label: 'Avg Margin',
      value: `${stats.averageMargin.toFixed(1)}%`,
      color: stats.averageMargin >= 20 ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map(stat => (
        <div
          key={stat.label}
          className={`${stat.color} rounded-lg p-4 text-center`}
        >
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-sm opacity-80">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
