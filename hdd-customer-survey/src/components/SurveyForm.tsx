import { useState } from 'react';
import { generateId } from '../utils/storage';

interface SurveyFormData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  projectName: string;
}

interface SurveyFormProps {
  onSubmit: (data: SurveyFormData) => void;
  onCancel: () => void;
}

export function SurveyForm({ onSubmit, onCancel }: SurveyFormProps) {
  const [formData, setFormData] = useState<SurveyFormData>({
    customerId: generateId(),
    customerName: '',
    customerEmail: '',
    projectName: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SurveyFormData, string>>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,63}$/;
    return emailRegex.test(email);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SurveyFormData, string>> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email is required';
    } else if (!validateEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format';
    }

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
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

  const handleChange = (field: keyof SurveyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Customer Name *
        </label>
        <input
          type="text"
          value={formData.customerName}
          onChange={(e) => handleChange('customerName', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F5233] ${
            errors.customerName ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="John Smith"
        />
        {errors.customerName && (
          <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
        )}
      </div>

      {/* Customer Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Customer Email *
        </label>
        <input
          type="email"
          value={formData.customerEmail}
          onChange={(e) => handleChange('customerEmail', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F5233] ${
            errors.customerEmail ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="john@example.com"
        />
        {errors.customerEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
        )}
      </div>

      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          value={formData.projectName}
          onChange={(e) => handleChange('projectName', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F5233] ${
            errors.projectName ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="Cedar Deck - 123 Main St"
        />
        {errors.projectName && (
          <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-[#2F5233] text-white font-medium rounded-lg hover:bg-[#243F28] transition-colors"
        >
          Create Survey
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
