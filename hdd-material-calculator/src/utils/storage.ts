import type { SavedCalculation, CalculationResult } from '../types';

const STORAGE_KEY = 'hdd-material-calculations';

const logError = (message: string, error: unknown) => {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
};

export function loadCalculations(): SavedCalculation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    logError('Failed to load calculations:', error);
    return [];
  }
}

export function saveCalculations(calculations: SavedCalculation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
  } catch (error) {
    logError('Failed to save calculations:', error);
  }
}

export function saveCalculation(
  name: string,
  result: CalculationResult,
  customerName?: string,
  projectAddress?: string
): SavedCalculation {
  const calculations = loadCalculations();
  const now = new Date().toISOString();

  const newCalculation: SavedCalculation = {
    id: Date.now().toString(),
    name,
    customerName,
    projectAddress,
    result,
    createdAt: now,
    updatedAt: now,
  };

  calculations.unshift(newCalculation);
  saveCalculations(calculations);

  return newCalculation;
}

export function deleteCalculation(id: string): void {
  const calculations = loadCalculations();
  saveCalculations(calculations.filter(c => c.id !== id));
}

/**
 * Export materials list to clipboard as text
 */
export function copyMaterialsToClipboard(result: CalculationResult): Promise<void> {
  const { config, materials, summary } = result;

  let text = `DECK MATERIAL LIST\n`;
  text += `${'='.repeat(50)}\n\n`;
  text += `Deck Size: ${config.dimensions.length}' x ${config.dimensions.width}'\n`;
  text += `Height: ${config.dimensions.height}"\n`;
  text += `Style: ${config.style.replace('_', ' ')}\n`;
  text += `Decking: ${config.deckingMaterial.replace('_', ' ')}\n`;
  text += `Total Sq Ft: ${summary.totalSquareFeet}\n\n`;

  text += `MATERIALS\n`;
  text += `${'-'.repeat(50)}\n\n`;

  const categories = [...new Set(materials.map(m => m.category))];

  for (const category of categories) {
    const categoryMaterials = materials.filter(m => m.category === category);
    text += `${category.toUpperCase()}\n`;

    for (const item of categoryMaterials) {
      text += `  ${item.quantity} ${item.unit} - ${item.name}\n`;
      if (item.notes) {
        text += `    Note: ${item.notes}\n`;
      }
    }
    text += '\n';
  }

  if (result.estimatedCost) {
    text += `ESTIMATED MATERIAL COST: $${result.estimatedCost.materials.toLocaleString()}\n`;
    text += `(Prices are estimates only - verify with supplier)\n`;
  }

  text += `\nGenerated: ${new Date(result.calculatedAt).toLocaleString()}\n`;
  text += `Hickory Dickory Decks - Cincinnati\n`;

  return navigator.clipboard.writeText(text);
}

/**
 * Export to CSV format
 */
export function exportToCSV(result: CalculationResult): void {
  const { config, materials } = result;

  const escapeCSV = (value: string | number | undefined): string => {
    if (value === undefined) return '';
    const str = String(value);
    if (/^[=+\-@\t\r]/.test(str)) return "'" + str;
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = ['Category', 'Item', 'Quantity', 'Unit', 'Description', 'Notes'];
  const rows = materials.map(item => [
    escapeCSV(item.category),
    escapeCSV(item.name),
    escapeCSV(item.quantity),
    escapeCSV(item.unit),
    escapeCSV(item.description),
    escapeCSV(item.notes || ''),
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `deck-materials-${config.dimensions.length}x${config.dimensions.width}-${new Date().toISOString().split('T')[0]}.csv`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
