interface StatsBarProps {
  stats: {
    total: number;
    draft: number;
    scheduled: number;
    sent: number;
    completed: number;
    upcoming: number;
  };
}

interface StatCardProps {
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}

function StatCard({ label, value, color, highlight }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border p-4 ${
        highlight ? 'border-amber-300 bg-amber-50' : 'border-slate-200'
      }`}
    >
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-slate-600 mt-1">{label}</div>
    </div>
  );
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <StatCard
        label="Total Campaigns"
        value={stats.total}
        color="text-slate-700"
      />
      <StatCard
        label="Drafts"
        value={stats.draft}
        color="text-slate-600"
      />
      <StatCard
        label="Scheduled"
        value={stats.scheduled}
        color="text-blue-700"
      />
      <StatCard
        label="Sent"
        value={stats.sent}
        color="text-amber-700"
      />
      <StatCard
        label="Completed"
        value={stats.completed}
        color="text-green-700"
      />
      <StatCard
        label="Upcoming (7 days)"
        value={stats.upcoming}
        color="text-purple-700"
        highlight={stats.upcoming > 0}
      />
    </div>
  );
}
