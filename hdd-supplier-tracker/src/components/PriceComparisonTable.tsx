import { useState } from 'react';
import type { Material, Supplier, PriceEntry, MaterialCategory, MaterialFilters } from '../types';
import { MATERIAL_CATEGORIES } from '../types';
import { formatCurrency, exportPricesToCSV, getCategoryColor } from '../utils/storage';

interface PriceComparisonTableProps {
  materials: Material[];
  suppliers: Supplier[];
  prices: PriceEntry[];
  onAddPrice: (materialId: string, supplierId: string) => void;
  onEditPrice: (price: PriceEntry) => void;
  filterMaterials: (filters: MaterialFilters) => Material[];
}

export function PriceComparisonTable({
  materials,
  suppliers,
  prices,
  onAddPrice,
  onEditPrice,
  filterMaterials,
}: PriceComparisonTableProps) {
  const [filters, setFilters] = useState<MaterialFilters>({});

  const filteredMaterials = filterMaterials(filters);

  // Get current price for material/supplier
  const getPrice = (materialId: string, supplierId: string): PriceEntry | null => {
    return prices
      .filter(p => p.materialId === materialId && p.supplierId === supplierId)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0] || null;
  };

  // Find lowest price for a material
  const getLowestPrice = (materialId: string): number | null => {
    const materialPrices = prices.filter(p => p.materialId === materialId);
    if (materialPrices.length === 0) return null;
    return Math.min(...materialPrices.map(p => p.price));
  };

  // Sort suppliers: preferred first, then alphabetically
  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (a.isPreferred && !b.isPreferred) return -1;
    if (!a.isPreferred && b.isPreferred) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search materials..."
              value={filters.search || ''}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category || ''}
              onChange={e => setFilters(prev => ({
                ...prev,
                category: e.target.value as MaterialCategory || undefined
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="">All Categories</option>
              {MATERIAL_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setFilters({})}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Clear
          </button>

          <button
            onClick={() => exportPricesToCSV(filteredMaterials, suppliers, prices)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </div>

      {/* Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredMaterials.length} of {materials.length} materials
      </div>

      {/* Price Table */}
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
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Material
                </th>
                {sortedSuppliers.map(supplier => (
                  <th
                    key={supplier.id}
                    className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {supplier.isPreferred && <span className="text-yellow-500">★</span>}
                      {supplier.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map(material => {
                const lowestPrice = getLowestPrice(material.id);

                return (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getCategoryColor(material.category) }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{material.name}</div>
                          <div className="text-xs text-gray-500">
                            {material.unit} • {MATERIAL_CATEGORIES.find(c => c.value === material.category)?.label}
                          </div>
                        </div>
                      </div>
                    </td>
                    {sortedSuppliers.map(supplier => {
                      const price = getPrice(material.id, supplier.id);
                      const isLowest = price && lowestPrice !== null && price.price === lowestPrice;

                      return (
                        <td
                          key={supplier.id}
                          className={`px-4 py-3 text-center ${
                            isLowest ? 'bg-green-50' : ''
                          }`}
                        >
                          {price ? (
                            <button
                              onClick={() => onEditPrice(price)}
                              className={`font-medium hover:underline ${
                                isLowest ? 'text-green-700' : 'text-gray-900'
                              }`}
                            >
                              {formatCurrency(price.price)}
                              {isLowest && (
                                <span className="ml-1 text-xs text-green-600">✓</span>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => onAddPrice(material.id, supplier.id)}
                              className="text-gray-400 hover:text-gray-600 text-sm"
                            >
                              + Add
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
