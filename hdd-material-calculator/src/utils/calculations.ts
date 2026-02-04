import type {
  DeckConfig,
  CalculationResult,
  MaterialItem,
  MaterialCategory,
  MATERIAL_PRICES,
} from '../types';

/**
 * Main calculation function
 */
export function calculateMaterials(config: DeckConfig): CalculationResult {
  const materials: MaterialItem[] = [];
  const { dimensions, wasteFactor } = config;

  // Calculate basic measurements
  const totalSquareFeet = dimensions.length * dimensions.width;
  const deckingSquareFeet = totalSquareFeet * (1 + wasteFactor / 100);

  // Determine if railing is required (height > 30")
  const requiresRailing = dimensions.height > 30 || config.railingStyle !== 'none';

  // Calculate perimeter for railing
  const perimeter = 2 * (dimensions.length + dimensions.width);
  // Subtract house side if attached
  const railingLinearFeet = config.style === 'elevated'
    ? perimeter - dimensions.length
    : perimeter;

  // Calculate joists
  const joistLength = config.deckingDirection === 'parallel'
    ? dimensions.length
    : dimensions.width;
  const joistSpan = config.deckingDirection === 'parallel'
    ? dimensions.width
    : dimensions.length;
  const joistCount = Math.ceil((joistSpan * 12) / config.joistSpacing) + 1;

  // Calculate posts (every 6-8 feet along beam)
  const beamLength = config.deckingDirection === 'parallel'
    ? dimensions.width
    : dimensions.length;
  const postSpacing = 6; // feet
  const postCount = config.style === 'ground_level'
    ? 0
    : (Math.ceil(beamLength / postSpacing) + 1) * 2; // 2 beam lines for larger decks

  const footingCount = postCount || (config.style === 'ground_level' ? Math.ceil(totalSquareFeet / 16) : 0);

  // Calculate stairs
  const stairRiseCount = config.hasStairs ? Math.ceil(dimensions.height / 7.5) : 0;

  // Calculate decking boards
  const deckingLinearFeet = calculateDeckingLinearFeet(config, deckingSquareFeet);

  // Add decking materials
  materials.push(...calculateDeckingMaterials(config, deckingLinearFeet));

  // Add framing materials
  materials.push(...calculateFramingMaterials(config, joistCount, joistLength, postCount));

  // Add hardware
  materials.push(...calculateHardware(config, joistCount, postCount));

  // Add concrete/footings
  materials.push(...calculateConcrete(config, footingCount));

  // Add railing if needed
  if (requiresRailing && config.railingStyle !== 'none') {
    materials.push(...calculateRailing(config, railingLinearFeet));
  }

  // Add stairs if needed
  if (config.hasStairs && stairRiseCount > 0) {
    materials.push(...calculateStairs(config, stairRiseCount));
  }

  // Calculate estimated costs
  const estimatedCost = calculateEstimatedCosts(materials);

  return {
    config,
    materials,
    summary: {
      totalSquareFeet,
      deckingSquareFeet,
      linearFeetDecking: deckingLinearFeet,
      joistCount,
      postCount,
      footingCount,
      stairRiseCount,
      railingLinearFeet: requiresRailing ? railingLinearFeet : 0,
    },
    estimatedCost,
    calculatedAt: new Date().toISOString(),
  };
}

function calculateDeckingLinearFeet(config: DeckConfig, squareFeet: number): number {
  // Standard deck board is 5.5" wide (5/4x6 actual)
  const boardWidth = 5.5 / 12; // feet
  const boardsNeeded = squareFeet / boardWidth;

  // Standard board lengths: 8, 10, 12, 16, 20 ft
  // We'll calculate based on the deck dimension
  const boardLength = config.deckingDirection === 'parallel'
    ? config.dimensions.width
    : config.dimensions.length;

  return boardsNeeded * boardLength;
}

