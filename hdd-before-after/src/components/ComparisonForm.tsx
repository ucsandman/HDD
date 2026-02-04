import { useState } from 'react';
import type { Orientation } from '../types';
import { ORIENTATION_LABELS } from '../types';
import type { CreateComparisonData } from '../hooks/useComparisons';

interface ComparisonFormProps {
  onSubmit: (data: CreateComparisonData) => void;
  onCancel: () => void;
}

interface FormErrors {
  name?: string;
  projectName?: string;
  beforeUrl?: string;
  afterUrl?: string;
}

export function ComparisonForm({ onSubmit, onCancel }: ComparisonFormProps) {
  const [name, setName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [beforeUrl, setBeforeUrl] = useState('');
  const [beforeCaption, setBeforeCaption] = useState('');
  const [afterUrl, setAfterUrl] = useState('');
  const [afterCaption, setAfterCaption] = useState('');
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!validateUrl(beforeUrl)) {
      newErrors.beforeUrl = 'Valid before image URL is required';
    }
    if (!validateUrl(afterUrl)) {
      newErrors.afterUrl = 'Valid after image URL is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      projectName: projectName.trim(),
      beforeImage: {
        url: beforeUrl.trim(),
        caption: beforeCaption.trim() || 'Before',
      },
      afterImage: {
        url: afterUrl.trim(),
        caption: afterCaption.trim() || 'After',
      },
      orientation,
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 mb-6">
        Create New Comparison
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Comparison Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: undefined });
              }}
              placeholder="e.g., Thompson Deck Renovation"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                setErrors({ ...errors, projectName: undefined });
              }}
              placeholder="e.g., Thompson Residence - West Chester"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent ${
                errors.projectName ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.projectName && (
              <p className="text-red-500 text-sm mt-1">{errors.projectName}</p>
            )}
          </div>
        </div>

        {/* Orientation */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Slider Orientation
          </label>
          <div className="flex gap-4">
            {(Object.keys(ORIENTATION_LABELS) as Orientation[]).map((key) => (
              <label key={key} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="orientation"
                  value={key}
                  checked={orientation === key}
                  onChange={() => setOrientation(key)}
                  className="mr-2 text-[#2F5233] focus:ring-[#2F5233]"
                />
                <span className="text-sm text-slate-700">
                  {ORIENTATION_LABELS[key]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Before Image */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-medium text-slate-700 mb-3">Before Image</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                value={beforeUrl}
                onChange={(e) => {
                  setBeforeUrl(e.target.value);
                  setErrors({ ...errors, beforeUrl: undefined });
                }}
                placeholder="https://example.com/before-image.jpg"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent ${
                  errors.beforeUrl ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.beforeUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.beforeUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Caption (optional)
              </label>
              <input
                type="text"
                value={beforeCaption}
                onChange={(e) => setBeforeCaption(e.target.value)}
                placeholder="e.g., Old pressure-treated deck"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              />
            </div>
            {beforeUrl && validateUrl(beforeUrl) && (
              <div className="mt-2">
                <img
                  src={beforeUrl}
                  alt="Before preview"
                  className="max-h-40 rounded border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* After Image */}
        <div className="border border-slate-200 rounded-lg p-4">
          <h3 className="font-medium text-slate-700 mb-3">After Image</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                value={afterUrl}
                onChange={(e) => {
                  setAfterUrl(e.target.value);
                  setErrors({ ...errors, afterUrl: undefined });
                }}
                placeholder="https://example.com/after-image.jpg"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent ${
                  errors.afterUrl ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.afterUrl && (
                <p className="text-red-500 text-sm mt-1">{errors.afterUrl}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Caption (optional)
              </label>
              <input
                type="text"
                value={afterCaption}
                onChange={(e) => setAfterCaption(e.target.value)}
                placeholder="e.g., New Trex Transcend deck"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2F5233] focus:border-transparent"
              />
            </div>
            {afterUrl && validateUrl(afterUrl) && (
              <div className="mt-2">
                <img
                  src={afterUrl}
                  alt="After preview"
                  className="max-h-40 rounded border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-[#2F5233] hover:bg-[#3d6842] text-white font-medium rounded-lg transition-colors"
          >
            Create Comparison
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
