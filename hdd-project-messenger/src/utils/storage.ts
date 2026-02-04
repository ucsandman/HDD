import type { Project } from '../types';

const STORAGE_KEY = 'hdd_projects';

// Only log errors in development mode
const logError = (message: string, error: unknown) => {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
};

export function loadProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    logError('Failed to load projects:', error);
    return [];
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    logError('Failed to save projects:', error);
  }
}

export function saveProject(project: Project): void {
  const projects = loadProjects();
  const index = projects.findIndex((p) => p.id === project.id);

  if (index >= 0) {
    projects[index] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    projects.push(project);
  }

  saveProjects(projects);
}

export function deleteProject(projectId: string): void {
  const projects = loadProjects();
  const filtered = projects.filter((p) => p.id !== projectId);
  saveProjects(filtered);
}

export function getProject(projectId: string): Project | null {
  const projects = loadProjects();
  return projects.find((p) => p.id === projectId) || null;
}
