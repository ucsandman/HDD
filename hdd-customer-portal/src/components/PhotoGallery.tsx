import { useState } from 'react';
import type { ProjectPhoto } from '../types';
import { formatDate } from '../utils/storage';

interface PhotoGalleryProps {
  photos: ProjectPhoto[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);
  const [filterStage, setFilterStage] = useState<'all' | 'before' | 'during' | 'after'>('all');

  const filteredPhotos = filterStage === 'all'
    ? photos
    : photos.filter(p => p.stage === filterStage);

  const stageLabels = {
    before: 'Before',
    during: 'During',
    after: 'After',
  };

  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No photos have been uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">Photos will appear here as your project progresses</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
          <div className="flex gap-1">
            {(['all', 'before', 'during', 'after'] as const).map(stage => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors capitalize ${
                  filterStage === stage
                    ? 'bg-[#2F5233] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPhotos.map(photo => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Project photo'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              <span
                className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  photo.stage === 'before'
                    ? 'bg-gray-900/70 text-white'
                    : photo.stage === 'during'
                    ? 'bg-yellow-500/90 text-white'
                    : 'bg-green-500/90 text-white'
                }`}
              >
                {stageLabels[photo.stage]}
              </span>
            </button>
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No {filterStage} photos yet
          </p>
        )}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="max-w-4xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Project photo'}
              className="max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-4 text-white text-center">
              {selectedPhoto.caption && (
                <p className="text-lg">{selectedPhoto.caption}</p>
              )}
              <p className="text-sm text-white/60 mt-1">
                {stageLabels[selectedPhoto.stage]} - {formatDate(selectedPhoto.uploadedAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
