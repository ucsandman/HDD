import { useState } from 'react';
import type { Project, ProjectStatus } from '../types';
import { PROJECT_STATUSES } from '../types';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: Omit<Project, 'id' | 'expenses' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    customerName: project?.customerName || '',
    customerEmail: project?.customerEmail || '',
    customerPhone: project?.customerPhone || '',
    address: project?.address || '',
    city: project?.city || 'Cincinnati',
    status: project?.status || 'estimating' as ProjectStatus,
    quoteAmount: project?.quoteAmount?.toString() || '',
    startDate: project?.startDate || '',
    completionDate: project?.completionDate || '',
    notes: project?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.quoteAmount || parseFloat(formData.quoteAmount) <= 0) {
      newErrors.quoteAmount = 'Valid quote amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      customerName: formData.customerName.trim(),
      customerEmail: formData.customerEmail.trim() || undefined,
      customerPhone: formData.customerPhone.trim() || undefined,
      address: formData.address.trim(),
      city: formData.city.trim(),
      status: formData.status,
      quoteAmount: parseFloat(formData.quoteAmount),
      startDate: formData.startDate || undefined,
      completionDate: formData.completionDate || undefined,
      notes: formData.notes.trim() || undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          {project ? 'Edit Project' : 'Create New Project'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Project Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Project Information</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Smith Deck Project"
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quoteAmount}
                  onChange={e => setFormData(prev => ({ ...prev, quoteAmount: e.target.value }))}
                  placeholder="0.00"
                  className={`w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                    errors.quoteAmount ? 'border-red-500' : ''
                  }`}
                />
              </div>
              {errors.quoteAmount && <p className="mt-1 text-sm text-red-600">{errors.quoteAmount}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                {PROJECT_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Customer Information</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="John Smith"
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.customerName ? 'border-red-500' : ''
                }`}
              />
              {errors.customerName && <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="(513) 555-0123"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={e => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
              placeholder="john@example.com"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Project Location</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main Street"
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.address ? 'border-red-500' : ''
                }`}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Cincinnati"
                className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.city ? 'border-red-500' : ''
                }`}
              />
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Project Dates</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Date
              </label>
              <input
                type="date"
                value={formData.completionDate}
                onChange={e => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional notes about this project..."
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            className="flex-1 bg-[#2F5233] text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {project ? 'Save Changes' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
