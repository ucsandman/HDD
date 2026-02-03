import { useState, useCallback } from 'react';
import type { Project, ProjectStatus, StatusChange } from '../types';
import { loadProjects, saveProject, deleteProject as deleteFromStorage } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { generateStatusMessage } from '../utils/messageTemplates';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const loading = false;

  const addProject = useCallback((projectData: Omit<Project, 'id' | 'statusHistory' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...projectData,
      id: generateId(),
      statusHistory: [
        {
          id: generateId(),
          fromStatus: null,
          toStatus: projectData.status,
          changedAt: now,
          notificationSent: false,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    setProjects((prev) => {
      const updated = [...prev, newProject];
      saveProject(newProject);
      return updated;
    });

    return newProject;
  }, []);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects((prev) => {
      const project = prev.find((p) => p.id === projectId);
      if (!project) return prev;

      const updated = { ...project, ...updates, updatedAt: new Date().toISOString() };
      const newProjects = prev.map((p) => (p.id === projectId ? updated : p));
      saveProject(updated);
      return newProjects;
    });
  }, []);

  const updateProjectStatus = useCallback(
    (projectId: string, newStatus: ProjectStatus, additionalData?: { date?: string }) => {
      setProjects((prev) => {
        const project = prev.find((p) => p.id === projectId);
        if (!project) return prev;

        const now = new Date().toISOString();
        const message = generateStatusMessage(project, newStatus, additionalData);

        const statusChange: StatusChange = {
          id: generateId(),
          fromStatus: project.status,
          toStatus: newStatus,
          changedAt: now,
          notificationSent: false,
          messageContent: JSON.stringify(message),
        };

        const updated = {
          ...project,
          status: newStatus,
          statusHistory: [...project.statusHistory, statusChange],
          updatedAt: now,
        };

        const newProjects = prev.map((p) => (p.id === projectId ? updated : p));
        saveProject(updated);
        return newProjects;
      });
    },
    []
  );

  const markNotificationSent = useCallback((projectId: string, statusChangeId: string, type: 'sms' | 'email' | 'both') => {
    setProjects((prev) => {
      const project = prev.find((p) => p.id === projectId);
      if (!project) return prev;

      const updatedHistory = project.statusHistory.map((sh) =>
        sh.id === statusChangeId
          ? { ...sh, notificationSent: true, notificationType: type }
          : sh
      );

      const updated = {
        ...project,
        statusHistory: updatedHistory,
        updatedAt: new Date().toISOString(),
      };

      const newProjects = prev.map((p) => (p.id === projectId ? updated : p));
      saveProject(updated);
      return newProjects;
    });
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== projectId);
      deleteFromStorage(projectId);
      return filtered;
    });
  }, []);

  const addProjectPhoto = useCallback((projectId: string, photo: { url: string; caption: string }) => {
    setProjects((prev) => {
      const project = prev.find((p) => p.id === projectId);
      if (!project) return prev;

      const newPhoto = {
        id: generateId(),
        url: photo.url,
        caption: photo.caption,
        uploadedAt: new Date().toISOString(),
      };

      const updated = {
        ...project,
        photos: [...project.photos, newPhoto],
        updatedAt: new Date().toISOString(),
      };

      const newProjects = prev.map((p) => (p.id === projectId ? updated : p));
      saveProject(updated);
      return newProjects;
    });
  }, []);

  return {
    projects,
    loading,
    addProject,
    updateProject,
    updateProjectStatus,
    markNotificationSent,
    deleteProject,
    addProjectPhoto,
  };
}
