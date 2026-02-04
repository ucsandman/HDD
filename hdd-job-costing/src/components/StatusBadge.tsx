import type { ProjectStatus, CostCategory } from '../types';
import { PROJECT_STATUSES, COST_CATEGORIES } from '../types';

interface StatusBadgeProps {
  status: ProjectStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusInfo = PROJECT_STATUSES.find(s => s.value === status);
  if (!statusInfo) return null;

  const colorClasses: Record<ProjectStatus, string> = {
    estimating: 'bg-amber-100 text-amber-800',
    quoted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[status]}`}>
      {statusInfo.label}
    </span>
  );
}

interface CategoryBadgeProps {
  category: CostCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const categoryInfo = COST_CATEGORIES.find(c => c.value === category);
  if (!categoryInfo) return null;

  const colorClasses: Record<CostCategory, string> = {
    materials: 'bg-green-100 text-green-800',
    labor: 'bg-blue-100 text-blue-800',
    permits: 'bg-purple-100 text-purple-800',
    equipment: 'bg-amber-100 text-amber-800',
    subcontractor: 'bg-pink-100 text-pink-800',
    overhead: 'bg-gray-100 text-gray-800',
    other: 'bg-teal-100 text-teal-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[category]}`}>
      {categoryInfo.label}
    </span>
  );
}
