// HDD Quote Calculator Configuration
// Adjust pricing based on current material costs and labor rates

const CONFIG = {
  franchise: {
    name: "Hickory Dickory Decks Cincinnati",
    phone: "(513) 555-1234",
    website: "https://decks.ca/deck-builders/cincinnati/",
    serviceArea: "Greater Cincinnati"
  },

  // Contact info for CTA
  contactPhone: "(513) 555-0123",
  bookingUrl: "https://cal.com/hickory-dickory-decks-cincinnati",

  // Base price per square foot (includes labor + basic materials)
  // This is for ground-level deck with basic composite
  basePricePerSqFt: {
    low: 45,   // Budget estimate
    high: 55   // Higher estimate with contingency
  },

  // Material multipliers (applied to base price)
  materials: {
    "trex-select": {
      name: "Trex Select",
      multiplier: 1.0,
      description: "Entry-level composite, 25-year warranty"
    },
    "trex-enhance": {
      name: "Trex Enhance",
      multiplier: 1.15,
      description: "Mid-range composite, better colors, 25-year warranty"
    },
    "trex-transcend": {
      name: "Trex Transcend",
      multiplier: 1.35,
      description: "Premium composite, best colors & texture, 25-year warranty"
    },
    "timbertech-pro": {
      name: "TimberTech PRO",
      multiplier: 1.25,
      description: "Premium composite, excellent durability"
    },
    "timbertech-azek": {
      name: "TimberTech AZEK",
      multiplier: 1.55,
      description: "Top-tier PVC, ultimate performance, 50-year warranty"
    }
  },

  // Height adjustments (flat fee ranges)
  heightAdjustments: {
    "ground": { low: 0, high: 0, description: "Ground level (0-2 ft)" },
    "low": { low: 800, high: 1200, description: "Low (2-4 ft)" },
    "medium": { low: 2000, high: 3500, description: "Medium (4-8 ft)" },
    "high": { low: 4500, high: 7000, description: "High/Second story (8+ ft)" }
  },

  // Feature add-on prices (flat fee ranges)
  features: {
    "railing": {
      name: "Composite Railing",
      low: 1500,
      high: 3000,
      perLinearFoot: true,
      description: "Price varies by perimeter length"
    },
    "stairs": {
      name: "Stairs (4-6 steps)",
      low: 1200,
      high: 2000,
      perLinearFoot: false,
      description: "Standard staircase with landing"
    },
    "lighting": {
      name: "LED Lighting Package",
      low: 800,
      high: 1500,
      perLinearFoot: false,
      description: "Post caps + step lights"
    },
    "pergola": {
      name: "10x10 Pergola",
      low: 4000,
      high: 7000,
      perLinearFoot: false,
      description: "Attached composite pergola"
    },
    "builtin-seating": {
      name: "Built-in Bench Seating",
      low: 1500,
      high: 2500,
      perLinearFoot: false,
      description: "L-shaped or perimeter seating"
    },
    "skirting": {
      name: "Deck Skirting",
      low: 600,
      high: 1200,
      perLinearFoot: true,
      description: "Lattice or solid skirting"
    }
  },

  // Estimate variance (adds buffer for unknowns)
  variance: {
    low: 0.9,   // -10% for best case
    high: 1.15  // +15% for contingencies
  },

  // Minimum project size
  minimumPrice: 8000
};
