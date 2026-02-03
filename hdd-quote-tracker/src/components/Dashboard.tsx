import type { Quote } from '../types';
import { StatCard } from './StatCard';
import { isOverdue } from '../utils/dateUtils';

interface DashboardProps {
  quotes: Quote[];
}

export function Dashboard({ quotes }: DashboardProps) {
  const totalQuotes = quotes.length;

  const pendingFollowUps = quotes.filter(
    (q) => q.nextFollowUp && isOverdue(q.nextFollowUp) && !q.status.startsWith('closed')
  ).length;

  const closedWon = quotes.filter((q) => q.status === 'closed_won').length;
  const conversionRate = totalQuotes > 0 ? ((closedWon / totalQuotes) * 100).toFixed(1) : '0';

  const totalValue = quotes.reduce((sum, q) => sum + q.estimatedTotal, 0);
  const avgQuoteValue =
    totalQuotes > 0 ? Math.round(totalValue / totalQuotes) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Quotes"
        value={totalQuotes}
        icon="📋"
        color="bg-blue-50"
      />
      <StatCard
        label="Pending Follow-Ups"
        value={pendingFollowUps}
        icon="⏰"
        color={pendingFollowUps > 0 ? 'bg-red-50' : 'bg-green-50'}
      />
      <StatCard
        label="Conversion Rate"
        value={`${conversionRate}%`}
        icon="📈"
        color="bg-green-50"
      />
      <StatCard
        label="Avg Quote Value"
        value={`$${avgQuoteValue.toLocaleString()}`}
        icon="💰"
        color="bg-purple-50"
      />
    </div>
  );
}
