import { useState, useEffect } from 'react';
import type { Material, Supplier, PriceEntry } from '../types';
import { formatCurrency } from '../utils/storage';

interface PriceFormProps {
  material: Material | null;
  supplier: Supplier | null;
  existingPrice: PriceEntry | null;
  onSubmit: (
    materialId: string,
    supplierId: string,
    price: number,
    effectiveDate: string,
    notes?: string,
    minQuantity?: number,
    expiresAt?: string
  ) => void;
  onDelete?: (priceId: string) => void;
  onClose: () => void;
}

export function PriceForm({
  material,
  supplier,
  existingPrice,
  onSubmit,
  onDelete,
  onClose,
}: PriceFormProps) {
  const [formData, setFormData] = useState({
    price: existingPrice?.price?.toString() || '',
    effectiveDate: existingPrice?.effectiveDate || new Date().toISOString().split('T')[0],
    notes: existingPrice?.notes || '',
    minQuantity: existingPrice?.minQuantity?.toString() || '',
    expiresAt: existingPrice?.expiresAt || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when existingPrice changes
  useEffect(() => {
    if (existingPrice) {
      setFormData({
        price: existingPrice.price.toString(),
        effectiveDate: existingPrice.effectiveDate,
        notes: existingPrice.notes || '',
        minQuantity: existingPrice.minQuantity?.toString() || '',
        expiresAt: existingPrice.expiresAt || '',
      });
    }
  }, [existingPrice]);

  if (!material || !supplier) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit(
      material.id,
      supplier.id,
      parseFloat(formData.price),
      formData.effectiveDate,
      formData.notes.trim() || undefined,
      formData.minQuantity ? parseInt(formData.minQuantity) : undefined,
      formData.expiresAt || undefined
    );

    onClose();
  };

  const handleDelete = () => {
    if (existingPrice && onDelete) {
      onDelete(existingPrice.id);
      onClose();
    }
  };

  // Calculate price change if editing
  const priceChange = existingPrice && formData.price
    ? ((parseFloat(formData.price) - existingPrice.price) / existingPrice.price) * 100
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {existingPrice ? 'Update Price' : 'Add Price'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {material.name} at {supplier.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Price Display */}
          {existingPrice && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-500">Current Price</div>
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(existingPrice.price)}
              </div>
              <div className="text-xs text-gray-400">
                as of {existingPrice.effectiveDate}
              </div>
            </div>
          )}

          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {existingPrice ? 'New Price' : 'Price'} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className={`w-full pl-7 rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                  errors.price ? 'border-red-500' : ''
                }`}
              />
            </div>
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}

            {/* Price Change Indicator */}
            {priceChange !== null && priceChange !== 0 && (
              <div className={`mt-1 text-sm ${priceChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {priceChange > 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(1)}% change
              </div>
            )}
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Effective Date *
            </label>
            <input
              type="date"
              value={formData.effectiveDate}
              onChange={e => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
              className={`w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 ${
                errors.effectiveDate ? 'border-red-500' : ''
              }`}
            />
            {errors.effectiveDate && <p className="mt-1 text-sm text-red-600">{errors.effectiveDate}</p>}
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.minQuantity}
                onChange={e => setFormData(prev => ({ ...prev, minQuantity: e.target.value }))}
                placeholder="Optional"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={e => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Optional notes"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 bg-[#2F5233] text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {existingPrice ? 'Update Price' : 'Save Price'}
            </button>
            {existingPrice && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
