import type { ProjectDocument } from '../types';
import { formatDate } from '../utils/storage';

interface DocumentListProps {
  documents: ProjectDocument[];
}

const DOCUMENT_ICONS: Record<ProjectDocument['type'], string> = {
  quote: '💰',
  contract: '📝',
  permit: '🏛️',
  warranty: '🛡️',
  other: '📄',
};

const DOCUMENT_COLORS: Record<ProjectDocument['type'], string> = {
  quote: 'bg-green-50 border-green-200',
  contract: 'bg-blue-50 border-blue-200',
  permit: 'bg-purple-50 border-purple-200',
  warranty: 'bg-orange-50 border-orange-200',
  other: 'bg-gray-50 border-gray-200',
};

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No documents uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>

      <div className="space-y-3">
        {documents.map(doc => (
          <div
            key={doc.id}
            className={`flex items-center gap-4 p-4 rounded-lg border ${DOCUMENT_COLORS[doc.type]}`}
          >
            <span className="text-2xl">{DOCUMENT_ICONS[doc.type]}</span>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
              <p className="text-sm text-gray-500 capitalize">
                {doc.type} • {formatDate(doc.uploadedAt)}
              </p>
            </div>

            {doc.url ? (
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </a>
            ) : (
              <span className="px-4 py-2 text-sm text-gray-400">
                View in office
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
