// Deck configuration types
export type DeckStyle = 'ground_level' | 'elevated' | 'freestanding';
export type DeckingMaterial = 'pressure_treated' | 'cedar' | 'composite_standard' | 'composite_premium';
export type FramingMaterial = 'pressure_treated' | 'cedar';
export type JoistSpacing = 12 | 16 | 24;
export type RailingStyle = 'none' | 'wood' | 'composite' | 'aluminum' | 'cable';
export type StairWidth = 36 | 48 | 60;

export interface DeckDimensions {
  length: number; // feet
  width: number; // feet
  height: number; // inches from ground to deck surface
}

export interface DeckConfig {
  dimensions: DeckDimensions;
  style: DeckStyle;
  deckingMaterial: DeckingMaterial;
  framingMaterial: FramingMaterial;
  joistSpacing: JoistSpacing;
  deckingDirection: 'parallel' | 'perpendicular'; // relative to house
  railingStyle: RailingStyle;
  hasStairs: boolean;
  stairWidth: StairWidth;
  wasteFactor: number; // percentage (e.g., 10 = 10%)
}

// Material calculation results
export interface MaterialItem {
  id: string;
  category: MaterialCategory;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
}

export type MaterialCategory =
  | 'decking'
  | 'framing'
  | 'hardware'
  | 'concrete'
  | 'railing'
  | 'stairs'
  | 'miscellaneous';

export interface CalculationResult {
  config: DeckConfig;
  materials: MaterialItem[];
  summary: {
    totalSquareFeet: number;
    deckingSquareFeet: number;
    linearFeetDecking: number;
    joistCount: number;
    postCount: number;
    footingCount: number;
    stairRiseCount: number;
    railingLinearFeet: number;
  };
  estimatedCost?: {
    materials: number;
    labor?: number;
    total?: number;
  };
  calculatedAt: string;
}

export interface SavedCalculation {
  id: string;
  name: string;
  customerName?: string;
  projectAddress?: string;
  result: CalculationResult;
  createdAt: string;
  updatedAt: string;
}

// Labels and options
export const DECK_STYLE_LABELS: Record<DeckStyle, string> = {
  ground_level: 'Ground Level (< 30")',
  elevated: 'Elevated (attached to house)',
  freestanding: 'Freestanding (not attached)',
};

export const DECKING_MATERIAL_LABELS: Record<DeckingMaterial, string> = {
  pressure_treated: 'Pressure Treated Pine',
  cedar: 'Western Red Cedar',
  composite_standard: 'Composite (Standard)',
  composite_premium: 'Composite (Premium/Capped)',
};

export const FRAMING_MATERIAL_LABELS: Record<FramingMaterial, string> = {
  pressure_treated: 'Pressure Treated Pine',
  cedar: 'Cedar',
};

export const RAILING_STYLE_LABELS: Record<RailingStyle, string> = {
  none: 'No Railing',
  wood: 'Wood Railing',
  composite: 'Composite Railing',
  aluminum: 'Aluminum Railing',
  cable: 'Cable Railing',
};

export const JOIST_SPACING_LABELS: Record<JoistSpacing, string> = {
  12: '12" on center (composite/diagonal)',
  16: '16" on center (standard)',
  24: '24" on center (ground level only)',
};

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  decking: 'Decking Boards',
  framing: 'Framing Lumber',
  hardware: 'Hardware & Fasteners',
  concrete: 'Concrete & Footings',
  railing: 'Railing System',
  stairs: 'Stair Components',
  miscellaneous: 'Miscellaneous',
};

// Material pricing (approximate, for estimation only)
export const MATERIAL_PRICES: Record<string, number> = {
  // Decking per linear foot
  'deck_pt_5/4x6': 1.50,
  'deck_cedar_5/4x6': 4.00,
  'deck_composite_std': 3.50,
  'deck_composite_prem': 5.50,

  // Framing per linear foot
  'frame_pt_2x6': 0.85,
  'frame_pt_2x8': 1.10,
  'frame_pt_2x10': 1.45,
  'frame_pt_2x12': 1.85,
  'frame_pt_4x4': 1.25,
  'frame_pt_6x6': 2.75,
  'frame_cedar_2x8': 2.50,
  'frame_cedar_2x10': 3.25,

  // Hardware
  'joist_hanger': 3.50,
  'post_bracket': 12.00,
  'lag_bolt': 0.75,
  'carriage_bolt': 1.25,
  'deck_screws_lb': 45.00,
  'joist_screws_lb': 55.00,

  // Concrete
  'concrete_bag_80lb': 6.50,
  'sono_tube_12': 15.00,
  'sono_tube_10': 12.00,

  // Railing per linear foot
  'rail_wood': 15.00,
  'rail_composite': 35.00,
  'rail_aluminum': 45.00,
  'rail_cable': 65.00,

  // Stairs
  'stair_stringer': 25.00,
  'stair_tread': 8.00,
};
