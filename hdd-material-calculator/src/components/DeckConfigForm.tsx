import type { DeckConfig, DeckStyle, DeckingMaterial, FramingMaterial, JoistSpacing, RailingStyle, StairWidth } from '../types';
import {
  DECK_STYLE_LABELS,
  DECKING_MATERIAL_LABELS,
  FRAMING_MATERIAL_LABELS,
  JOIST_SPACING_LABELS,
  RAILING_STYLE_LABELS,
} from '../types';

interface DeckConfigFormProps {
  config: DeckConfig;
  onChange: (config: DeckConfig) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export function DeckConfigForm({ config, onChange, onCalculate, onReset }: DeckConfigFormProps) {
  const updateDimension = (key: keyof typeof config.dimensions, value: number) => {
    onChange({
      ...config,
      dimensions: { ...config.dimensions, [key]: value },
    });
  };

  const totalSqFt = config.dimensions.length * config.dimensions.width;
  const requiresRailing = config.dimensions.height > 30;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">Deck Configuration</h2>
        <p className="text-sm text-slate-600 mt-1">
          Enter your deck specifications to calculate materials
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Dimensions */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Dimensions</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Length (ft)
              </label>
              <input
                type="number"
                value={config.dimensions.length}
                onChange={(e) => updateDimension('length', Number(e.target.value))}
                min={4}
                max={40}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Width (ft)
              </label>
              <input
                type="number"
                value={config.dimensions.width}
                onChange={(e) => updateDimension('width', Number(e.target.value))}
                min={4}
                max={40}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Height (in)
              </label>
              <input
                type="number"
                value={config.dimensions.height}
                onChange={(e) => updateDimension('height', Number(e.target.value))}
                min={0}
                max={120}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Total: <span className="font-semibold">{totalSqFt} sq ft</span>
            {requiresRailing && (
              <span className="ml-4 text-amber-600">
                ⚠️ Railing required (height {'>'} 30")
              </span>
            )}
          </div>
        </div>

        {/* Deck Style */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Deck Style
          </label>
          <select
            value={config.style}
            onChange={(e) => onChange({ ...config, style: e.target.value as DeckStyle })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
          >
            {Object.entries(DECK_STYLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Materials */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Materials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Decking Material
              </label>
              <select
                value={config.deckingMaterial}
                onChange={(e) => onChange({ ...config, deckingMaterial: e.target.value as DeckingMaterial })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              >
                {Object.entries(DECKING_MATERIAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Framing Material
              </label>
              <select
                value={config.framingMaterial}
                onChange={(e) => onChange({ ...config, framingMaterial: e.target.value as FramingMaterial })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              >
                {Object.entries(FRAMING_MATERIAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Framing Options */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Framing Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Joist Spacing
              </label>
              <select
                value={config.joistSpacing}
                onChange={(e) => onChange({ ...config, joistSpacing: Number(e.target.value) as JoistSpacing })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              >
                {Object.entries(JOIST_SPACING_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Decking Direction
              </label>
              <select
                value={config.deckingDirection}
                onChange={(e) => onChange({ ...config, deckingDirection: e.target.value as 'parallel' | 'perpendicular' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              >
                <option value="perpendicular">Perpendicular to house</option>
                <option value="parallel">Parallel to house</option>
              </select>
            </div>
          </div>
        </div>

        {/* Railing */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Railing</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Railing Style
            </label>
            <select
              value={config.railingStyle}
              onChange={(e) => onChange({ ...config, railingStyle: e.target.value as RailingStyle })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              disabled={requiresRailing && config.railingStyle === 'none'}
            >
              {Object.entries(RAILING_STYLE_LABELS).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                  disabled={requiresRailing && value === 'none'}
                >
                  {label}
                  {requiresRailing && value === 'none' ? ' (not allowed)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stairs */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Stairs</h3>
          <div className="flex items-start gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.hasStairs}
                onChange={(e) => onChange({ ...config, hasStairs: e.target.checked })}
                className="w-4 h-4 text-[#2F5233] border-slate-300 rounded focus:ring-[#2F5233]"
              />
              <span className="text-sm font-medium text-slate-700">Include Stairs</span>
            </label>

            {config.hasStairs && (
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stair Width
                </label>
                <select
                  value={config.stairWidth}
                  onChange={(e) => onChange({ ...config, stairWidth: Number(e.target.value) as StairWidth })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
                >
                  <option value={36}>36" (Standard)</option>
                  <option value={48}>48" (Wide)</option>
                  <option value={60}>60" (Extra Wide)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Waste Factor */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Waste Factor: {config.wasteFactor}%
          </label>
          <input
            type="range"
            value={config.wasteFactor}
            onChange={(e) => onChange({ ...config, wasteFactor: Number(e.target.value) })}
            min={5}
            max={20}
            step={1}
            className="w-full accent-[#2F5233]"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>5% (Minimal)</span>
            <span>10% (Standard)</span>
            <span>20% (Complex)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onCalculate}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-[#2F5233] hover:bg-[#234025] rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Calculate Materials
          </button>
          <button
            onClick={onReset}
            className="px-4 py-3 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
