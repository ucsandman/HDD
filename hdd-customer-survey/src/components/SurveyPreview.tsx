import type { Survey } from '../types';
import { CustomerSurveyView } from './CustomerSurveyView';

interface SurveyPreviewProps {
  survey: Survey;
  onClose: () => void;
}

export function SurveyPreview({ survey, onClose }: SurveyPreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-yellow-50 border-b border-yellow-200 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-yellow-800 font-medium">
            Preview Mode - Customer View
          </div>
          <button
            onClick={onClose}
            className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <CustomerSurveyView
          survey={survey}
          onSubmit={() => {
            // In preview mode, just close
            onClose();
          }}
          isPreview={true}
        />
      </div>
    </div>
  );
}
