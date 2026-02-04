import { useState, useEffect, useCallback } from 'react';
import type { Project, Expense, ProjectStatus, ProjectFilters } from '../types';
import { loadProjects, saveProjects, generateId } from '../utils/storage';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects on mount
  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
    setLoading(false);
  }, []);

  // Save projects whenever they change
  useEffect(() => {
    if (!loading) {
      saveProjects(projects);
    }
  }, [projects, loading]);

  // Create new project
  const createProject = useCallback((
    data: Omit<Project, 'id' | 'expenses' | 'createdAt' | 'updatedAt'>
  ): Project => {
    const now = new Date().toISOString();
    const newProject: Project = {
      ...data,
      id: generateId(),
      expenses: [],
      createdAt: now,
      updatedAt: now,
    };

    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  // Update project
  const updateProject = useCallback((
    id: string,
    updates: Partial<Omit<Project, 'id' | 'createdAt'>>
  ): void => {
    setProjects(prev => prev.map(project => {
      if (project.id !== id) return project;
      return {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  // Delete project
  const deleteProject = useCallback((id: string): void => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  // Update project status
  const updateStatus = useCallback((id: string, status: ProjectStatus): void => {
    const updates: Partial<Project> = { status };

    // Auto-set dates based on status
    if (status === 'in_progress') {
      const project = projects.find(p => p.id === id);
      if (project && !project.startDate) {
        updates.startDate = new Date().toISOString().split('T')[0];
      }
    } else if (status === 'completed') {
      updates.completionDate = new Date().toISOString().split('T')[0];
    }

    updateProject(id, updates);
  }, [projects, updateProject]);

  // Add expense to project
  const addExpense = useCallback((
    projectId: string,
    data: Omit<Expense, 'id' | 'totalCost' | 'createdAt' | 'updatedAt'>
  ): void => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...data,
      id: generateId(),
      totalCost: data.quantity * data.unitCost,
      createdAt: now,
      updatedAt: now,
    };

    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        expenses: [...project.expenses, newExpense],
        updatedAt: now,
      };
    }));
  }, []);

  // Update expense
  const updateExpense = useCallback((
    projectId: string,
    expenseId: string,
    updates: Partial<Omit<Expense, 'id' | 'createdAt'>>
  ): void => {
    const now = new Date().toISOString();

    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        expenses: project.expenses.map(exp => {
          if (exp.id !== expenseId) return exp;
          const updated = { ...exp, ...updates, updatedAt: now };
          // Recalculate total if quantity or unit cost changed
          if (updates.quantity !== undefined || updates.unitCost !== undefined) {
            updated.totalCost = updated.quantity * updated.unitCost;
          }
          return updated;
        }),
        updatedAt: now,
      };
    }));
  }, []);

  // Delete expense
  const deleteExpense = useCallback((projectId: string, expenseId: string): void => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      return {
        ...project,
        expenses: project.expenses.filter(exp => exp.id !== expenseId),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, []);

  // Filter projects
  const filterProjects = useCallback((filters: ProjectFilters): Project[] => {
    return projects.filter(project => {
      // Status filter
      if (filters.status && project.status !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const searchFields = [
          project.name,
          project.customerName,
          project.address,
          project.city,
        ].map(f => f.toLowerCase());

        if (!searchFields.some(f => f.includes(search))) {
          return false;
        }
      }

      // Date filters
      if (filters.dateFrom) {
        const projectDate = project.startDate || project.createdAt.split('T')[0];
        if (projectDate < filters.dateFrom) {
          return false;
        }
      }

      if (filters.dateTo) {
        const projectDate = project.completionDate || project.createdAt.split('T')[0];
        if (projectDate > filters.dateTo) {
          return false;
        }
      }

      return true;
    });
  }, [projects]);

  // Get project by ID
  const getProject = useCallback((id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  }, [projects]);

  return {
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
  };
}
