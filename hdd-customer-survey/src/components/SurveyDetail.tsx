import type { Survey, SurveyResponse } from '../types';
import { DEFAULT_QUESTIONS, STATUS_LABELS, STATUS_COLORS } from '../types';
import { categorizeNPS } from '../utils/storage';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { ResponseChart } from './ResponseChart';

interface SurveyDetailProps {
  survey: Survey;
  onClose: () => void;
  onSend: () => void;
  onDelete: () => void;
  onExpire: () => void;
  onPreview: () => void;
}

export function SurveyDetail({
  survey,
  onClose,
  onSend,
  onDelete,
  onExpire,
  onPreview,
}: SurveyDetailProps) {
  const { copied, copyToClipboard } = useCopyToClipboard();

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getResponseValue = (questionId: string): SurveyResponse | undefined => {
    return survey.responses.find((r) => r.questionId === questionId);
  };

  const renderResponseValue = (questionId: string): string => {
    const response = getResponseValue(questionId);
    if (!response) return '-';

    const question = DEFAULT_QUESTIONS.find((q) => q.id === questionId);
    if (!question) return String(response.value);

    switch (question.type) {
      case 'nps':
        return `${response.value}/10`;
      case 'rating':
        return `${response.value}/5 stars`;
      case 'yesno':
        return response.value ? 'Yes' : 'No';
      case 'text':
        return String(response.value) || '-';
      default:
        return String(response.value);
    }
  };

  const surveyUrl = `${window.location.origin}?code=${survey.accessCode}`;

  const handleCopyLink = () => {
    copyToClipboard(surveyUrl);
  };

  const getNPSCategory = () => {
    if (survey.npsScore === null) return null;
    return categorizeNPS(survey.npsScore);
  };

  const npsCategory = getNPSCategory();
  const npsColors = {
    promoter: 'text-green-700 bg-green-100',
    passive: 'text-yellow-700 bg-yellow-100',
    detractor: 'text-red-700 bg-red-100',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Survey Details
            </h2>
            <p className="text-sm text-slate-500">{survey.projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-500">Customer</label>
              <p className="font-medium text-slate-800">{survey.customerName}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Email</label>
              <p className="font-medium text-slate-800">{survey.customerEmail}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Status</label>
              <p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${STATUS_COLORS[survey.status]}`}>
                  {STATUS_LABELS[survey.status]}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Access Code</label>
              <p className="font-mono text-slate-800">{survey.accessCode}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Sent At</label>
              <p className="text-slate-800">{formatDate(survey.sentAt)}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Completed At</label>
              <p className="text-slate-800">{formatDate(survey.completedAt)}</p>
            </div>
          </div>

          {/* Survey Link */}
          {survey.status === 'pending' || survey.status === 'sent' ? (
            <div className="bg-slate-50 rounded-lg p-4">
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Survey Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={surveyUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-600"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-[#2F5233] text-white text-sm font-medium rounded-lg hover:bg-[#243F28] transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ) : null}

          {/* NPS Score */}
          {survey.status === 'completed' && survey.npsScore !== null && (
            <div className="bg-slate-50 rounded-lg p-4">
              <label className="text-sm font-medium text-slate-700 block mb-2">
                NPS Score
              </label>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-slate-800">
                  {survey.npsScore}
                </span>
                {npsCategory && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${npsColors[npsCategory]}`}>
                    {npsCategory}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Responses */}
          {survey.status === 'completed' && survey.responses.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-4">
                Survey Responses
              </h3>

              {/* Rating Questions Chart */}
              <ResponseChart responses={survey.responses} />

              {/* All Responses */}
              <div className="space-y-4 mt-4">
                {DEFAULT_QUESTIONS.map((question) => {
                  const value = renderResponseValue(question.id);
                  if (value === '-' && !question.required) return null;

                  return (
                    <div key={question.id} className="bg-slate-50 rounded-lg p-4">
                      <label className="text-sm text-slate-600 block mb-1">
                        {question.text}
                      </label>
                      <p className="text-slate-800 font-medium">
                        {value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
            {survey.status === 'pending' && (
              <>
                <button
                  onClick={onSend}
                  className="px-4 py-2 bg-[#2F5233] text-white font-medium rounded-lg hover:bg-[#243F28] transition-colors"
                >
                  Mark as Sent
                </button>
                <button
                  onClick={onPreview}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Preview Survey
                </button>
              </>
            )}
            {survey.status === 'sent' && (
              <>
                <button
                  onClick={onExpire}
                  className="px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Mark as Expired
                </button>
                <button
                  onClick={onPreview}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Preview Survey
                </button>
              </>
            )}
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Survey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