function calculateDeckingMaterials(config: DeckConfig, linearFeet: number): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { deckingMaterial, dimensions, deckingDirection } = config;

  const boardLength = deckingDirection === 'parallel'
    ? dimensions.width
    : dimensions.length;

  // Determine optimal board length
  const standardLengths = [8, 10, 12, 16, 20];
  const optimalLength = standardLengths.find(l => l >= boardLength) || 20;

  // Calculate number of boards
  const boardWidth = 5.5 / 12; // feet
  const span = deckingDirection === 'parallel' ? dimensions.length : dimensions.width;
  const boardCount = Math.ceil((span / boardWidth) * (1 + config.wasteFactor / 100));

  let name = '';
  let priceKey = '';

  switch (deckingMaterial) {
    case 'pressure_treated':
      name = `5/4x6 Pressure Treated Decking - ${optimalLength}'`;
      priceKey = 'deck_pt_5/4x6';
      break;
    case 'cedar':
      name = `5/4x6 Cedar Decking - ${optimalLength}'`;
      priceKey = 'deck_cedar_5/4x6';
      break;
    case 'composite_standard':
      name = `Composite Deck Board - ${optimalLength}'`;
      priceKey = 'deck_composite_std';
      break;
    case 'composite_premium':
      name = `Premium Composite Deck Board - ${optimalLength}'`;
      priceKey = 'deck_composite_prem';
      break;
  }

  materials.push({
    id: 'decking_boards',
    category: 'decking',
    name,
    description: `${optimalLength}' boards for ${dimensions.length}' x ${dimensions.width}' deck`,
    quantity: boardCount,
    unit: 'boards',
    notes: `Running ${deckingDirection} to house. Includes ${config.wasteFactor}% waste.`,
  });

  // Add fascia boards
  const fasciaCount = Math.ceil((2 * (dimensions.length + dimensions.width)) / 12);
  materials.push({
    id: 'fascia_boards',
    category: 'decking',
    name: deckingMaterial.includes('composite')
      ? 'Composite Fascia Board - 12\''
      : `1x8 ${deckingMaterial === 'cedar' ? 'Cedar' : 'PT'} Fascia - 12'`,
    description: 'Fascia to cover rim joists',
    quantity: fasciaCount,
    unit: 'boards',
  });

  return materials;
}

function calculateFramingMaterials(
  config: DeckConfig,
  joistCount: number,
  joistLength: number,
  postCount: number
): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { dimensions, style, framingMaterial } = config;
  const matPrefix = framingMaterial === 'cedar' ? 'Cedar' : 'PT';

  // Determine joist size based on span
  let joistSize = '2x8';
  if (joistLength > 10) joistSize = '2x10';
  if (joistLength > 14) joistSize = '2x12';

  // Joists
  const standardLengths = [8, 10, 12, 14, 16];
  const joistBoardLength = standardLengths.find(l => l >= joistLength) || 16;

  materials.push({
    id: 'joists',
    category: 'framing',
    name: `${joistSize} x ${joistBoardLength}' ${matPrefix}`,
    description: `Floor joists @ ${config.joistSpacing}" O.C.`,
    quantity: joistCount,
    unit: 'boards',
  });

  // Rim joists (2 sides)
  const rimLength = config.deckingDirection === 'parallel'
    ? dimensions.width
    : dimensions.length;
  materials.push({
    id: 'rim_joists',
    category: 'framing',
    name: `${joistSize} x ${Math.ceil(rimLength)}' ${matPrefix}`,
    description: 'Rim/band joists',
    quantity: 2,
    unit: 'boards',
  });

  // Ledger board (if attached)
  if (style === 'elevated') {
    materials.push({
      id: 'ledger',
      category: 'framing',
      name: `${joistSize} x ${Math.ceil(dimensions.length)}' ${matPrefix}`,
      description: 'Ledger board (attached to house)',
      quantity: 1,
      unit: 'board',
    });
  }

  // Beam (doubled 2x10 or 2x12)
  if (style !== 'ground_level') {
    const beamSize = joistLength > 8 ? '2x12' : '2x10';
    const beamLength = config.deckingDirection === 'parallel'
      ? dimensions.width
      : dimensions.length;

    materials.push({
      id: 'beam',
      category: 'framing',
      name: `${beamSize} x ${Math.ceil(beamLength)}' ${matPrefix}`,
      description: 'Beam (doubled)',
      quantity: 4, // 2 beams, doubled
      unit: 'boards',
    });
  }

  // Posts
  if (postCount > 0) {
    const postLength = Math.ceil(dimensions.height / 12) + 2; // Add 2' for burial/attachment
    const postSize = dimensions.height > 48 ? '6x6' : '4x4';

    materials.push({
      id: 'posts',
      category: 'framing',
      name: `${postSize} x ${postLength}' ${matPrefix} Post`,
      description: 'Support posts',
      quantity: postCount,
      unit: 'posts',
    });
  }

  // Blocking (mid-span for longer joists)
  if (joistLength > 10) {
    materials.push({
      id: 'blocking',
      category: 'framing',
      name: `${joistSize} x 10' ${matPrefix}`,
      description: 'Mid-span blocking',
      quantity: Math.ceil(joistCount / 3),
      unit: 'boards',
    });
  }

  return materials;
}

