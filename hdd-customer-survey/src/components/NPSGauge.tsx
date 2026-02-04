interface NPSGaugeProps {
  score: number | null;
  size?: 'small' | 'large';
}

export function NPSGauge({ score, size = 'large' }: NPSGaugeProps) {
  // NPS ranges from -100 to +100
  // We'll display it on a gauge

  const getScoreColor = (score: number | null): string => {
    if (score === null) return 'text-slate-400';
    if (score >= 50) return 'text-green-600';
    if (score >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number | null): string => {
    if (score === null) return 'N/A';
    if (score >= 70) return 'Excellent';
    if (score >= 50) return 'Great';
    if (score >= 30) return 'Good';
    if (score >= 0) return 'Okay';
    if (score >= -30) return 'Needs Work';
    return 'Critical';
  };

  const getGaugePosition = (score: number | null): number => {
    if (score === null) return 50;
    // Convert -100 to +100 range to 0-100% for positioning
    return ((score + 100) / 200) * 100;
  };

  const isLarge = size === 'large';
  const containerClass = isLarge ? 'p-6' : 'p-4';
  const scoreClass = isLarge ? 'text-4xl' : 'text-2xl';
  const labelClass = isLarge ? 'text-sm' : 'text-xs';

  return (
    <div className={`bg-white rounded-lg border border-slate-200 ${containerClass}`}>
      <div className="text-center mb-4">
        <div className={`font-bold ${scoreClass} ${getScoreColor(score)}`}>
          {score !== null ? (score > 0 ? `+${score}` : score) : '--'}
        </div>
        <div className={`text-slate-500 mt-1 ${labelClass}`}>
          NPS Score
        </div>
        <div className={`font-medium mt-1 ${getScoreColor(score)} ${labelClass}`}>
          {getScoreLabel(score)}
        </div>
      </div>

      {/* Gauge bar */}
      <div className="relative h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full">
        {/* Marker */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-slate-700 rounded-full shadow"
          style={{ left: `${getGaugePosition(score)}%` }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-2 text-xs text-slate-500">
        <span>-100</span>
        <span>0</span>
        <span>+100</span>
      </div>
    </div>
  );
}
