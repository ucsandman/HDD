import { useState, useEffect, useCallback } from 'react';
import type {
  Customer,
  CustomerProject,
  CustomerMessage,
  PortalStats,
} from '../types';
import {
  initializeData,
  loadCustomers,
  saveCustomers,
  getCustomerByAccessCode,
  getCustomerById,
  loadProjects,
  saveProjects,
  getProjectsByCustomerId,
  getProjectById,
  loadMessages,
  saveMessages,
  getMessagesByProjectId,
  addMessage as addMessageStorage,
  markMessageRead as markMessageReadStorage,
  getUnreadMessageCount,
  saveSession,
  getSession,
  clearSession,
  generateId,
} from '../utils/storage';

// Customer portal hook (customer-facing)
export function useCustomerPortal() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [projects, setProjects] = useState<CustomerProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    initializeData();
    const sessionId = getSession();
    if (sessionId) {
      const existingCustomer = getCustomerById(sessionId);
      if (existingCustomer) {
        setCustomer(existingCustomer);
        setProjects(getProjectsByCustomerId(existingCustomer.id));
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((accessCode: string): boolean => {
    setError(null);
    const foundCustomer = getCustomerByAccessCode(accessCode);
    if (foundCustomer) {
      setCustomer(foundCustomer);
      setProjects(getProjectsByCustomerId(foundCustomer.id));
      saveSession(foundCustomer.id);
      return true;
    }
    setError('Invalid access code. Please try again.');
    return false;
  }, []);

  const logout = useCallback(() => {
    setCustomer(null);
    setProjects([]);
    clearSession();
  }, []);

  const getProject = useCallback((id: string): CustomerProject | null => {
    return getProjectById(id);
  }, []);

  const sendMessage = useCallback((projectId: string, message: string) => {
    if (!customer) return;

    const newMessage: CustomerMessage = {
      id: generateId(),
      projectId,
      customerId: customer.id,
      message,
      sentAt: new Date().toISOString(),
      read: false,
    };

    addMessageStorage(newMessage);
  }, [customer]);

  const getMessages = useCallback((projectId: string): CustomerMessage[] => {
    return getMessagesByProjectId(projectId);
  }, []);

  const unreadCount = customer ? getUnreadMessageCount(customer.id) : 0;

  return {
    customer,
    projects,
    isLoading,
    error,
    login,
    logout,
    getProject,
    sendMessage,
    getMessages,
    unreadCount,
  };
}

// Admin portal hook (admin-facing)
export function useAdminPortal() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<CustomerProject[]>([]);
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    initializeData();
    setCustomers(loadCustomers());
    setProjects(loadProjects());
    setMessages(loadMessages());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Customer CRUD
  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...customers, newCustomer];
    saveCustomers(updated);
    setCustomers(updated);
    return newCustomer;
  }, [customers]);

  const updateCustomer = useCallback((customer: Customer) => {
    const updated = customers.map(c => c.id === customer.id ? customer : c);
    saveCustomers(updated);
    setCustomers(updated);
  }, [customers]);

  const deleteCustomer = useCallback((id: string) => {
    const updatedCustomers = customers.filter(c => c.id !== id);
    const updatedProjects = projects.filter(p => p.customerId !== id);
    const updatedMessages = messages.filter(m => m.customerId !== id);

    saveCustomers(updatedCustomers);
    saveProjects(updatedProjects);
    saveMessages(updatedMessages);

    setCustomers(updatedCustomers);
    setProjects(updatedProjects);
    setMessages(updatedMessages);
  }, [customers, projects, messages]);

  // Project CRUD
  const addProject = useCallback((projectData: Omit<CustomerProject, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProject: CustomerProject = {
      ...projectData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...projects, newProject];
    saveProjects(updated);
    setProjects(updated);
    return newProject;
  }, [projects]);

  const updateProject = useCallback((project: CustomerProject) => {
    const updated = projects.map(p =>
      p.id === project.id
        ? { ...project, updatedAt: new Date().toISOString() }
        : p
    );
    saveProjects(updated);
    setProjects(updated);
  }, [projects]);

  const deleteProject = useCallback((id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    const updatedMessages = messages.filter(m => m.projectId !== id);

    saveProjects(updatedProjects);
    saveMessages(updatedMessages);

    setProjects(updatedProjects);
    setMessages(updatedMessages);
  }, [projects, messages]);

  // Status updates
  const updateProjectStatus = useCallback((projectId: string, status: CustomerProject['status'], message?: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      status,
      updatedAt: new Date().toISOString(),
      updates: message
        ? [
            ...project.updates,
            {
              id: generateId(),
              message,
              date: new Date().toISOString().split('T')[0],
              isFromCustomer: false,
            },
          ]
        : project.updates,
    };

    const updated = projects.map(p => (p.id === projectId ? updatedProject : p));
    saveProjects(updated);
    setProjects(updated);
  }, [projects]);

  // Message handling
  const markAsRead = useCallback((messageId: string) => {
    markMessageReadStorage(messageId);
    setMessages(loadMessages());
  }, []);

  const replyToMessage = useCallback((projectId: string, _customerId: string, message: string) => {
    // Add reply as a project update
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString(),
      updates: [
        ...project.updates,
        {
          id: generateId(),
          message,
          date: new Date().toISOString().split('T')[0],
          isFromCustomer: false,
        },
      ],
    };

    const updated = projects.map(p => (p.id === projectId ? updatedProject : p));
    saveProjects(updated);
    setProjects(updated);
  }, [projects]);

  // Stats
  const stats: PortalStats = {
    totalCustomers: customers.length,
    activeProjects: projects.filter(p =>
      !['complete', 'quote_sent'].includes(p.status)
    ).length,
    pendingMessages: messages.filter(m => !m.read).length,
    completedThisMonth: projects.filter(p => {
      if (p.status !== 'complete') return false;
      const updated = new Date(p.updatedAt);
      const now = new Date();
      return updated.getMonth() === now.getMonth() &&
             updated.getFullYear() === now.getFullYear();
    }).length,
  };

  return {
    customers,
    projects,
    messages,
    isLoading,
    stats,
    refresh,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    markAsRead,
    replyToMessage,
    getProjectsByCustomerId,
  };
}
