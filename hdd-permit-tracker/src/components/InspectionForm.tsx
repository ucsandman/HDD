import { useState } from 'react';
import type { Inspection, InspectionType, InspectionStatus, InspectionResult } from '../types';
import {
  INSPECTION_TYPE_LABELS,
  INSPECTION_STATUS_LABELS,
  INSPECTION_RESULT_LABELS,
} from '../types';

interface InspectionFormProps {
  initialData?: Inspection;
  onSubmit: (inspection: Omit<Inspection, 'id'>) => void;
  onCancel: () => void;
}

export function InspectionForm({
  initialData,
  onSubmit,
  onCancel,
}: InspectionFormProps) {
  const [formData, setFormData] = useState({
    type: initialData?.type || ('footing' as InspectionType),
    status: initialData?.status || ('not_scheduled' as InspectionStatus),
    scheduledDate: initialData?.scheduledDate?.split('T')[0] || '',
    completedDate: initialData?.completedDate?.split('T')[0] || '',
    inspector: initialData?.inspector || '',
    result: initialData?.result || ('' as InspectionResult | ''),
    notes: initialData?.notes || '',
    corrections: initialData?.corrections?.join('\n') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const corrections = formData.corrections
      .split('\n')
      .map((c) => c.trim())
      .filter(Boolean);

    onSubmit({
      type: formData.type,
      status: formData.status,
      scheduledDate: formData.scheduledDate || undefined,
      completedDate: formData.completedDate || undefined,
      inspector: formData.inspector || undefined,
      result: formData.result || undefined,
      notes: formData.notes || undefined,
      corrections: corrections.length > 0 ? corrections : undefined,
    });
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        {initialData ? 'Edit Inspection' : 'Schedule Inspection'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as InspectionType })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
            >
              {Object.entries(INSPECTION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as InspectionStatus,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
            >
              {Object.entries(INSPECTION_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Scheduled Date
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) =>
                setFormData({ ...formData, scheduledDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Completed Date
            </label>
            <input
              type="date"
              value={formData.completedDate}
              onChange={(e) =>
                setFormData({ ...formData, completedDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Inspector Name
            </label>
            <input
              type="text"
              value={formData.inspector}
              onChange={(e) =>
                setFormData({ ...formData, inspector: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Result
            </label>
            <select
              value={formData.result}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  result: e.target.value as InspectionResult | '',
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
            >
              <option value="">Not yet inspected</option>
              {Object.entries(INSPECTION_RESULT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent resize-none"
            placeholder="Optional notes about this inspection..."
          />
        </div>

        {(formData.result === 'failed' || formData.result === 'conditional') && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Corrections Required (one per line)
            </label>
            <textarea
              value={formData.corrections}
              onChange={(e) =>
                setFormData({ ...formData, corrections: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent resize-none"
              placeholder="Enter each correction on a new line..."
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-[#2F5233] hover:bg-[#234025] rounded-lg transition-colors"
          >
            {initialData ? 'Save Changes' : 'Add Inspection'}
          </button>
        </div>
      </form>
    </div>
  );
}
