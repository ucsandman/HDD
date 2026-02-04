import type { CustomerProject } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatShortDate } from '../utils/storage';

interface ProjectCardProps {
  project: CustomerProject;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#2F5233]/30 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg truncate">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {project.quoteAmount && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Quote</p>
            <p className="font-medium text-gray-900">
              ${project.quoteAmount.toLocaleString()}
            </p>
          </div>
        )}

        {project.scheduledDate && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Scheduled</p>
            <p className="font-medium text-gray-900">
              {formatShortDate(project.scheduledDate)}
            </p>
          </div>
        )}

        {project.estimatedCompletion && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Est. Complete</p>
            <p className="font-medium text-gray-900">
              {formatShortDate(project.estimatedCompletion)}
            </p>
          </div>
        )}

        {project.crewLeader && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Crew Leader</p>
            <p className="font-medium text-gray-900">{project.crewLeader}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{project.photos.length} photos</span>
        <span>{project.updates.length} updates</span>
        <span>{project.documents.length} documents</span>
      </div>
    </button>
  );
}
