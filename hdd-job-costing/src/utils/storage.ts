import type { Project, ProjectSummary, DashboardStats, CategorySummary, CostCategory } from '../types';
import { COST_CATEGORIES } from '../types';

const STORAGE_KEY = 'hdd-job-costing-projects';

// Load all projects from localStorage
export function loadProjects(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    console.error('Failed to load projects');
    return [];
  }
}

// Save all projects to localStorage
export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    console.error('Failed to save projects');
  }
}

// Calculate project summary
export function calculateProjectSummary(project: Project): ProjectSummary {
  const totalCosts = project.expenses.reduce((sum, exp) => sum + exp.totalCost, 0);
  const profit = project.quoteAmount - totalCosts;
  const profitMargin = project.quoteAmount > 0 ? (profit / project.quoteAmount) * 100 : 0;

  // Group by category
  const categoryTotals: Record<CostCategory, { total: number; count: number }> = {
    materials: { total: 0, count: 0 },
    labor: { total: 0, count: 0 },
    permits: { total: 0, count: 0 },
    equipment: { total: 0, count: 0 },
    subcontractor: { total: 0, count: 0 },
    overhead: { total: 0, count: 0 },
    other: { total: 0, count: 0 },
  };

  project.expenses.forEach(exp => {
    categoryTotals[exp.category].total += exp.totalCost;
    categoryTotals[exp.category].count += 1;
  });

  const categorySummaries: CategorySummary[] = COST_CATEGORIES.map(cat => ({
    category: cat.value,
    label: cat.label,
    color: cat.color,
    total: categoryTotals[cat.value].total,
    count: categoryTotals[cat.value].count,
    percentage: totalCosts > 0 ? (categoryTotals[cat.value].total / totalCosts) * 100 : 0,
  }));

  return {
    totalCosts,
    quoteAmount: project.quoteAmount,
    profit,
    profitMargin,
    categorySummaries,
  };
}

// Calculate dashboard statistics
export function calculateDashboardStats(projects: Project[]): DashboardStats {
  const completedProjects = projects.filter(p => p.status === 'completed');
  const activeProjects = projects.filter(p => p.status === 'in_progress');

  let totalRevenue = 0;
  let totalCosts = 0;

  completedProjects.forEach(project => {
    totalRevenue += project.quoteAmount;
    totalCosts += project.expenses.reduce((sum, exp) => sum + exp.totalCost, 0);
  });

  const totalProfit = totalRevenue - totalCosts;
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    totalProjects: projects.length,
    activeProjects: activeProjects.length,
    totalRevenue,
    totalCosts,
    totalProfit,
    averageMargin,
  };
}

// Export projects to CSV
export function exportToCSV(projects: Project[]): void {
  const escapeCSV = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    const str = String(value);
    // CSV injection prevention
    if (/^[=+\-@\t\r]/.test(str)) {
      return `"'${str.replace(/"/g, '""')}"`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    'Project Name',
    'Customer',
    'Address',
    'City',
    'Status',
    'Quote Amount',
    'Total Costs',
    'Profit',
    'Margin %',
    'Start Date',
    'Completion Date',
  ];

  const rows = projects.map(project => {
    const summary = calculateProjectSummary(project);
    return [
      escapeCSV(project.name),
      escapeCSV(project.customerName),
      escapeCSV(project.address),
      escapeCSV(project.city),
      escapeCSV(project.status),
      escapeCSV(project.quoteAmount.toFixed(2)),
      escapeCSV(summary.totalCosts.toFixed(2)),
      escapeCSV(summary.profit.toFixed(2)),
      escapeCSV(summary.profitMargin.toFixed(1)),
      escapeCSV(project.startDate || ''),
      escapeCSV(project.completionDate || ''),
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `job-costing-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Export detailed expenses to CSV
export function exportExpensesToCSV(project: Project): void {
  const escapeCSV = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (/^[=+\-@\t\r]/.test(str)) {
      return `"'${str.replace(/"/g, '""')}"`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = [
    'Date',
    'Category',
    'Description',
    'Vendor',
    'Quantity',
    'Unit Cost',
    'Total Cost',
    'Notes',
  ];

  const rows = project.expenses.map(exp => [
    escapeCSV(exp.date),
    escapeCSV(exp.category),
    escapeCSV(exp.description),
    escapeCSV(exp.vendor || ''),
    escapeCSV(exp.quantity),
    escapeCSV(exp.unitCost.toFixed(2)),
    escapeCSV(exp.totalCost.toFixed(2)),
    escapeCSV(exp.notes || ''),
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.name.replace(/[^a-z0-9]/gi, '-')}-expenses-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
