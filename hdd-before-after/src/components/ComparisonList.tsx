import type { SliderComparison } from '../types';
import { ComparisonSlider } from './ComparisonSlider';

interface ComparisonListProps {
  comparisons: SliderComparison[];
  onSelect: (comparison: SliderComparison) => void;
}

export function ComparisonList({ comparisons, onSelect }: ComparisonListProps) {
  if (comparisons.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <div className="text-slate-400 text-5xl mb-4">&#128247;</div>
        <p className="text-slate-600 font-medium">No comparisons yet</p>
        <p className="text-slate-500 text-sm mt-1">
          Create your first before/after slider to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {comparisons.map((comparison) => (
        <div
          key={comparison.id}
          className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect(comparison)}
        >
          <div className="p-3">
            <ComparisonSlider
              comparison={comparison}
              showLabels={false}
              className="w-full"
            />
          </div>
          <div className="px-4 pb-4">
            <h3 className="font-semibold text-slate-800 truncate">
              {comparison.name}
            </h3>
            <p className="text-sm text-slate-600 truncate">
              {comparison.projectName}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  comparison.orientation === 'horizontal'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {comparison.orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(comparison.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
