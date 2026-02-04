import type { Quote } from '../types';

const STORAGE_KEY = 'hdd-quotes';

// Only log errors in development mode
const logError = (message: string, error: unknown) => {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
};

export function loadQuotes(): Quote[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    logError('Failed to load quotes:', error);
    return [];
  }
}

export function saveQuotes(quotes: Quote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (error) {
    logError('Failed to save quotes:', error);
  }
}

/**
 * Escape a value for safe CSV output
 * - Prevents CSV injection attacks by prefixing formula characters with single quote
 * - Wraps values containing commas, quotes, or newlines in double quotes
 * - Escapes internal double quotes by doubling them
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Prevent CSV injection: prefix cells starting with formula characters
  // These characters can trigger formula execution in Excel/Google Sheets
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }

  // If value contains special characters, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function exportQuotesCSV(quotes: Quote[]): void {
  const headers = [
    'ID',
    'Customer Name',
    'Phone',
    'Email',
    'Project Type',
    'Square Footage',
    'Material',
    'Estimated Total',
    'Status',
    'Created At',
    'Last Follow-Up',
    'Next Follow-Up',
    'Notes',
  ];

  const rows = quotes.map((quote) => [
    escapeCSV(quote.id),
    escapeCSV(quote.customerName),
    escapeCSV(quote.customerPhone),
    escapeCSV(quote.customerEmail),
    escapeCSV(quote.projectType),
    escapeCSV(quote.squareFootage),
    escapeCSV(quote.material),
    escapeCSV(quote.estimatedTotal),
    escapeCSV(quote.status),
    escapeCSV(quote.createdAt),
    escapeCSV(quote.lastFollowUp || ''),
    escapeCSV(quote.nextFollowUp || ''),
    escapeCSV(quote.notes),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hdd-quotes-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
