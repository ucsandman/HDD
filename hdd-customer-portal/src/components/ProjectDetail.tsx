import { useState } from 'react';
import type { CustomerProject } from '../types';
import { PROJECT_STATUSES } from '../types';
import { StatusBadge } from './StatusBadge';
import { ProjectTimeline } from './ProjectTimeline';
import { UpdatesList } from './UpdatesList';
import { PhotoGallery } from './PhotoGallery';
import { DocumentList } from './DocumentList';
import { ContactCard } from './ContactCard';
import { formatDate } from '../utils/storage';

interface ProjectDetailProps {
  project: CustomerProject;
  onBack: () => void;
  onSendMessage: (projectId: string, message: string) => void;
}

type TabType = 'overview' | 'photos' | 'documents';

export function ProjectDetail({ project, onBack, onSendMessage }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const statusInfo = PROJECT_STATUSES.find(s => s.value === project.status);

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'photos', label: 'Photos', count: project.photos.length },
    { id: 'documents', label: 'Documents', count: project.documents.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#2F5233] text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              {project.description && (
                <p className="text-white/80 mt-1">{project.description}</p>
              )}
            </div>
            <StatusBadge status={project.status} size="lg" />
          </div>

          {/* Status Message */}
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <p className="text-lg">{statusInfo?.description}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#2F5233] text-[#2F5233]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-[#2F5233]/10' : 'bg-gray-100'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {project.quoteAmount && (
                    <div>
                      <p className="text-sm text-gray-500">Quote Amount</p>
                      <p className="text-xl font-semibold text-gray-900">
                        ${project.quoteAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {project.scheduledDate && (
                    <div>
                      <p className="text-sm text-gray-500">Build Date</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatDate(project.scheduledDate)}
                      </p>
                    </div>
                  )}
                  {project.estimatedCompletion && (
                    <div>
                      <p className="text-sm text-gray-500">Est. Completion</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {formatDate(project.estimatedCompletion)}
                      </p>
                    </div>
                  )}
                  {project.crewLeader && (
                    <div>
                      <p className="text-sm text-gray-500">Crew Leader</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {project.crewLeader}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <ProjectTimeline currentStatus={project.status} />

              {/* Updates */}
              <UpdatesList updates={project.updates} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ContactCard
                crewLeader={project.crewLeader}
                onSendMessage={(msg) => onSendMessage(project.id, msg)}
              />

              {/* Recent Photo Preview */}
              {project.photos.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Recent Photos</h3>
                    <button
                      onClick={() => setActiveTab('photos')}
                      className="text-sm text-[#2F5233] hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {project.photos.slice(0, 4).map(photo => (
                      <div
                        key={photo.id}
                        className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || 'Project photo'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <PhotoGallery photos={project.photos} />
        )}

        {activeTab === 'documents' && (
          <DocumentList documents={project.documents} />
        )}
      </div>
    </div>
  );
}
