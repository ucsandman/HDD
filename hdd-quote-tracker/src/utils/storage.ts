import type { Quote } from '../types';

const STORAGE_KEY = 'hdd-quotes';

export function loadQuotes(): Quote[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load quotes:', error);
    return [];
  }
}

export function saveQuotes(quotes: Quote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (error) {
    console.error('Failed to save quotes:', error);
  }
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
    quote.id,
    quote.customerName,
    quote.customerPhone,
    quote.customerEmail,
    quote.projectType,
    quote.squareFootage,
    quote.material,
    quote.estimatedTotal,
    quote.status,
    quote.createdAt,
    quote.lastFollowUp || '',
    quote.nextFollowUp || '',
    quote.notes,
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
