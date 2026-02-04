// Cost categories for deck construction projects
export type CostCategory =
  | 'materials'
  | 'labor'
  | 'permits'
  | 'equipment'
  | 'subcontractor'
  | 'overhead'
  | 'other';

export const COST_CATEGORIES: { value: CostCategory; label: string; color: string }[] = [
  { value: 'materials', label: 'Materials', color: '#2F5233' },
  { value: 'labor', label: 'Labor', color: '#3B82F6' },
  { value: 'permits', label: 'Permits & Fees', color: '#8B5CF6' },
  { value: 'equipment', label: 'Equipment', color: '#F59E0B' },
  { value: 'subcontractor', label: 'Subcontractor', color: '#EC4899' },
  { value: 'overhead', label: 'Overhead', color: '#6B7280' },
  { value: 'other', label: 'Other', color: '#14B8A6' },
];

// Project status workflow
export type ProjectStatus =
  | 'estimating'
  | 'quoted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'estimating', label: 'Estimating', color: '#F59E0B' },
  { value: 'quoted', label: 'Quoted', color: '#3B82F6' },
  { value: 'in_progress', label: 'In Progress', color: '#8B5CF6' },
  { value: 'completed', label: 'Completed', color: '#22C55E' },
  { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
];

// Individual expense/cost item
export interface Expense {
  id: string;
  category: CostCategory;
  description: string;
  vendor?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: string;
  notes?: string;
  receipt?: string; // URL or reference
  createdAt: string;
  updatedAt: string;
}

// Project with all costs
export interface Project {
  id: string;
  name: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  address: string;
  city: string;
  status: ProjectStatus;
  quoteAmount: number; // Original quote given to customer
  startDate?: string;
  completionDate?: string;
  expenses: Expense[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Cost summary by category
export interface CategorySummary {
  category: CostCategory;
  label: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}

// Project financial summary
export interface ProjectSummary {
  totalCosts: number;
  quoteAmount: number;
  profit: number;
  profitMargin: number;
  categorySummaries: CategorySummary[];
}

// Dashboard statistics
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  averageMargin: number;
}

// Filter options for project list
export interface ProjectFilters {
  status?: ProjectStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}
