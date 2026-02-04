import type {
  Supplier,
  Material,
  PriceEntry,
  PriceHistory,
  PriceComparison,
  DashboardStats,
  MaterialCategory
} from '../types';
import { DEFAULT_SUPPLIERS, DEFAULT_MATERIALS } from '../types';

const STORAGE_KEYS = {
  suppliers: 'hdd-supplier-tracker-suppliers',
  materials: 'hdd-supplier-tracker-materials',
  prices: 'hdd-supplier-tracker-prices',
  priceHistory: 'hdd-supplier-tracker-price-history',
  initialized: 'hdd-supplier-tracker-initialized',
};

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize with default data if first run
export function initializeDefaults(): void {
  const initialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (initialized) return;

  const now = new Date().toISOString();

  // Create default suppliers
  const suppliers: Supplier[] = DEFAULT_SUPPLIERS.map(s => ({
    ...s,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }));
  localStorage.setItem(STORAGE_KEYS.suppliers, JSON.stringify(suppliers));

  // Create default materials
  const materials: Material[] = DEFAULT_MATERIALS.map(m => ({
    ...m,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }));
  localStorage.setItem(STORAGE_KEYS.materials, JSON.stringify(materials));

  // Initialize empty prices and history
  localStorage.setItem(STORAGE_KEYS.prices, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.priceHistory, JSON.stringify([]));

  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

// Suppliers
export function loadSuppliers(): Supplier[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.suppliers);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSuppliers(suppliers: Supplier[]): void {
  localStorage.setItem(STORAGE_KEYS.suppliers, JSON.stringify(suppliers));
}

// Materials
export function loadMaterials(): Material[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.materials);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMaterials(materials: Material[]): void {
  localStorage.setItem(STORAGE_KEYS.materials, JSON.stringify(materials));
}

// Prices
export function loadPrices(): PriceEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.prices);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePrices(prices: PriceEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.prices, JSON.stringify(prices));
}

// Price History
export function loadPriceHistory(): PriceHistory[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.priceHistory);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePriceHistory(history: PriceHistory[]): void {
  localStorage.setItem(STORAGE_KEYS.priceHistory, JSON.stringify(history));
}

// Get prices for a specific material across all suppliers
export function getPricesForMaterial(
  materialId: string,
  prices: PriceEntry[],
  suppliers: Supplier[]
): PriceComparison['prices'] {
  return suppliers.map(supplier => {
    const supplierPrices = prices
      .filter(p => p.materialId === materialId && p.supplierId === supplier.id)
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

    const currentPrice = supplierPrices[0] || null;

    return {
      supplier,
      price: currentPrice,
      isLowest: false, // Will be calculated later
      isMostRecent: false, // Will be calculated later
    };
  });
}

// Build price comparison for a material
export function buildPriceComparison(
  material: Material,
  prices: PriceEntry[],
  suppliers: Supplier[]
): PriceComparison {
  const materialPrices = getPricesForMaterial(material.id, prices, suppliers);

  const pricesWithValues = materialPrices.filter(p => p.price !== null);
  const priceValues = pricesWithValues.map(p => p.price!.price);

  const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : null;
  const highestPrice = priceValues.length > 0 ? Math.max(...priceValues) : null;
  const averagePrice = priceValues.length > 0
    ? priceValues.reduce((a, b) => a + b, 0) / priceValues.length
    : null;

  // Find most recent update
  let mostRecentDate: Date | null = null;
  pricesWithValues.forEach(p => {
    const date = new Date(p.price!.effectiveDate);
    if (!mostRecentDate || date > mostRecentDate) {
      mostRecentDate = date;
    }
  });

  // Mark lowest and most recent
  const enhancedPrices = materialPrices.map(p => ({
    ...p,
    isLowest: p.price !== null && p.price.price === lowestPrice,
    isMostRecent: p.price !== null && mostRecentDate !== null &&
      new Date(p.price.effectiveDate).getTime() === mostRecentDate.getTime(),
  }));

  return {
    material,
    prices: enhancedPrices,
    lowestPrice,
    highestPrice,
    averagePrice,
  };
}

// Calculate dashboard stats
export function calculateDashboardStats(
  materials: Material[],
  suppliers: Supplier[],
  prices: PriceEntry[],
  priceHistory: PriceHistory[]
): DashboardStats {
  // Count recent price changes (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentChanges = priceHistory.filter(
    h => new Date(h.recordedAt) >= thirtyDaysAgo
  ).length;

  // Calculate average savings opportunity
  // (difference between highest and lowest price per material)
  let totalSavings = 0;
  let materialsWithMultiplePrices = 0;

  materials.forEach(material => {
    const materialPrices = prices
      .filter(p => p.materialId === material.id)
      .map(p => p.price);

    if (materialPrices.length >= 2) {
      const min = Math.min(...materialPrices);
      const max = Math.max(...materialPrices);
      if (max > 0) {
        totalSavings += ((max - min) / max) * 100;
        materialsWithMultiplePrices++;
      }
    }
  });

  const avgSavingsOpportunity = materialsWithMultiplePrices > 0
    ? totalSavings / materialsWithMultiplePrices
    : 0;

  return {
    totalMaterials: materials.length,
    totalSuppliers: suppliers.length,
    totalPriceEntries: prices.length,
    recentPriceChanges: recentChanges,
    avgSavingsOpportunity,
  };
}

// Export to CSV
export function exportPricesToCSV(
  materials: Material[],
  suppliers: Supplier[],
  prices: PriceEntry[]
): void {
  const escapeCSV = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return '';
    const str = String(value);
    if (/^[=+\-@\t\r]/.test(str)) {
      return `"'${str.replace(/"/g, '""')}"`;
    }
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build header with supplier columns
  const headers = ['Material', 'Category', 'Unit', ...suppliers.map(s => s.name)];

  // Build rows
  const rows = materials.map(material => {
    const row = [
      escapeCSV(material.name),
      escapeCSV(material.category),
      escapeCSV(material.unit),
    ];

    suppliers.forEach(supplier => {
      const price = prices
        .filter(p => p.materialId === material.id && p.supplierId === supplier.id)
        .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())[0];

      row.push(price ? escapeCSV(price.price.toFixed(2)) : '');
    });

    return row.join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `supplier-prices-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Format percentage
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// Get category color
export function getCategoryColor(category: MaterialCategory): string {
  const colors: Record<MaterialCategory, string> = {
    decking: '#2F5233',
    framing: '#3B82F6',
    hardware: '#8B5CF6',
    concrete: '#6B7280',
    railing: '#EC4899',
    fasteners: '#F59E0B',
    other: '#14B8A6',
  };
  return colors[category];
}
