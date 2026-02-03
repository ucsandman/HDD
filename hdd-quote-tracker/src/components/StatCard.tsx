interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}

export function StatCard({ label, value, icon, color = 'bg-blue-50' }: StatCardProps) {
  return (
    <div className={`${color} rounded-lg p-6 shadow-sm border border-slate-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
    </div>
  );
}
