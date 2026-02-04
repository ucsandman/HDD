import { useState } from 'react';
import type { SliderComparison } from '../types';
import { ComparisonSlider } from './ComparisonSlider';
import { ExportModal } from './ExportModal';

interface ComparisonDetailProps {
  comparison: SliderComparison;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function ComparisonDetail({
  comparison,
  onClose,
  onDelete,
}: ComparisonDetailProps) {
  const [showExport, setShowExport] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleDelete = () => {
    onDelete(comparison.id);
  };

  // Preview mode - fullscreen slider for screenshots
  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-[#2F5233] text-white">
          <div>
            <h1 className="text-xl font-bold">{comparison.projectName}</h1>
            <p className="text-green-100 text-sm">{comparison.name}</p>
          </div>
          <button
            onClick={() => setIsPreviewMode(false)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
          >
            Exit Preview
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-100">
          <div className="w-full max-w-4xl">
            <ComparisonSlider comparison={comparison} className="w-full" />
          </div>
        </div>
        <div className="px-6 py-3 bg-[#2F5233] text-center text-white text-sm">
          Hickory Dickory Decks Cincinnati | hickorydickorydecks.com
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {comparison.name}
            </h2>
            <p className="text-sm text-slate-600">{comparison.projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Slider */}
          <div className="mb-6">
            <ComparisonSlider comparison={comparison} className="w-full" />
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Image Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-700 mb-2">Before Image</h3>
              <p className="text-sm text-slate-600 mb-1">
                <span className="font-medium">Caption:</span>{' '}
                {comparison.beforeImage.caption || 'No caption'}
              </p>
              <p className="text-sm text-slate-500">
                <span className="font-medium">Added:</span>{' '}
                {new Date(comparison.beforeImage.uploadedAt).toLocaleDateString()}
              </p>
            </div>

            {/* After Image Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-700 mb-2">After Image</h3>
              <p className="text-sm text-slate-600 mb-1">
                <span className="font-medium">Caption:</span>{' '}
                {comparison.afterImage.caption || 'No caption'}
              </p>
              <p className="text-sm text-slate-500">
                <span className="font-medium">Added:</span>{' '}
                {new Date(comparison.afterImage.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            <div>
              <span className="font-medium">Orientation:</span>{' '}
              {comparison.orientation === 'horizontal'
                ? 'Horizontal (Left/Right)'
                : 'Vertical (Top/Bottom)'}
            </div>
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(comparison.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            Delete
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setIsPreviewMode(true)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
            >
              Preview Mode
            </button>
            <button
              onClick={() => setShowExport(true)}
              className="px-4 py-2 bg-[#2F5233] hover:bg-[#3d6842] text-white font-medium rounded-lg transition-colors"
            >
              Export / Embed
            </button>
          </div>
        </div>
      </div>

      {showExport && (
        <ExportModal
          comparison={comparison}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
