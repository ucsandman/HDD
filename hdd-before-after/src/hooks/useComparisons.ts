import { useState, useEffect } from 'react';
import type { SliderComparison, ImageData, Orientation } from '../types';
import { loadComparisons, saveComparisons, generateId } from '../utils/storage';

export interface CreateComparisonData {
  name: string;
  projectName: string;
  beforeImage: Omit<ImageData, 'uploadedAt'>;
  afterImage: Omit<ImageData, 'uploadedAt'>;
  orientation: Orientation;
}

export function useComparisons() {
  const [comparisons, setComparisons] = useState<SliderComparison[]>(() => loadComparisons());

  useEffect(() => {
    saveComparisons(comparisons);
  }, [comparisons]);

  const addComparison = (data: CreateComparisonData): SliderComparison => {
    const now = new Date().toISOString();
    const newComparison: SliderComparison = {
      id: generateId(),
      name: data.name,
      projectName: data.projectName,
      beforeImage: {
        ...data.beforeImage,
        uploadedAt: now,
      },
      afterImage: {
        ...data.afterImage,
        uploadedAt: now,
      },
      orientation: data.orientation,
      createdAt: now,
    };
    setComparisons([newComparison, ...comparisons]);
    return newComparison;
  };

  const updateComparison = (id: string, updates: Partial<SliderComparison>): void => {
    setComparisons(
      comparisons.map((comparison) =>
        comparison.id === id ? { ...comparison, ...updates } : comparison
      )
    );
  };

  const deleteComparison = (id: string): boolean => {
    if (window.confirm('Delete this comparison? This cannot be undone.')) {
      setComparisons(comparisons.filter((comparison) => comparison.id !== id));
      return true;
    }
    return false;
  };

  const getComparison = (id: string): SliderComparison | undefined => {
    return comparisons.find((comparison) => comparison.id === id);
  };

  return {
    comparisons,
    addComparison,
    updateComparison,
    deleteComparison,
    getComparison,
  };
}
