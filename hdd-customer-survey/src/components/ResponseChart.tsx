import type { SurveyResponse } from '../types';
import { DEFAULT_QUESTIONS } from '../types';

interface ResponseChartProps {
  responses: SurveyResponse[];
}

export function ResponseChart({ responses }: ResponseChartProps) {
  // Get rating questions only
  const ratingQuestions = DEFAULT_QUESTIONS.filter(
    (q) => q.type === 'rating' || q.type === 'nps'
  );

  const getResponseValue = (questionId: string): number | null => {
    const response = responses.find((r) => r.questionId === questionId);
    if (response && typeof response.value === 'number') {
      return response.value;
    }
    return null;
  };

  const getBarColor = (questionId: string, value: number): string => {
    if (questionId === 'nps') {
      // NPS coloring
      if (value >= 9) return 'bg-green-500';
      if (value >= 7) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    // Rating coloring (1-5 scale)
    if (value >= 4) return 'bg-green-500';
    if (value >= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBarWidth = (questionId: string, value: number): number => {
    if (questionId === 'nps') {
      // NPS is 0-10
      return (value / 10) * 100;
    }
    // Rating is 1-5
    return (value / 5) * 100;
  };

  const getLabel = (question: typeof DEFAULT_QUESTIONS[0]): string => {
    // Shorten labels for display
    if (question.id === 'nps') return 'Recommendation (NPS)';
    if (question.id === 'quality') return 'Quality of Work';
    if (question.id === 'communication') return 'Communication';
    if (question.id === 'timeline') return 'Timeline';
    return question.text;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h4 className="text-sm font-medium text-slate-700 mb-4">Rating Summary</h4>
      <div className="space-y-4">
        {ratingQuestions.map((question) => {
          const value = getResponseValue(question.id);
          if (value === null) return null;

          const maxValue = question.type === 'nps' ? 10 : 5;

          return (
            <div key={question.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-600">{getLabel(question)}</span>
                <span className="text-sm font-medium text-slate-800">
                  {value}/{maxValue}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getBarColor(question.id, value)} transition-all duration-500`}
                  style={{ width: `${getBarWidth(question.id, value)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
