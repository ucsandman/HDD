import { useState } from 'react';
import type { CalculationResult, MaterialCategory } from '../types';
import { CATEGORY_LABELS } from '../types';
import { copyMaterialsToClipboard, exportToCSV } from '../utils/storage';

interface MaterialsListProps {
  result: CalculationResult | null;
  onSave: (name: string, customerName?: string, projectAddress?: string) => void;
}

export function MaterialsList({ result, onSave }: MaterialsListProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
        <svg
          className="w-16 h-16 mx-auto text-slate-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No Calculation Yet
        </h3>
        <p className="text-slate-600">
          Configure your deck and click "Calculate Materials" to see the supply list.
        </p>
      </div>
    );
  }

  const { materials, summary, estimatedCost } = result;
  const categories = [...new Set(materials.map(m => m.category))] as MaterialCategory[];

  const handleCopy = async () => {
    await copyMaterialsToClipboard(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave(saveName.trim(), customerName.trim() || undefined, projectAddress.trim() || undefined);
    setShowSaveModal(false);
    setSaveName('');
    setCustomerName('');
    setProjectAddress('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Materials List</h2>
            <p className="text-sm text-slate-600 mt-1">
              {result.config.dimensions.length}' × {result.config.dimensions.width}' deck
              ({summary.totalSquareFeet} sq ft)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={() => exportToCSV(result)}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              CSV
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-[#2F5233] hover:bg-[#234025] rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{summary.joistCount}</div>
            <div className="text-xs text-slate-600">Joists</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{summary.postCount}</div>
            <div className="text-xs text-slate-600">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{summary.footingCount}</div>
            <div className="text-xs text-slate-600">Footings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#2F5233]">
              ${estimatedCost?.materials.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600">Est. Material Cost</div>
          </div>
        </div>
      </div>

      {/* Materials by Category */}
      <div className="divide-y divide-slate-200">
        {categories.map(category => {
          const categoryMaterials = materials.filter(m => m.category === category);

          return (
            <div key={category} className="p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                {CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-2">
                {categoryMaterials.map(item => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between py-2 px-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-sm text-slate-600">{item.description}</div>
                      {item.notes && (
                        <div className="text-xs text-slate-500 mt-1 italic">{item.notes}</div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-slate-900">
                        {item.quantity}
                      </div>
                      <div className="text-xs text-slate-600">{item.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-amber-50 border-t border-amber-200 text-xs text-amber-800">
        <strong>Note:</strong> Material quantities are estimates based on standard construction practices.
        Actual requirements may vary based on site conditions, local codes, and design choices.
        Always verify quantities with your supplier and adjust for your specific project.
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Save Calculation</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Calculation Name *
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                  placeholder="e.g., Smith Deck - Initial Estimate"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Project Address
                </label>
                <input
                  type="text"
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2F5233] hover:bg-[#234025] rounded-lg transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
