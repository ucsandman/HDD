import type { Project, ProjectStatus } from '../types';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not set';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid date';
  }
}

export function getProjectStats(projects: Project[]) {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const activeProjects = projects.filter(
    (p) => p.status !== 'complete' && p.status !== 'quoted'
  );

  const startingThisWeek = projects.filter((p) => {
    if (!p.scheduledStartDate) return false;
    const startDate = new Date(p.scheduledStartDate);
    return startDate >= now && startDate <= weekFromNow;
  });

  const completingThisWeek = projects.filter((p) => {
    if (!p.estimatedCompletion) return false;
    const completionDate = new Date(p.estimatedCompletion);
    return completionDate >= now && completionDate <= weekFromNow;
  });

  const pendingNotifications = projects.reduce((count, project) => {
    const pending = project.statusHistory.filter((sh) => !sh.notificationSent);
    return count + pending.length;
  }, 0);

  return {
    totalProjects: projects.length,
    activeProjects: activeProjects.length,
    startingThisWeek: startingThisWeek.length,
    completingThisWeek: completingThisWeek.length,
    pendingNotifications,
  };
}

export function getProjectsByStatus(
  projects: Project[],
  status: ProjectStatus
): Project[] {
  return projects.filter((p) => p.status === status);
}

export function sortProjectsByDate(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
