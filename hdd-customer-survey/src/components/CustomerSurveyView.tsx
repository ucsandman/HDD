import { useState } from 'react';
import type { Survey, SurveyResponse, SurveyQuestion } from '../types';
import { DEFAULT_QUESTIONS } from '../types';

interface CustomerSurveyViewProps {
  survey: Survey;
  onSubmit: (responses: SurveyResponse[]) => void;
  isPreview?: boolean;
}

export function CustomerSurveyView({
  survey,
  onSubmit,
  isPreview = false,
}: CustomerSurveyViewProps) {
  const [responses, setResponses] = useState<Record<string, number | string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (questionId: string, value: number | string | boolean) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    DEFAULT_QUESTIONS.forEach((question) => {
      if (question.required && responses[question.id] === undefined) {
        newErrors[question.id] = 'This question is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const surveyResponses: SurveyResponse[] = Object.entries(responses).map(
      ([questionId, value]) => ({
        questionId,
        value,
      })
    );

    if (isPreview) {
      setSubmitted(true);
      setTimeout(() => {
        onSubmit(surveyResponses);
      }, 1500);
    } else {
      onSubmit(surveyResponses);
      setSubmitted(true);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const hasError = !!errors[question.id];

    switch (question.type) {
      case 'nps':
        return (
          <div key={question.id} className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => handleChange(question.id, score)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    responses[question.id] === score
                      ? 'bg-[#2F5233] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 px-1">
              <span>Not at all likely</span>
              <span>Extremely likely</span>
            </div>
            {hasError && (
              <p className="text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'rating':
        return (
          <div key={question.id} className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleChange(question.id, rating)}
                  className={`p-2 transition-colors ${
                    responses[question.id] !== undefined &&
                    (responses[question.id] as number) >= rating
                      ? 'text-yellow-500'
                      : 'text-slate-300 hover:text-yellow-300'
                  }`}
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            {hasError && (
              <p className="text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'yesno':
        return (
          <div key={question.id} className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleChange(question.id, true)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  responses[question.id] === true
                    ? 'bg-[#2F5233] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleChange(question.id, false)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  responses[question.id] === false
                    ? 'bg-[#2F5233] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                No
              </button>
            </div>
            {hasError && (
              <p className="text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'text':
        return (
          <div key={question.id} className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={(responses[question.id] as string) || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F5233] ${
                hasError ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="Your feedback..."
            />
            {hasError && (
              <p className="text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Thank You!
        </h2>
        <p className="text-slate-600">
          {isPreview
            ? 'This is a preview. In the actual survey, the response would be recorded.'
            : 'Your feedback has been submitted. We truly appreciate you taking the time to share your experience with us.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#2F5233] rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
          HDD
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          We value your feedback!
        </h1>
        <p className="text-slate-600">
          Hi {survey.customerName}, thank you for choosing Hickory Dickory Decks for your{' '}
          <strong>{survey.projectName}</strong> project. Please take a moment to share your
          experience with us.
        </p>
      </div>

      {/* Questions */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {DEFAULT_QUESTIONS.map(renderQuestion)}

        {/* Submit */}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-[#2F5233] text-white font-medium rounded-lg hover:bg-[#243F28] transition-colors"
        >
          {isPreview ? 'Submit (Preview)' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}
