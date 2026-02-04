import type { SavedCalculation } from '../types';
import { DECKING_MATERIAL_LABELS, DECK_STYLE_LABELS } from '../types';

interface SavedCalculationsProps {
  calculations: SavedCalculation[];
  onLoad: (calculation: SavedCalculation) => void;
  onDelete: (id: string) => void;
}

export function SavedCalculations({ calculations, onLoad, onDelete }: SavedCalculationsProps) {
  if (calculations.length === 0) {
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
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
          />
        </svg>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          No Saved Calculations
        </h3>
        <p className="text-slate-600">
          Calculate materials and save them for future reference.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Saved Calculations</h2>
        <p className="text-sm text-slate-600 mt-1">
          {calculations.length} saved calculation{calculations.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        {calculations.map((calc) => {
          const { config, summary, estimatedCost } = calc.result;

          return (
            <div
              key={calc.id}
              className="p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">
                    {calc.name}
                  </h3>
                  {(calc.customerName || calc.projectAddress) && (
                    <div className="text-sm text-slate-600 mt-1">
                      {calc.customerName && <span>{calc.customerName}</span>}
                      {calc.customerName && calc.projectAddress && <span> • </span>}
                      {calc.projectAddress && <span>{calc.projectAddress}</span>}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
                    <span>
                      {config.dimensions.length}' × {config.dimensions.width}'
                      ({summary.totalSquareFeet} sq ft)
                    </span>
                    <span className="text-slate-400">|</span>
                    <span>{DECK_STYLE_LABELS[config.style]}</span>
                    <span className="text-slate-400">|</span>
                    <span>{DECKING_MATERIAL_LABELS[config.deckingMaterial]}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-[#2F5233] font-medium">
                      Est. ${estimatedCost?.materials.toLocaleString()}
                    </span>
                    <span className="text-slate-500">
                      {calc.result.materials.length} items
                    </span>
                    <span className="text-slate-400">
                      Saved {new Date(calc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLoad(calc)}
                    className="px-3 py-1.5 text-sm font-medium text-[#2F5233] hover:bg-[#2F5233]/10 rounded-lg transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => onDelete(calc.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
