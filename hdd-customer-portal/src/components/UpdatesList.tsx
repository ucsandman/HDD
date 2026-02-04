import type { ProjectUpdate } from '../types';
import { formatDate } from '../utils/storage';

interface UpdatesListProps {
  updates: ProjectUpdate[];
}

export function UpdatesList({ updates }: UpdatesListProps) {
  if (updates.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Updates</h3>
        <p className="text-gray-500 text-center py-4">No updates yet</p>
      </div>
    );
  }

  // Sort updates newest first
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Updates</h3>

      <div className="space-y-4">
        {sortedUpdates.map((update, index) => (
          <div
            key={update.id}
            className={`relative pl-6 pb-4 ${
              index !== sortedUpdates.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            {/* Timeline dot */}
            <div
              className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${
                update.isFromCustomer ? 'bg-blue-500' : 'bg-[#2F5233]'
              }`}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-700">{update.message}</p>
                {update.isFromCustomer && (
                  <span className="inline-block mt-1 text-xs text-blue-600 font-medium">
                    Your message
                  </span>
                )}
              </div>
              <time className="text-sm text-gray-400 whitespace-nowrap">
                {formatDate(update.date)}
              </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
