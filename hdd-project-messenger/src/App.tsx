import { useState } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectForm, type ProjectFormData } from './components/ProjectForm';
import { ProjectDetail } from './components/ProjectDetail';
import { useProjects } from './hooks/useProjects';
import { getProjectStats, sortProjectsByDate } from './utils/helpers';
import type { Project, ProjectStatus } from './types';
import { STATUS_LABELS } from './types';

type ViewMode = 'list' | 'create' | 'detail';

function App() {
  const {
    projects,
    loading,
    addProject,
    updateProjectStatus,
    markNotificationSent,
    deleteProject,
  } = useProjects();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');

  const stats = getProjectStats(projects);
  const sortedProjects = sortProjectsByDate(projects);
  const filteredProjects =
    filterStatus === 'all'
      ? sortedProjects
      : sortedProjects.filter((p) => p.status === filterStatus);

  const handleCreateProject = (data: ProjectFormData) => {
    addProject({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      projectType: data.projectType,
      address: data.address,
      status: data.status,
      scheduledStartDate: data.scheduledStartDate || null,
      actualStartDate: null,
      estimatedCompletion: data.estimatedCompletion || null,
      actualCompletion: null,
      notes: data.notes,
      photos: [],
    });
    setViewMode('list');
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setViewMode('detail');
  };

  const handleCloseDetail = () => {
    setSelectedProject(null);
    setViewMode('list');
  };

  const handleUpdateStatus = (newStatus: ProjectStatus, additionalData?: { date?: string }) => {
    if (selectedProject) {
      updateProjectStatus(selectedProject.id, newStatus, additionalData);
      // Refresh the selected project
      const updatedProjects = projects.map((p) =>
        p.id === selectedProject.id ? { ...p, status: newStatus } : p
      );
      const updated = updatedProjects.find((p) => p.id === selectedProject.id);
      if (updated) {
        setSelectedProject(updated);
      }
    }
  };

  const handleMarkSent = (statusChangeId: string, type: 'sms' | 'email' | 'both') => {
    if (selectedProject) {
      markNotificationSent(selectedProject.id, statusChangeId, type);
      // Refresh the selected project
      const updated = projects.find((p) => p.id === selectedProject.id);
      if (updated) {
        setSelectedProject(updated);
      }
    }
  };

  const handleDeleteProject = () => {
    if (selectedProject) {
      deleteProject(selectedProject.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="mb-8">
          <StatsBar stats={stats} />
        </div>

        {/* View: List */}
        {viewMode === 'list' && (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">Filter by status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Projects</option>
                  <option value="quoted">Quoted</option>
                  <option value="sold">Sold</option>
                  <option value="materials_ordered">Materials Ordered</option>
                  <option value="materials_received">Materials Received</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="inspection_scheduled">Inspection Scheduled</option>
                  <option value="complete">Complete</option>
                </select>
              </div>

              <button
                onClick={() => setViewMode('create')}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Project
              </button>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-600">
                  {filterStatus === 'all'
                    ? 'No projects yet. Create your first project to get started.'
                    : `No projects with status "${STATUS_LABELS[filterStatus]}".`}
                </p>
                {filterStatus === 'all' && (
                  <button
                    onClick={() => setViewMode('create')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Project
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleViewProject(project)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* View: Create */}
        {viewMode === 'create' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Create New Project
              </h2>
              <ProjectForm
                onSubmit={handleCreateProject}
                onCancel={() => setViewMode('list')}
              />
            </div>
          </div>
        )}
      </main>

      {/* View: Detail (Modal) */}
      {viewMode === 'detail' && selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={handleCloseDetail}
          onUpdateStatus={handleUpdateStatus}
          onMarkNotificationSent={handleMarkSent}
          onDelete={handleDeleteProject}
        />
      )}

      <footer className="text-center py-6 text-sm text-slate-500">
        Hickory Dickory Decks Project Update Messenger
      </footer>
    </div>
  );
}

export default App;
