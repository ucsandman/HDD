import { useState } from 'react';
import type { Supplier } from '../types';

interface SupplierListProps {
  suppliers: Supplier[];
  onCreate: (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Supplier>) => void;
  onDelete: (id: string) => void;
}

export function SupplierList({ suppliers, onCreate, onUpdate, onDelete }: SupplierListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    website: '',
    accountNumber: '',
    notes: '',
    isPreferred: false,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      phone: '',
      website: '',
      accountNumber: '',
      notes: '',
      isPreferred: false,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      location: supplier.location || '',
      phone: supplier.phone || '',
      website: supplier.website || '',
      accountNumber: supplier.accountNumber || '',
      notes: supplier.notes || '',
      isPreferred: supplier.isPreferred,
    });
    setEditingId(supplier.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const data = {
      name: formData.name.trim(),
      location: formData.location.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      website: formData.website.trim() || undefined,
      accountNumber: formData.accountNumber.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      isPreferred: formData.isPreferred,
    };

    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onCreate(data);
    }

    resetForm();
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirm(null);
  };

  const togglePreferred = (supplier: Supplier) => {
    onUpdate(supplier.id, { isPreferred: !supplier.isPreferred });
  };

  // Sort: preferred first, then alphabetically
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (a.isPreferred && !b.isPreferred) return -1;
    if (!a.isPreferred && b.isPreferred) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Suppliers</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#2F5233] text-white rounded-lg hover:bg-green-700"
        >
          + Add Supplier
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-900 mb-4">
            {editingId ? 'Edit Supplier' : 'Add New Supplier'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Home Depot"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Cincinnati, OH"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(513) 555-0123"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={e => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Your account #"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPreferred}
                    onChange={e => setFormData(prev => ({ ...prev, isPreferred: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Preferred Supplier</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                placeholder="Delivery terms, contact info, etc."
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#2F5233] text-white rounded-lg hover:bg-green-700"
              >
                {editingId ? 'Save Changes' : 'Add Supplier'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {suppliers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <p className="text-lg mb-2">No suppliers yet</p>
          <p>Add your first supplier to start tracking prices</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedSuppliers.map(supplier => (
            <div
              key={supplier.id}
              className={`bg-white rounded-lg shadow p-4 ${
                supplier.isPreferred ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                  {supplier.isPreferred && (
                    <span className="text-yellow-500" title="Preferred Supplier">★</span>
                  )}
                </div>
                <button
                  onClick={() => togglePreferred(supplier)}
                  className={`text-sm ${
                    supplier.isPreferred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                  }`}
                  title={supplier.isPreferred ? 'Remove preferred' : 'Mark as preferred'}
                >
                  ★
                </button>
              </div>

              {supplier.location && (
                <p className="text-sm text-gray-600 mb-1">{supplier.location}</p>
              )}

              {supplier.phone && (
                <p className="text-sm text-gray-600 mb-1">📞 {supplier.phone}</p>
              )}

              {supplier.website && (
                <a
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline block mb-1"
                >
                  🌐 Website
                </a>
              )}

              {supplier.accountNumber && (
                <p className="text-sm text-gray-500 mb-1">
                  Account: {supplier.accountNumber}
                </p>
              )}

              {supplier.notes && (
                <p className="text-sm text-gray-500 mt-2">{supplier.notes}</p>
              )}

              <div className="flex gap-2 mt-3 pt-3 border-t">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(supplier.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Supplier?</h4>
            <p className="text-gray-600 mb-4">
              This will also delete all price entries for this supplier.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
