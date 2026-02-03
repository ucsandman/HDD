import { useState } from 'react';
import type { Project, ProjectStatus } from '../types';
import { PROJECT_TYPES } from '../types';
import { validatePhone, validateEmail } from '../utils/helpers';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
}

export interface ProjectFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  projectType: string;
  address: string;
  status: ProjectStatus;
  scheduledStartDate: string;
  estimatedCompletion: string;
  notes: string;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    customerName: project?.customerName || '',
    customerPhone: project?.customerPhone || '',
    customerEmail: project?.customerEmail || '',
    projectType: project?.projectType || '',
    address: project?.address || '',
    status: project?.status || 'quoted',
    scheduledStartDate: project?.scheduledStartDate || '',
    estimatedCompletion: project?.estimatedCompletion || '',
    notes: project?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!validatePhone(formData.customerPhone)) {
      newErrors.customerPhone = 'Invalid phone number';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!validateEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email address';
    }

    if (!formData.projectType) {
      newErrors.projectType = 'Project type is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    field: keyof ProjectFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Customer Name *
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerName ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="John Smith"
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Project Type *
          </label>
          <select
            value={formData.projectType}
            onChange={(e) => handleChange('projectType', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.projectType ? 'border-red-500' : 'border-slate-300'
            }`}
          >
            <option value="">Select type...</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.projectType && (
            <p className="mt-1 text-sm text-red-600">{errors.projectType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => handleChange('customerPhone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerPhone ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="(513) 555-0123"
          />
          {errors.customerPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => handleChange('customerEmail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.customerEmail ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="john@example.com"
          />
          {errors.customerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Project Address *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.address ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="123 Main St, Cincinnati, OH 45201"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as ProjectStatus)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="quoted">Quoted</option>
            <option value="sold">Sold</option>
            <option value="materials_ordered">Materials Ordered</option>
            <option value="materials_received">Materials Received</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="inspection_scheduled">Inspection Scheduled</option>
            <option value="complete">Complete</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Scheduled Start Date
          </label>
          <input
            type="date"
            value={formData.scheduledStartDate}
            onChange={(e) => handleChange('scheduledStartDate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Estimated Completion
          </label>
          <input
            type="date"
            value={formData.estimatedCompletion}
            onChange={(e) => handleChange('estimatedCompletion', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes about this project..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {project ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
