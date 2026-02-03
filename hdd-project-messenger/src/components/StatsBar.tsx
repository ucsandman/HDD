interface StatsBarProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    startingThisWeek: number;
    completingThisWeek: number;
    pendingNotifications: number;
  };
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard
        label="Total Projects"
        value={stats.totalProjects}
        color="text-slate-700"
      />
      <StatCard
        label="Active"
        value={stats.activeProjects}
        color="text-blue-700"
      />
      <StatCard
        label="Starting This Week"
        value={stats.startingThisWeek}
        color="text-green-700"
      />
      <StatCard
        label="Completing This Week"
        value={stats.completingThisWeek}
        color="text-purple-700"
      />
      <StatCard
        label="Pending Notifications"
        value={stats.pendingNotifications}
        color="text-orange-700"
        highlight={stats.pendingNotifications > 0}
      />
    </div>
  );
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
        highlight ? 'border-orange-300 bg-orange-50' : 'border-slate-200'
      }`}
    >
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-slate-600 mt-1">{label}</div>
    </div>
  );
}
