// Material categories
export type MaterialCategory =
  | 'decking'
  | 'framing'
  | 'hardware'
  | 'concrete'
  | 'railing'
  | 'fasteners'
  | 'other';

export const MATERIAL_CATEGORIES: { value: MaterialCategory; label: string }[] = [
  { value: 'decking', label: 'Decking' },
  { value: 'framing', label: 'Framing Lumber' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'concrete', label: 'Concrete & Footings' },
  { value: 'railing', label: 'Railing' },
  { value: 'fasteners', label: 'Fasteners & Screws' },
  { value: 'other', label: 'Other' },
];

// Unit types
export type UnitType = 'each' | 'linear_ft' | 'sq_ft' | 'board' | 'bag' | 'box' | 'lb';

export const UNIT_TYPES: { value: UnitType; label: string }[] = [
  { value: 'each', label: 'Each' },
  { value: 'linear_ft', label: 'Linear Ft' },
  { value: 'sq_ft', label: 'Sq Ft' },
  { value: 'board', label: 'Board' },
  { value: 'bag', label: 'Bag' },
  { value: 'box', label: 'Box' },
  { value: 'lb', label: 'Pound' },
];

// Supplier information
export interface Supplier {
  id: string;
  name: string;
  location?: string;
  phone?: string;
  website?: string;
  accountNumber?: string;
  notes?: string;
  isPreferred: boolean;
  createdAt: string;
  updatedAt: string;
}

// Material/Product definition
export interface Material {
  id: string;
  name: string;
  sku?: string;
  category: MaterialCategory;
  description?: string;
  unit: UnitType;
  createdAt: string;
  updatedAt: string;
}

// Price entry for a material at a specific supplier
export interface PriceEntry {
  id: string;
  materialId: string;
  supplierId: string;
  price: number;
  minQuantity?: number; // Minimum quantity for this price
  effectiveDate: string;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Price history for tracking changes
export interface PriceHistory {
  id: string;
  materialId: string;
  supplierId: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  recordedAt: string;
}

// Comparison view data
export interface PriceComparison {
  material: Material;
  prices: {
    supplier: Supplier;
    price: PriceEntry | null;
    isLowest: boolean;
    isMostRecent: boolean;
  }[];
  lowestPrice: number | null;
  highestPrice: number | null;
  averagePrice: number | null;
}

// Dashboard statistics
export interface DashboardStats {
  totalMaterials: number;
  totalSuppliers: number;
  totalPriceEntries: number;
  recentPriceChanges: number;
  avgSavingsOpportunity: number;
}

// Filter options
export interface MaterialFilters {
  category?: MaterialCategory;
  search?: string;
  supplierId?: string;
}

// Common suppliers in Cincinnati area
export const DEFAULT_SUPPLIERS: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Home Depot',
    location: 'Multiple Cincinnati locations',
    website: 'https://www.homedepot.com',
    isPreferred: false,
  },
  {
    name: "Lowe's",
    location: 'Multiple Cincinnati locations',
    website: 'https://www.lowes.com',
    isPreferred: false,
  },
  {
    name: '84 Lumber',
    location: 'Cincinnati, OH',
    website: 'https://www.84lumber.com',
    isPreferred: false,
  },
  {
    name: 'Carter Lumber',
    location: 'Cincinnati area',
    website: 'https://www.carterlumber.com',
    isPreferred: true,
  },
  {
    name: 'ABC Supply',
    location: 'Cincinnati, OH',
    website: 'https://www.abcsupply.com',
    isPreferred: false,
  },
];

// Common deck materials
export const DEFAULT_MATERIALS: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Decking
  { name: 'PT Pine 5/4x6x16', category: 'decking', unit: 'board', description: 'Pressure treated pine decking' },
  { name: 'Trex Select 1x6x16', category: 'decking', unit: 'board', description: 'Composite decking - Select line' },
  { name: 'Trex Enhance 1x6x16', category: 'decking', unit: 'board', description: 'Composite decking - Enhance line' },
  { name: 'Trex Transcend 1x6x16', category: 'decking', unit: 'board', description: 'Premium composite decking' },
  { name: 'TimberTech Edge 1x6x16', category: 'decking', unit: 'board', description: 'TimberTech composite' },

  // Framing
  { name: 'PT 2x8x16 Joist', category: 'framing', unit: 'board', description: 'Pressure treated joist' },
  { name: 'PT 2x10x16 Joist', category: 'framing', unit: 'board', description: 'Pressure treated joist' },
  { name: 'PT 2x12x16 Beam', category: 'framing', unit: 'board', description: 'Pressure treated beam' },
  { name: 'PT 4x4x10 Post', category: 'framing', unit: 'each', description: 'Pressure treated post' },
  { name: 'PT 6x6x10 Post', category: 'framing', unit: 'each', description: 'Heavy duty post' },

  // Hardware
  { name: 'Joist Hanger 2x8', category: 'hardware', unit: 'each', description: 'Simpson LUS28' },
  { name: 'Joist Hanger 2x10', category: 'hardware', unit: 'each', description: 'Simpson LUS210' },
  { name: 'Post Base 4x4', category: 'hardware', unit: 'each', description: 'Simpson ABU44' },
  { name: 'Post Cap 4x4 to 2-2x8', category: 'hardware', unit: 'each', description: 'Simpson BC4' },
  { name: 'Ledger Board Bolt 1/2x6', category: 'hardware', unit: 'each', description: 'Lag bolt with washer' },

  // Concrete
  { name: 'Concrete 80lb Bag', category: 'concrete', unit: 'bag', description: 'Quikrete or equivalent' },
  { name: 'Sono Tube 12" x 4\'', category: 'concrete', unit: 'each', description: 'Concrete form tube' },
  { name: 'Gravel 50lb Bag', category: 'concrete', unit: 'bag', description: 'Drainage gravel' },

  // Railing
  { name: 'Trex Railing Post Kit', category: 'railing', unit: 'each', description: 'Complete post assembly' },
  { name: 'Trex Top/Bottom Rail 8\'', category: 'railing', unit: 'each', description: 'Railing rails' },
  { name: 'Aluminum Baluster 32"', category: 'railing', unit: 'each', description: 'Square aluminum baluster' },

  // Fasteners
  { name: 'Deck Screws 3" (5lb box)', category: 'fasteners', unit: 'box', description: 'Exterior coated screws' },
  { name: 'Hidden Fastener Kit (100)', category: 'fasteners', unit: 'box', description: 'For composite decking' },
  { name: 'Structural Screws 3" (50pk)', category: 'fasteners', unit: 'box', description: 'GRK or similar' },
];
