import { CopyButton } from './CopyButton';
import type { MessageCardProps } from '../types';

interface ExtendedMessageCardProps extends MessageCardProps {
  characterCount?: number;
}

export function MessageCard({
  title,
  timing,
  content,
  secondaryContent,
  characterCount,
}: ExtendedMessageCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{timing}</p>
        </div>
        <CopyButton text={secondaryContent ? `${secondaryContent.content}\n\n${content}` : content} />
      </div>

      <div className="p-4 space-y-4">
        {secondaryContent && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">
                {secondaryContent.label}
              </span>
              <CopyButton text={secondaryContent.content} label="Copy" />
            </div>
            <div className="font-mono text-sm bg-slate-50 rounded-md p-3 text-slate-700 border border-slate-100">
              {secondaryContent.content}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {secondaryContent && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">Body</span>
              <CopyButton text={content} label="Copy" />
            </div>
          )}
          <pre className="font-mono text-sm bg-slate-50 rounded-md p-3 text-slate-700 border border-slate-100 whitespace-pre-wrap break-words">
            {content}
          </pre>
        </div>

        {characterCount !== undefined && (
          <p className="text-xs text-slate-500">
            {characterCount} characters
            {characterCount > 160 && characterCount <= 320 && (
              <span className="text-amber-600"> (2 SMS segments)</span>
            )}
            {characterCount > 320 && (
              <span className="text-red-500"> (exceeds 320 char limit)</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
