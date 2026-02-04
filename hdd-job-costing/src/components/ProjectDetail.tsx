import { useState } from 'react';
import type { Project, Expense, ProjectStatus } from '../types';
import { PROJECT_STATUSES, COST_CATEGORIES } from '../types';
import { StatusBadge, CategoryBadge } from './StatusBadge';
import { CostBreakdown } from './CostBreakdown';
import { ExpenseForm } from './ExpenseForm';
import { ProjectForm } from './ProjectForm';
import { formatCurrency, calculateProjectSummary, exportExpensesToCSV } from '../utils/storage';

interface ProjectDetailProps {
  project: Project;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onUpdateStatus: (id: string, status: ProjectStatus) => void;
  onAddExpense: (projectId: string, data: Omit<Expense, 'id' | 'totalCost' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateExpense: (projectId: string, expenseId: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (projectId: string, expenseId: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

type TabType = 'overview' | 'expenses' | 'edit';

export function ProjectDetail({
  project,
  onUpdate,
  onUpdateStatus,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onDelete,
  onClose,
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const summary = calculateProjectSummary(project);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'expenses', label: `Expenses (${project.expenses.length})` },
    { id: 'edit', label: 'Edit' },
  ];

  const handleAddExpense = (data: Omit<Expense, 'id' | 'totalCost' | 'createdAt' | 'updatedAt'>) => {
    onAddExpense(project.id, data);
    setShowExpenseForm(false);
  };

  const handleEditExpense = (data: Omit<Expense, 'id' | 'totalCost' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      onUpdateExpense(project.id, editingExpense.id, data);
      setEditingExpense(null);
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenseToDelete(expenseId);
  };

  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      onDeleteExpense(project.id, expenseToDelete);
      setExpenseToDelete(null);
    }
  };

  const handleUpdateProject = (data: Omit<Project, 'id' | 'expenses' | 'createdAt' | 'updatedAt'>) => {
    onUpdate(project.id, data);
    setActiveTab('overview');
  };

  const handleDelete = () => {
    onDelete(project.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 overflow-y-auto z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-gray-600">
                {project.customerName} • {project.address}, {project.city}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>

          {/* Quick Status Change */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={project.status}
              onChange={e => onUpdateStatus(project.id, e.target.value as ProjectStatus)}
              className="text-sm rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
            >
              {PROJECT_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex gap-4 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <CostBreakdown summary={summary} />

              {/* Project Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Customer</dt>
                    <dd className="font-medium text-gray-900">{project.customerName}</dd>
                  </div>
                  {project.customerPhone && (
                    <div>
                      <dt className="text-sm text-gray-500">Phone</dt>
                      <dd className="font-medium text-gray-900">{project.customerPhone}</dd>
                    </div>
                  )}
                  {project.customerEmail && (
                    <div>
                      <dt className="text-sm text-gray-500">Email</dt>
                      <dd className="font-medium text-gray-900">{project.customerEmail}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-500">Address</dt>
                    <dd className="font-medium text-gray-900">{project.address}, {project.city}</dd>
                  </div>
                  {project.startDate && (
                    <div>
                      <dt className="text-sm text-gray-500">Start Date</dt>
                      <dd className="font-medium text-gray-900">{project.startDate}</dd>
                    </div>
                  )}
                  {project.completionDate && (
                    <div>
                      <dt className="text-sm text-gray-500">Completion Date</dt>
                      <dd className="font-medium text-gray-900">{project.completionDate}</dd>
                    </div>
                  )}
                </dl>
                {project.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <dt className="text-sm text-gray-500 mb-1">Notes</dt>
                    <dd className="text-gray-900">{project.notes}</dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-4">
              {/* Add Expense Button */}
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Expenses</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportExpensesToCSV(project)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                    disabled={project.expenses.length === 0}
                  >
                    <span>📥</span> Export
                  </button>
                  <button
                    onClick={() => setShowExpenseForm(true)}
                    className="px-4 py-2 bg-[#2F5233] text-white rounded-lg hover:bg-green-700"
                  >
                    + Add Expense
                  </button>
                </div>
              </div>

              {/* Expense Form */}
              {showExpenseForm && (
                <ExpenseForm
                  onSubmit={handleAddExpense}
                  onCancel={() => setShowExpenseForm(false)}
                />
              )}

              {editingExpense && (
                <ExpenseForm
                  expense={editingExpense}
                  onSubmit={handleEditExpense}
                  onCancel={() => setEditingExpense(null)}
                />
              )}

              {/* Expenses List */}
              {project.expenses.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No expenses recorded yet. Add your first expense to start tracking costs.
                </div>
              ) : (
                <div className="space-y-2">
                  {project.expenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(expense => (
                      <div
                        key={expense.id}
                        className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <CategoryBadge category={expense.category} />
                              <span className="text-sm text-gray-500">{expense.date}</span>
                            </div>
                            <div className="font-medium text-gray-900">{expense.description}</div>
                            {expense.vendor && (
                              <div className="text-sm text-gray-500">Vendor: {expense.vendor}</div>
                            )}
                            <div className="text-sm text-gray-500">
                              {expense.quantity} × {formatCurrency(expense.unitCost)}
                            </div>
                            {expense.notes && (
                              <div className="text-sm text-gray-400 mt-1">{expense.notes}</div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {formatCurrency(expense.totalCost)}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => setEditingExpense(expense)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Delete Expense Confirmation */}
              {expenseToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Expense?</h4>
                    <p className="text-gray-600 mb-4">This action cannot be undone.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={confirmDeleteExpense}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setExpenseToDelete(null)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="space-y-6">
              <ProjectForm
                project={project}
                onSubmit={handleUpdateProject}
                onCancel={() => setActiveTab('overview')}
              />

              {/* Delete Project */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-600 mb-3">
                  Deleting this project will remove all associated expenses and cannot be undone.
                </p>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Project
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Project Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Project?</h4>
              <p className="text-gray-600 mb-4">
                This will permanently delete "{project.name}" and all its expenses.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
