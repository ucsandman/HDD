import { useState } from 'react';
import type { Project } from './types';
import { useProjects } from './hooks/useProjects';
import { calculateDashboardStats } from './utils/storage';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { ProjectList } from './components/ProjectList';
import { ProjectForm } from './components/ProjectForm';
import { ProjectDetail } from './components/ProjectDetail';

type ViewType = 'list' | 'create' | 'detail';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    updateStatus,
    addExpense,
    updateExpense,
    deleteExpense,
    filterProjects,
    getProject,
  } = useProjects();

  const stats = calculateDashboardStats(projects);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('detail');
  };

  const handleCreateProject = (data: Omit<Project, 'id' | 'expenses' | 'createdAt' | 'updatedAt'>) => {
    const newProject = createProject(data);
    setSelectedProject(newProject);
    setCurrentView('detail');
  };

  const handleCloseDetail = () => {
    setSelectedProject(null);
    setCurrentView('list');
  };

  // Keep selected project in sync
  const currentProject = selectedProject ? getProject(selectedProject.id) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view !== 'detail') {
            setSelectedProject(null);
          }
        }}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Bar - always visible */}
        <StatsBar stats={stats} />

        {/* Main Content */}
        {currentView === 'list' && (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            filterProjects={filterProjects}
          />
        )}

        {currentView === 'create' && (
          <ProjectForm
            onSubmit={handleCreateProject}
            onCancel={() => setCurrentView('list')}
          />
        )}

        {currentView === 'detail' && currentProject && (
          <ProjectDetail
            project={currentProject}
            onUpdate={updateProject}
            onUpdateStatus={updateStatus}
            onAddExpense={addExpense}
            onUpdateExpense={updateExpense}
            onDeleteExpense={deleteExpense}
            onDelete={deleteProject}
            onClose={handleCloseDetail}
          />
        )}
      </main>
    </div>
  );
}

export default App;
