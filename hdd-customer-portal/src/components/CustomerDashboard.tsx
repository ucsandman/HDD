import { useState } from 'react';
import type { Customer, CustomerProject } from '../types';
import { Header } from './Header';
import { ProjectCard } from './ProjectCard';
import { ProjectDetail } from './ProjectDetail';

interface CustomerDashboardProps {
  customer: Customer;
  projects: CustomerProject[];
  onLogout: () => void;
  onSendMessage: (projectId: string, message: string) => void;
}

export function CustomerDashboard({
  customer,
  projects,
  onLogout,
  onSendMessage,
}: CustomerDashboardProps) {
  const [selectedProject, setSelectedProject] = useState<CustomerProject | null>(null);

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
        onSendMessage={onSendMessage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header customer={customer} onLogout={onLogout} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#2F5233] to-[#3d6b43] rounded-2xl p-6 md:p-8 text-white mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            Welcome back, {customer.name.split(' ')[0]}!
          </h2>
          <p className="text-white/80 mt-2">
            {projects.length === 0
              ? "We're preparing your project. Check back soon!"
              : projects.length === 1
              ? 'Track your project progress below.'
              : `You have ${projects.length} projects with us.`}
          </p>
        </div>

        {/* Projects */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Projects Yet</h3>
            <p className="text-gray-500 mt-2">
              Your project information will appear here once we get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Projects</h3>
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
              />
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="tel:+15135551234"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">📞</span>
              <div>
                <p className="font-medium text-gray-900">Call Us</p>
                <p className="text-sm text-gray-500">(513) 555-1234</p>
              </div>
            </a>

            <a
              href="mailto:info@hickorydickorydecks.com"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">✉️</span>
              <div>
                <p className="font-medium text-gray-900">Email Us</p>
                <p className="text-sm text-gray-500">info@hdd.com</p>
              </div>
            </a>

            <a
              href="https://hickorydickorydecks.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">🌐</span>
              <div>
                <p className="font-medium text-gray-900">Visit Website</p>
                <p className="text-sm text-gray-500">hickorydickorydecks.com</p>
              </div>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Hickory Dickory Decks. All rights reserved.</p>
          <p className="mt-1">
            Customer: {customer.name} • {customer.address}, {customer.city}
          </p>
        </div>
      </footer>
    </div>
  );
}
