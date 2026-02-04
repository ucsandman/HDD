import type { Customer, CustomerProject, CustomerMessage } from '../types';
import { DEMO_CUSTOMER, DEMO_PROJECT } from '../types';

const STORAGE_KEYS = {
  customers: 'hdd_portal_customers',
  projects: 'hdd_portal_projects',
  messages: 'hdd_portal_messages',
  currentSession: 'hdd_portal_session',
};

// Initialize with demo data if empty
export function initializeData(): void {
  const customers = loadCustomers();
  if (customers.length === 0) {
    saveCustomers([DEMO_CUSTOMER]);
    saveProjects([DEMO_PROJECT]);
  }
}

// Customer operations
export function loadCustomers(): Customer[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.customers);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCustomers(customers: Customer[]): void {
  localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
}

export function getCustomerByAccessCode(code: string): Customer | null {
  const customers = loadCustomers();
  return customers.find(c => c.accessCode.toUpperCase() === code.toUpperCase()) || null;
}

export function getCustomerById(id: string): Customer | null {
  const customers = loadCustomers();
  return customers.find(c => c.id === id) || null;
}

export function addCustomer(customer: Customer): void {
  const customers = loadCustomers();
  customers.push(customer);
  saveCustomers(customers);
}

export function updateCustomer(customer: Customer): void {
  const customers = loadCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index !== -1) {
    customers[index] = customer;
    saveCustomers(customers);
  }
}

export function deleteCustomer(id: string): void {
  const customers = loadCustomers();
  saveCustomers(customers.filter(c => c.id !== id));
  // Also delete associated projects and messages
  const projects = loadProjects();
  saveProjects(projects.filter(p => p.customerId !== id));
  const messages = loadMessages();
  saveMessages(messages.filter(m => m.customerId !== id));
}

// Project operations
export function loadProjects(): CustomerProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.projects);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: CustomerProject[]): void {
  localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
}

export function getProjectsByCustomerId(customerId: string): CustomerProject[] {
  const projects = loadProjects();
  return projects.filter(p => p.customerId === customerId);
}

export function getProjectById(id: string): CustomerProject | null {
  const projects = loadProjects();
  return projects.find(p => p.id === id) || null;
}

export function addProject(project: CustomerProject): void {
  const projects = loadProjects();
  projects.push(project);
  saveProjects(projects);
}

export function updateProject(project: CustomerProject): void {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === project.id);
  if (index !== -1) {
    projects[index] = { ...project, updatedAt: new Date().toISOString() };
    saveProjects(projects);
  }
}

export function deleteProject(id: string): void {
  const projects = loadProjects();
  saveProjects(projects.filter(p => p.id !== id));
  // Also delete associated messages
  const messages = loadMessages();
  saveMessages(messages.filter(m => m.projectId !== id));
}

// Message operations
export function loadMessages(): CustomerMessage[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.messages);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMessages(messages: CustomerMessage[]): void {
  localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
}

export function getMessagesByProjectId(projectId: string): CustomerMessage[] {
  const messages = loadMessages();
  return messages.filter(m => m.projectId === projectId).sort((a, b) =>
    new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
}

export function addMessage(message: CustomerMessage): void {
  const messages = loadMessages();
  messages.push(message);
  saveMessages(messages);
}

export function markMessageRead(id: string): void {
  const messages = loadMessages();
  const index = messages.findIndex(m => m.id === id);
  if (index !== -1) {
    messages[index].read = true;
    saveMessages(messages);
  }
}

export function getUnreadMessageCount(customerId: string): number {
  const messages = loadMessages();
  return messages.filter(m => m.customerId === customerId && !m.read).length;
}

// Session management
export function saveSession(customerId: string): void {
  localStorage.setItem(STORAGE_KEYS.currentSession, customerId);
}

export function getSession(): string | null {
  return localStorage.getItem(STORAGE_KEYS.currentSession);
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.currentSession);
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
