import { useState } from 'react';
import type { SliderComparison } from '../types';
import { generateEmbedCode, downloadEmbedCode } from '../utils/storage';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface ExportModalProps {
  comparison: SliderComparison;
  onClose: () => void;
}

export function ExportModal({ comparison, onClose }: ExportModalProps) {
  const [copied, copy] = useCopyToClipboard();
  const [activeTab, setActiveTab] = useState<'embed' | 'link'>('embed');
  const embedCode = generateEmbedCode(comparison);

  const handleCopyEmbed = () => {
    copy(embedCode);
  };

  const handleDownload = () => {
    downloadEmbedCode(comparison);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Export Slider</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'embed'
                ? 'text-[#2F5233] border-b-2 border-[#2F5233]'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Embed Code
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'link'
                ? 'text-[#2F5233] border-b-2 border-[#2F5233]'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Image Links
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-3">
                  Copy the HTML code below and paste it into your website. The
                  slider includes all necessary styles and JavaScript.
                </p>
                <div className="relative">
                  <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                    {embedCode}
                  </pre>
                  <button
                    onClick={handleCopyEmbed}
                    className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-700 mb-2">
                  Download as HTML File
                </h4>
                <p className="text-sm text-slate-600 mb-3">
                  Download a standalone HTML page with the slider that you can
                  host anywhere or open locally.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#2F5233] hover:bg-[#3d6842] text-white font-medium rounded-lg transition-colors"
                >
                  Download HTML
                </button>
              </div>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Use these image URLs for social media posts or other purposes.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Before Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={comparison.beforeImage.url}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copy(comparison.beforeImage.url)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  {comparison.beforeImage.caption && (
                    <p className="text-xs text-slate-500 mt-1">
                      {comparison.beforeImage.caption}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    After Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={comparison.afterImage.url}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copy(comparison.afterImage.url)}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  {comparison.afterImage.caption && (
                    <p className="text-xs text-slate-500 mt-1">
                      {comparison.afterImage.caption}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-700 mb-2">Preview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Before</p>
                    <img
                      src={comparison.beforeImage.url}
                      alt="Before"
                      className="w-full rounded border border-slate-200"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">After</p>
                    <img
                      src={comparison.afterImage.url}
                      alt="After"
                      className="w-full rounded border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