function calculateHardware(config: DeckConfig, joistCount: number, postCount: number): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { dimensions, style } = config;
  const totalSquareFeet = dimensions.length * dimensions.width;

  // Joist hangers
  materials.push({
    id: 'joist_hangers',
    category: 'hardware',
    name: 'Joist Hangers (LUS28 or similar)',
    description: 'For each joist connection',
    quantity: joistCount * (style === 'elevated' ? 2 : 1),
    unit: 'hangers',
  });

  // Post brackets
  if (postCount > 0) {
    materials.push({
      id: 'post_brackets',
      category: 'hardware',
      name: 'Adjustable Post Base',
      description: 'Post-to-concrete connection',
      quantity: postCount,
      unit: 'brackets',
    });

    // Post-to-beam connectors
    materials.push({
      id: 'post_caps',
      category: 'hardware',
      name: 'Post Cap/Beam Connector',
      description: 'Post-to-beam connection',
      quantity: postCount,
      unit: 'connectors',
    });
  }

  // Ledger hardware (if attached)
  if (style === 'elevated') {
    const lagCount = Math.ceil(dimensions.length / 1.5) * 2; // Every 16" staggered
    materials.push({
      id: 'lag_bolts',
      category: 'hardware',
      name: '1/2" x 4" Lag Bolts with Washers',
      description: 'Ledger attachment',
      quantity: lagCount,
      unit: 'bolts',
    });

    materials.push({
      id: 'flashing',
      category: 'hardware',
      name: `Ledger Flashing - ${Math.ceil(dimensions.length)}' roll`,
      description: 'Prevent water intrusion',
      quantity: 1,
      unit: 'roll',
    });
  }

  // Deck screws
  const screwsPerSqFt = config.deckingMaterial.includes('composite') ? 0.75 : 1;
  const deckScrewLbs = Math.ceil((totalSquareFeet * screwsPerSqFt) / 75); // ~75 screws per lb for #8 2.5"

  materials.push({
    id: 'deck_screws',
    category: 'hardware',
    name: config.deckingMaterial.includes('composite')
      ? 'Composite Deck Screws - 2.5"'
      : 'Exterior Deck Screws - 2.5"',
    description: 'For decking attachment',
    quantity: Math.max(5, deckScrewLbs),
    unit: 'lbs',
  });

  // Structural screws
  materials.push({
    id: 'structural_screws',
    category: 'hardware',
    name: 'Structural Screws - 3"',
    description: 'For framing connections',
    quantity: Math.ceil(totalSquareFeet / 20),
    unit: 'lbs',
  });

  // Joist tape (for composite)
  if (config.deckingMaterial.includes('composite')) {
    const joistTapeFeet = joistCount * (config.deckingDirection === 'parallel'
      ? dimensions.length
      : dimensions.width);
    materials.push({
      id: 'joist_tape',
      category: 'hardware',
      name: 'Joist Tape',
      description: 'Protects joists under composite',
      quantity: Math.ceil(joistTapeFeet / 50),
      unit: 'rolls (50\')',
    });
  }

  return materials;
}

function calculateConcrete(config: DeckConfig, footingCount: number): MaterialItem[] {
  const materials: MaterialItem[] = [];

  if (footingCount === 0) return materials;

  const { dimensions } = config;
  const isHeavyLoad = dimensions.height > 48 || (dimensions.length * dimensions.width) > 200;
  const tubeDiameter = isHeavyLoad ? 12 : 10;
  const tubeDepth = 42; // inches (below frost line for Cincinnati)

  // Sono tubes
  materials.push({
    id: 'sono_tubes',
    category: 'concrete',
    name: `${tubeDiameter}" Sono Tube`,
    description: `${tubeDepth}" depth for frost protection`,
    quantity: footingCount,
    unit: 'tubes',
  });

  // Concrete bags per footing
  const cuFtPerFooting = (Math.PI * Math.pow(tubeDiameter / 2 / 12, 2) * (tubeDepth / 12));
  const bagsPerFooting = Math.ceil(cuFtPerFooting / 0.6); // 80lb bag = ~0.6 cu ft

  materials.push({
    id: 'concrete',
    category: 'concrete',
    name: 'Concrete Mix - 80lb bags',
    description: `~${bagsPerFooting} bags per footing`,
    quantity: footingCount * bagsPerFooting,
    unit: 'bags',
  });

  // Gravel
  materials.push({
    id: 'gravel',
    category: 'concrete',
    name: 'Drainage Gravel',
    description: '4" base under each footing',
    quantity: Math.ceil(footingCount * 0.5),
    unit: 'bags (50lb)',
  });

  return materials;
}

