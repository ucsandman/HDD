import { useState } from 'react';
import type { Material, MaterialCategory, UnitType } from '../types';
import { MATERIAL_CATEGORIES, UNIT_TYPES } from '../types';
import { getCategoryColor } from '../utils/storage';

interface MaterialListProps {
  materials: Material[];
  onCreate: (data: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<Material>) => void;
  onDelete: (id: string) => void;
}

export function MaterialList({ materials, onCreate, onUpdate, onDelete }: MaterialListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'decking' as MaterialCategory,
    description: '',
    unit: 'board' as UnitType,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: 'decking',
      description: '',
      unit: 'board',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (material: Material) => {
    setFormData({
      name: material.name,
      sku: material.sku || '',
      category: material.category,
      description: material.description || '',
      unit: material.unit,
    });
    setEditingId(material.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const data = {
      name: formData.name.trim(),
      sku: formData.sku.trim() || undefined,
      category: formData.category,
      description: formData.description.trim() || undefined,
      unit: formData.unit,
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

  // Filter and sort materials
  const filteredMaterials = materials
    .filter(m => {
      if (filterCategory && m.category !== filterCategory) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          m.name.toLowerCase().includes(search) ||
          (m.sku && m.sku.toLowerCase().includes(search)) ||
          (m.description && m.description.toLowerCase().includes(search))
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by category, then by name
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });

  // Group by category
  const materialsByCategory = MATERIAL_CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = filteredMaterials.filter(m => m.category === cat.value);
    return acc;
  }, {} as Record<MaterialCategory, Material[]>);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Materials</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#2F5233] text-white rounded-lg hover:bg-green-700"
        >
          + Add Material
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as MaterialCategory | '')}
            className="rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">All Categories</option>
            {MATERIAL_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-900 mb-4">
            {editingId ? 'Edit Material' : 'Add New Material'}
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
                  placeholder="e.g., Trex Select 1x6x16"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={e => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="Optional"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as MaterialCategory }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  {MATERIAL_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  value={formData.unit}
                  onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value as UnitType }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  {UNIT_TYPES.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional details"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#2F5233] text-white rounded-lg hover:bg-green-700"
              >
                {editingId ? 'Save Changes' : 'Add Material'}
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

      {/* Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredMaterials.length} of {materials.length} materials
      </div>

      {/* List by Category */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          {materials.length === 0 ? (
            <>
              <p className="text-lg mb-2">No materials yet</p>
              <p>Add materials to start tracking prices</p>
            </>
          ) : (
            <p>No materials match your filters</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {MATERIAL_CATEGORIES.map(cat => {
            const categoryMaterials = materialsByCategory[cat.value];
            if (categoryMaterials.length === 0) return null;

            return (
              <div key={cat.value}>
                <h3 className="flex items-center gap-2 text-lg font-medium text-gray-900 mb-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(cat.value) }}
                  />
                  {cat.label} ({categoryMaterials.length})
                </h3>
                <div className="bg-white rounded-lg shadow divide-y">
                  {categoryMaterials.map(material => (
                    <div
                      key={material.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{material.name}</div>
                        <div className="text-sm text-gray-500">
                          {UNIT_TYPES.find(u => u.value === material.unit)?.label}
                          {material.sku && ` • SKU: ${material.sku}`}
                        </div>
                        {material.description && (
                          <div className="text-sm text-gray-400">{material.description}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(material)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(material.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Material?</h4>
            <p className="text-gray-600 mb-4">
              This will also delete all price entries for this material.
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
