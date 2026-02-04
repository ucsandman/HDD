export type Orientation = 'horizontal' | 'vertical';

export interface ImageData {
  url: string;
  caption: string;
  uploadedAt: string;
}

export interface SliderComparison {
  id: string;
  name: string;
  projectName: string;
  beforeImage: ImageData;
  afterImage: ImageData;
  orientation: Orientation;
  createdAt: string;
}

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  horizontal: 'Horizontal (Left/Right)',
  vertical: 'Vertical (Top/Bottom)',
};

// Demo data with placeholder images
export const DEMO_COMPARISONS: SliderComparison[] = [
  {
    id: 'demo-1',
    name: 'Thompson Deck Renovation',
    projectName: 'Thompson Residence - West Chester',
    beforeImage: {
      url: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=800&h=600&fit=crop',
      caption: 'Old pressure-treated deck with weathering damage',
      uploadedAt: '2024-01-15T10:00:00Z',
    },
    afterImage: {
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      caption: 'New Trex Transcend composite deck',
      uploadedAt: '2024-01-20T14:00:00Z',
    },
    orientation: 'horizontal',
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'demo-2',
    name: 'Miller Pergola Project',
    projectName: 'Miller Family - Mason',
    beforeImage: {
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      caption: 'Empty backyard space',
      uploadedAt: '2024-02-01T09:00:00Z',
    },
    afterImage: {
      url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
      caption: 'Beautiful cedar pergola with outdoor living space',
      uploadedAt: '2024-02-10T16:00:00Z',
    },
    orientation: 'vertical',
    createdAt: '2024-02-10T16:30:00Z',
  },
];
