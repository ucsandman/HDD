import { useState } from 'react';
import type { Project, ProjectFilters, ProjectStatus } from '../types';
import { PROJECT_STATUSES } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, calculateProjectSummary, exportToCSV } from '../utils/storage';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  filterProjects: (filters: ProjectFilters) => Project[];
}

export function ProjectList({ projects, onSelectProject, filterProjects }: ProjectListProps) {
  const [filters, setFilters] = useState<ProjectFilters>({});

  const filteredProjects = filterProjects(filters);

  const handleExport = () => {
    exportToCSV(filteredProjects);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search || ''}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || ''}
              onChange={e => setFilters(prev => ({
                ...prev,
                status: e.target.value as ProjectStatus || undefined
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">All Statuses</option>
              {PROJECT_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setFilters({})}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* Project Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredProjects.length} of {projects.length} projects
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          {projects.length === 0 ? (
            <>
              <p className="text-lg mb-2">No projects yet</p>
              <p>Create your first project to start tracking costs</p>
            </>
          ) : (
            <p>No projects match your filters</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map(project => {
            const summary = calculateProjectSummary(project);
            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <p className="text-sm text-gray-600">
                      {project.customerName} • {project.address}, {project.city}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-sm text-gray-500">
                      Quote: <span className="font-medium text-gray-900">{formatCurrency(project.quoteAmount)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Costs: <span className="font-medium text-orange-600">{formatCurrency(summary.totalCosts)}</span>
                    </div>
                    <div className={`text-sm font-medium ${summary.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Profit: {formatCurrency(summary.profit)} ({summary.profitMargin.toFixed(1)}%)
                    </div>
                  </div>
                </div>

                {/* Cost breakdown bar */}
                {summary.totalCosts > 0 && (
                  <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden flex">
                    {summary.categorySummaries
                      .filter(cat => cat.total > 0)
                      .map(cat => (
                        <div
                          key={cat.category}
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color
                          }}
                          title={`${cat.label}: ${formatCurrency(cat.total)}`}
                        />
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
