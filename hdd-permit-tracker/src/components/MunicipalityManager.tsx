import { useState } from 'react';
import type { Municipality } from '../types';

interface MunicipalityManagerProps {
  municipalities: Municipality[];
  onAdd: (municipality: Omit<Municipality, 'id'>) => Municipality;
  onUpdate: (id: string, updates: Partial<Municipality>) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function MunicipalityManager({
  municipalities,
  onAdd,
  onUpdate,
  onDelete,
  onBack,
}: MunicipalityManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMunicipalities = municipalities.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.county.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (municipality: Municipality) => {
    setEditingId(municipality.id);
    setShowForm(true);
  };

  const handleSave = (data: Omit<Municipality, 'id'>) => {
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const editingMunicipality = editingId
    ? municipalities.find((m) => m.id === editingId)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Municipalities
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Manage municipality information and permit requirements
              </p>
            </div>
            <button
              onClick={() => {
                setEditingId(null);
                setShowForm(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-[#2F5233] hover:bg-[#234025] rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Municipality
            </button>
          </div>

          <div className="mt-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search municipalities..."
              className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredMunicipalities.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {searchTerm
                ? 'No municipalities match your search'
                : 'No municipalities configured yet'}
            </div>
          ) : (
            filteredMunicipalities.map((municipality) => (
              <div
                key={municipality.id}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-900">
                        {municipality.name}
                      </h3>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {municipality.county} County
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm text-slate-600">
                      <div>
                        <span className="text-slate-500">Deck Permit:</span>{' '}
                        ${municipality.fees.deckPermit}
                      </div>
                      <div>
                        <span className="text-slate-500">Inspection:</span>{' '}
                        ${municipality.fees.inspectionFee}
                      </div>
                      <div>
                        <span className="text-slate-500">Avg. Approval:</span>{' '}
                        {municipality.averageApprovalDays} days
                      </div>
                      {municipality.contactPhone && (
                        <div>
                          <span className="text-slate-500">Phone:</span>{' '}
                          {municipality.contactPhone}
                        </div>
                      )}
                    </div>
                    {municipality.requirements.length > 0 && (
                      <div className="text-sm text-slate-600 mt-2">
                        <span className="text-slate-500">Requirements:</span>{' '}
                        {municipality.requirements.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(municipality)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(municipality.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
            <MunicipalityForm
              initialData={editingMunicipality}
              onSubmit={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface MunicipalityFormProps {
  initialData?: Municipality;
  onSubmit: (data: Omit<Municipality, 'id'>) => void;
  onCancel: () => void;
}

function MunicipalityForm({
  initialData,
  onSubmit,
  onCancel,
}: MunicipalityFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    county: initialData?.county || '',
    website: initialData?.website || '',
    permitPortalUrl: initialData?.permitPortalUrl || '',
    contactPhone: initialData?.contactPhone || '',
    contactEmail: initialData?.contactEmail || '',
    averageApprovalDays: initialData?.averageApprovalDays?.toString() || '14',
    deckPermitFee: initialData?.fees.deckPermit?.toString() || '',
    inspectionFee: initialData?.fees.inspectionFee?.toString() || '',
    requirements: initialData?.requirements?.join('\n') || '',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.county.trim()) {
      newErrors.county = 'County is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const requirements = formData.requirements
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    onSubmit({
      name: formData.name.trim(),
      county: formData.county.trim(),
      website: formData.website.trim() || undefined,
      permitPortalUrl: formData.permitPortalUrl.trim() || undefined,
      contactPhone: formData.contactPhone.trim() || undefined,
      contactEmail: formData.contactEmail.trim() || undefined,
      averageApprovalDays: parseInt(formData.averageApprovalDays) || 14,
      fees: {
        deckPermit: parseFloat(formData.deckPermitFee) || 0,
        inspectionFee: parseFloat(formData.inspectionFee) || 0,
      },
      requirements,
      notes: formData.notes.trim(),
    });
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        {initialData ? 'Edit Municipality' : 'Add Municipality'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="City of Cincinnati"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              County *
            </label>
            <input
              type="text"
              value={formData.county}
              onChange={(e) =>
                setFormData({ ...formData, county: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent ${
                errors.county ? 'border-red-500' : 'border-slate-300'
              }`}
              placeholder="Hamilton"
            />
            {errors.county && (
              <p className="text-red-500 text-sm mt-1">{errors.county}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              placeholder="https://www.city.gov"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Permit Portal URL
            </label>
            <input
              type="url"
              value={formData.permitPortalUrl}
              onChange={(e) =>
                setFormData({ ...formData, permitPortalUrl: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              placeholder="https://permits.city.gov"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) =>
                setFormData({ ...formData, contactPhone: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              placeholder="(513) 555-0100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) =>
                setFormData({ ...formData, contactEmail: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              placeholder="permits@city.gov"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Deck Permit Fee
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500">$</span>
              <input
                type="number"
                value={formData.deckPermitFee}
                onChange={(e) =>
                  setFormData({ ...formData, deckPermitFee: e.target.value })
                }
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                placeholder="150"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Inspection Fee
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-500">$</span>
              <input
                type="number"
                value={formData.inspectionFee}
                onChange={(e) =>
                  setFormData({ ...formData, inspectionFee: e.target.value })
                }
                className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                placeholder="75"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Avg. Approval Days
            </label>
            <input
              type="number"
              value={formData.averageApprovalDays}
              onChange={(e) =>
                setFormData({ ...formData, averageApprovalDays: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              placeholder="14"
              min="1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Requirements (one per line)
          </label>
          <textarea
            value={formData.requirements}
            onChange={(e) =>
              setFormData({ ...formData, requirements: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent resize-none"
            placeholder="Site plan&#10;Construction drawings&#10;HOA approval letter"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent resize-none"
            placeholder="Additional notes about this municipality..."
          />
        </div>

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
            {initialData ? 'Save Changes' : 'Add Municipality'}
          </button>
        </div>
      </form>
    </div>
  );
}
