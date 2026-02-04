import type { ProjectStatus } from '../types';
import { PROJECT_STATUSES } from '../types';

interface ProjectTimelineProps {
  currentStatus: ProjectStatus;
}

export function ProjectTimeline({ currentStatus }: ProjectTimelineProps) {
  const statusOrder = PROJECT_STATUSES.map(s => s.value);
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Progress</h3>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div
          className="absolute left-4 top-0 w-0.5 bg-[#2F5233] transition-all duration-500"
          style={{
            height: `${(currentIndex / (statusOrder.length - 1)) * 100}%`,
          }}
        />

        {/* Status steps */}
        <div className="space-y-6">
          {PROJECT_STATUSES.map((status, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            return (
              <div key={status.value} className="relative flex items-start gap-4 pl-10">
                {/* Circle indicator */}
                <div
                  className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isComplete
                      ? 'bg-[#2F5233] text-white'
                      : isCurrent
                      ? 'bg-[#2F5233] text-white ring-4 ring-[#2F5233]/20'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Content */}
                <div className={isFuture ? 'opacity-50' : ''}>
                  <h4
                    className={`font-medium ${
                      isCurrent ? 'text-[#2F5233]' : 'text-gray-900'
                    }`}
                  >
                    {status.label}
                    {isCurrent && (
                      <span className="ml-2 text-xs bg-[#2F5233]/10 text-[#2F5233] px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 mt-0.5">{status.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
