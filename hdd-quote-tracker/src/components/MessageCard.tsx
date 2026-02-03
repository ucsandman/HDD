import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface MessageCardProps {
  title: string;
  subject?: string;
  message: string;
  type: 'sms' | 'email';
}

export function MessageCard({ title, subject, message, type }: MessageCardProps) {
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = () => {
    const text = subject ? `Subject: ${subject}\n\n${message}` : message;
    copy(text);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <span className="text-xs text-slate-500 uppercase">{type}</span>
      </div>

      {subject && (
        <div className="mb-2">
          <p className="text-xs font-medium text-slate-600">Subject:</p>
          <p className="text-sm text-slate-900">{subject}</p>
        </div>
      )}

      <div className="bg-slate-50 rounded p-3 mb-3">
        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
          {message}
        </pre>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {message.length} characters
        </span>
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-sm font-medium text-white bg-amber-800 hover:bg-amber-900 rounded transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
