import { useState } from 'react';
import type { Expense, CostCategory } from '../types';
import { COST_CATEGORIES } from '../types';

interface ExpenseFormProps {
  expense?: Expense;
  onSubmit: (data: Omit<Expense, 'id' | 'totalCost' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ExpenseForm({ expense, onSubmit, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    category: expense?.category || 'materials' as CostCategory,
    description: expense?.description || '',
    vendor: expense?.vendor || '',
    quantity: expense?.quantity?.toString() || '1',
    unitCost: expense?.unitCost?.toString() || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    notes: expense?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculatedTotal = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.unitCost) || 0);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }
    if (!formData.unitCost || parseFloat(formData.unitCost) < 0) {
      newErrors.unitCost = 'Valid unit cost is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      category: formData.category,
      description: formData.description.trim(),
      vendor: formData.vendor.trim() || undefined,
      quantity: parseFloat(formData.quantity),
      unitCost: parseFloat(formData.unitCost),
      date: formData.date,
      notes: formData.notes.trim() || undefined,
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <h4 className="font-medium text-gray-900 mb-4">
        {expense ? 'Edit Expense' : 'Add Expense'}
      </h4>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as CostCategory }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              {COST_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                errors.date ? 'border-red-500' : ''
              }`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Composite decking boards"
              className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendor
            </label>
            <input
              type="text"
              value={formData.vendor}
              onChange={e => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
              placeholder="e.g., Home Depot"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.quantity}
              onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                errors.quantity ? 'border-red-500' : ''
              }`}
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Cost *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitCost}
                onChange={e => setFormData(prev => ({ ...prev, unitCost: e.target.value }))}
                placeholder="0.00"
                className={`w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.unitCost ? 'border-red-500' : ''
                }`}
              />
            </div>
            {errors.unitCost && <p className="mt-1 text-sm text-red-600">{errors.unitCost}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-lg font-medium text-gray-900">
              ${calculatedTotal.toFixed(2)}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional notes..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-[#2F5233] text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {expense ? 'Update Expense' : 'Add Expense'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
