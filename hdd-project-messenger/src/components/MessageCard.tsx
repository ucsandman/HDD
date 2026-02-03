import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface MessageCardProps {
  title: string;
  subtitle?: string;
  content: string;
  secondaryContent?: {
    label: string;
    content: string;
  };
  onMarkSent?: () => void;
  isSent?: boolean;
}

export function MessageCard({
  title,
  subtitle,
  content,
  secondaryContent,
  onMarkSent,
  isSent,
}: MessageCardProps) {
  const { copied, copyToClipboard } = useCopyToClipboard();

  const handleCopy = async () => {
    if (secondaryContent) {
      await copyToClipboard(
        `${secondaryContent.label}:\n${secondaryContent.content}\n\nBody:\n${content}`
      );
    } else {
      await copyToClipboard(content);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {isSent && (
          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300">
            Sent
          </span>
        )}
      </div>

      {secondaryContent && (
        <div className="mb-3">
          <p className="text-xs font-medium text-slate-600 mb-1">
            {secondaryContent.label}:
          </p>
          <p className="text-sm text-slate-800 font-medium">
            {secondaryContent.content}
          </p>
        </div>
      )}

      <div className="bg-slate-50 rounded border border-slate-200 p-3 mb-3">
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{content}</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {content.length} characters
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {onMarkSent && !isSent && (
            <button
              onClick={onMarkSent}
              className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
            >
              Mark Sent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