function calculateRailing(config: DeckConfig, linearFeet: number): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { railingStyle } = config;

  // Post count (every 6' max)
  const railPostCount = Math.ceil(linearFeet / 6) + 1;

  switch (railingStyle) {
    case 'wood':
      materials.push({
        id: 'rail_posts',
        category: 'railing',
        name: '4x4 PT Rail Posts - 42"',
        description: 'Railing posts',
        quantity: railPostCount,
        unit: 'posts',
      });
      materials.push({
        id: 'rail_top',
        category: 'railing',
        name: '2x6 PT Rail Cap',
        description: 'Top rail',
        quantity: Math.ceil(linearFeet / 12),
        unit: 'boards (12\')',
      });
      materials.push({
        id: 'rail_bottom',
        category: 'railing',
        name: '2x4 PT Rail',
        description: 'Bottom rail',
        quantity: Math.ceil(linearFeet / 12),
        unit: 'boards (12\')',
      });
      materials.push({
        id: 'balusters',
        category: 'railing',
        name: '2x2 PT Balusters - 36"',
        description: '4" spacing (code)',
        quantity: Math.ceil(linearFeet * 3),
        unit: 'balusters',
      });
      break;

    case 'composite':
    case 'aluminum':
    case 'cable':
      materials.push({
        id: 'rail_kit',
        category: 'railing',
        name: `${railingStyle.charAt(0).toUpperCase() + railingStyle.slice(1)} Railing Kit`,
        description: `6' sections with posts and balusters`,
        quantity: Math.ceil(linearFeet / 6),
        unit: 'kits (6\')',
        notes: 'Includes posts, rails, balusters, and hardware',
      });
      break;
  }

  // Post mounting hardware
  materials.push({
    id: 'rail_post_mounts',
    category: 'railing',
    name: 'Rail Post Mount Brackets',
    description: 'Surface or fascia mount',
    quantity: railPostCount,
    unit: 'brackets',
  });

  return materials;
}

function calculateStairs(config: DeckConfig, riseCount: number): MaterialItem[] {
  const materials: MaterialItem[] = [];
  const { stairWidth, framingMaterial } = config;
  const matPrefix = framingMaterial === 'cedar' ? 'Cedar' : 'PT';

  // Stringers (3 for 36", 4 for 48"+)
  const stringerCount = stairWidth >= 48 ? 4 : 3;
  const stringerLength = Math.ceil(riseCount * 11 / 12) + 2; // ~11" run per step + landing

  materials.push({
    id: 'stringers',
    category: 'stairs',
    name: `2x12 x ${stringerLength}' ${matPrefix} Stringer`,
    description: 'Cut stringers',
    quantity: stringerCount,
    unit: 'boards',
    notes: 'Or use pre-cut steel stringers',
  });

  // Treads (2 boards per step)
  const treadCount = riseCount * 2;
  materials.push({
    id: 'stair_treads',
    category: 'stairs',
    name: config.deckingMaterial.includes('composite')
      ? `Composite Stair Tread - ${stairWidth + 2}"`
      : `5/4x6 x ${Math.ceil(stairWidth / 12 + 1)}' ${matPrefix}`,
    description: '2 boards per tread',
    quantity: treadCount,
    unit: 'boards',
  });

  // Stair railing (if more than 3 risers)
  if (riseCount > 3) {
    const stairRailLength = Math.ceil(riseCount * 11 / 12) + 2;
    materials.push({
      id: 'stair_rail',
      category: 'stairs',
      name: 'Stair Railing Kit',
      description: `Angled railing for ${riseCount} steps`,
      quantity: 2, // Both sides
      unit: 'kits',
    });
  }

  // Landing pad
  materials.push({
    id: 'landing_pad',
    category: 'stairs',
    name: 'Concrete Paver - 24x24"',
    description: 'Landing pad at bottom',
    quantity: Math.ceil(stairWidth / 24),
    unit: 'pavers',
  });

  return materials;
}

function calculateEstimatedCosts(materials: MaterialItem[]): { materials: number } {
  // This would use MATERIAL_PRICES in a real implementation
  // For now, return placeholder
  const total = materials.reduce((sum, item) => {
    // Rough estimates based on category
    let unitCost = 0;
    switch (item.category) {
      case 'decking': unitCost = 25; break;
      case 'framing': unitCost = 15; break;
      case 'hardware': unitCost = 8; break;
      case 'concrete': unitCost = 7; break;
      case 'railing': unitCost = 40; break;
      case 'stairs': unitCost = 30; break;
      default: unitCost = 10;
    }
    return sum + (item.quantity * unitCost);
  }, 0);

  return { materials: Math.round(total) };
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): DeckConfig {
  return {
    dimensions: {
      length: 16,
      width: 12,
      height: 24,
    },
    style: 'elevated',
    deckingMaterial: 'pressure_treated',
    framingMaterial: 'pressure_treated',
    joistSpacing: 16,
    deckingDirection: 'perpendicular',
    railingStyle: 'wood',
    hasStairs: true,
    stairWidth: 36,
    wasteFactor: 10,
  };
}
