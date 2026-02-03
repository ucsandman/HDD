import type { Project } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../types';
import { formatDate, formatPhoneForDisplay } from '../utils/helpers';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const pendingNotifications = project.statusHistory.filter(
    (sh) => !sh.notificationSent
  ).length;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 text-lg">
            {project.customerName}
          </h3>
          <p className="text-sm text-slate-600">{project.projectType}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
              STATUS_COLORS[project.status]
            }`}
          >
            {STATUS_LABELS[project.status]}
          </span>
          {pendingNotifications > 0 && (
            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">
              {pendingNotifications} pending
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-medium">Phone:</span>
          <span>{formatPhoneForDisplay(project.customerPhone)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Email:</span>
          <span className="truncate">{project.customerEmail}</span>
        </div>
        {project.address && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Address:</span>
            <span className="truncate">{project.address}</span>
          </div>
        )}
        {project.scheduledStartDate && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Scheduled:</span>
            <span>{formatDate(project.scheduledStartDate)}</span>
          </div>
        )}
        {project.estimatedCompletion && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Est. Completion:</span>
            <span>{formatDate(project.estimatedCompletion)}</span>
          </div>
        )}
      </div>

      {project.notes && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-sm text-slate-600 line-clamp-2">{project.notes}</p>
        </div>
      )}
    </div>
  );
}
