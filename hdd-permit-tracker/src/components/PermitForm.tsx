import { useState } from 'react';
import type { Permit, PermitType, PermitStatus, Municipality } from '../types';
import { PERMIT_TYPE_LABELS, PERMIT_STATUS_LABELS } from '../types';
import { getTodayForInput } from '../utils/dates';

interface PermitFormProps {
  municipalities: Municipality[];
  initialData?: Permit;
  onSubmit: (
    data: Omit<
      Permit,
      'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'documents' | 'inspections'
    >
  ) => void;
  onCancel: () => void;
}

export function PermitForm({
  municipalities,
  initialData,
  onSubmit,
  onCancel,
}: PermitFormProps) {
  const [formData, setFormData] = useState({
    projectId: initialData?.projectId || '',
    projectAddress: initialData?.projectAddress || '',
    customerName: initialData?.customerName || '',
    permitNumber: initialData?.permitNumber || '',
    permitType: initialData?.permitType || ('deck' as PermitType),
    municipality: initialData?.municipality || '',
    status: initialData?.status || ('not_started' as PermitStatus),
    applicationDate: initialData?.applicationDate?.split('T')[0] || '',
    approvalDate: initialData?.approvalDate?.split('T')[0] || '',
    expirationDate: initialData?.expirationDate?.split('T')[0] || '',
    applicationFee: initialData?.applicationFee?.toString() || '',
    feePaid: initialData?.feePaid || false,
    feePaymentDate: initialData?.feePaymentDate?.split('T')[0] || '',
    notes: initialData?.notes || '',
    contactName: initialData?.contactName || '',
    contactPhone: initialData?.contactPhone || '',
    contactEmail: initialData?.contactEmail || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedMunicipality = municipalities.find(
    (m) => m.id === formData.municipality
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectAddress.trim()) {
      newErrors.projectAddress = 'Project address is required';
    }
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.municipality) {
      newErrors.municipality = 'Municipality is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      projectId: formData.projectId || `PRJ-${Date.now()}`,
      projectAddress: formData.projectAddress.trim(),
      customerName: formData.customerName.trim(),
      permitNumber: formData.permitNumber.trim() || undefined,
      permitType: formData.permitType,
      municipality: formData.municipality,
      status: formData.status,
      applicationDate: formData.applicationDate || undefined,
      approvalDate: formData.approvalDate || undefined,
      expirationDate: formData.expirationDate || undefined,
      applicationFee: formData.applicationFee
        ? parseFloat(formData.applicationFee)
        : undefined,
      feePaid: formData.feePaid,
      feePaymentDate: formData.feePaymentDate || undefined,
      notes: formData.notes.trim(),
      contactName: formData.contactName.trim() || undefined,
      contactPhone: formData.contactPhone.trim() || undefined,
      contactEmail: formData.contactEmail.trim() || undefined,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">
          {initialData ? 'Edit Permit' : 'New Permit'}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Enter the permit details below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Project Information */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Project Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="projectAddress"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Project Address *
              </label>
              <input
                type="text"
                id="projectAddress"
                value={formData.projectAddress}
                onChange={(e) =>
                  setFormData({ ...formData, projectAddress: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent ${
                  errors.projectAddress ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="123 Main St, Cincinnati, OH 45202"
              />
              {errors.projectAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.projectAddress}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Customer Name *
              </label>
              <input
                type="text"
                id="customerName"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent ${
                  errors.customerName ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="John Smith"
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="projectId"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Project ID
              </label>
              <input
                type="text"
                id="projectId"
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                placeholder="Auto-generated if empty"
              />
            </div>
          </div>
        </div>

        {/* Permit Details */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Permit Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="municipality"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Municipality *
              </label>
              <select
                id="municipality"
                value={formData.municipality}
                onChange={(e) =>
                  setFormData({ ...formData, municipality: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent ${
                  errors.municipality ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Select municipality...</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.county} County)
                  </option>
                ))}
              </select>
              {errors.municipality && (
                <p className="text-red-500 text-sm mt-1">{errors.municipality}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="permitType"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Permit Type
              </label>
              <select
                id="permitType"
                value={formData.permitType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    permitType: e.target.value as PermitType,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              >
                {Object.entries(PERMIT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as PermitStatus,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              >
                {Object.entries(PERMIT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="permitNumber"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Permit Number
              </label>
              <input
                type="text"
                id="permitNumber"
                value={formData.permitNumber}
                onChange={(e) =>
                  setFormData({ ...formData, permitNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                placeholder="Assigned after approval"
              />
            </div>

            <div>
              <label
                htmlFor="applicationDate"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Application Date
              </label>
              <input
                type="date"
                id="applicationDate"
                value={formData.applicationDate}
                onChange={(e) =>
                  setFormData({ ...formData, applicationDate: e.target.value })
                }
                max={getTodayForInput()}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="expirationDate"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Expiration Date
              </label>
              <input
                type="date"
                id="expirationDate"
                value={formData.expirationDate}
                onChange={(e) =>
                  setFormData({ ...formData, expirationDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Municipality Info */}
        {selectedMunicipality && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">
              {selectedMunicipality.name} Info
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Avg. Approval Time:</span>{' '}
                <span className="font-medium">
                  {selectedMunicipality.averageApprovalDays} days
                </span>
              </div>
              <div>
                <span className="text-slate-600">Deck Permit Fee:</span>{' '}
                <span className="font-medium">
                  ${selectedMunicipality.fees.deckPermit}
                </span>
              </div>
              {selectedMunicipality.contactPhone && (
                <div>
                  <span className="text-slate-600">Phone:</span>{' '}
                  <span className="font-medium">
                    {selectedMunicipality.contactPhone}
                  </span>
                </div>
              )}
              {selectedMunicipality.requirements.length > 0 && (
                <div className="md:col-span-2">
                  <span className="text-slate-600">Requirements:</span>{' '}
                  <span className="font-medium">
                    {selectedMunicipality.requirements.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fees */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Fees</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="applicationFee"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Application Fee
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-500">$</span>
                <input
                  type="number"
                  id="applicationFee"
                  value={formData.applicationFee}
                  onChange={(e) =>
                    setFormData({ ...formData, applicationFee: e.target.value })
                  }
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.feePaid}
                  onChange={(e) =>
                    setFormData({ ...formData, feePaid: e.target.checked })
                  }
                  className="w-4 h-4 text-[#2F5233] border-slate-300 rounded focus:ring-[#2F5233]"
                />
                <span className="text-sm font-medium text-slate-700">
                  Fee Paid
                </span>
              </label>
            </div>

            {formData.feePaid && (
              <div>
                <label
                  htmlFor="feePaymentDate"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Payment Date
                </label>
                <input
                  type="date"
                  id="feePaymentDate"
                  value={formData.feePaymentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, feePaymentDate: e.target.value })
                  }
                  max={getTodayForInput()}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Municipality Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="contactName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Contact Name
              </label>
              <input
                type="text"
                id="contactName"
                value={formData.contactName}
                onChange={(e) =>
                  setFormData({ ...formData, contactName: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                placeholder="Inspector name"
              />
            </div>

            <div>
              <label
                htmlFor="contactPhone"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Contact Phone
              </label>
              <input
                type="tel"
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                placeholder="(513) 555-0100"
              />
            </div>

            <div>
              <label
                htmlFor="contactEmail"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Contact Email
              </label>
              <input
                type="email"
                id="contactEmail"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                placeholder="inspector@city.gov"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-slate-700 mb-1"
          >
            Notes
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent resize-none"
            placeholder="Additional notes about this permit..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
            {initialData ? 'Save Changes' : 'Create Permit'}
          </button>
        </div>
      </form>
    </div>
  );
}
