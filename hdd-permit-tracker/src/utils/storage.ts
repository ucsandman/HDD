import type { Permit, Municipality } from '../types';
import { DEFAULT_MUNICIPALITIES } from '../data/municipalities';

const PERMITS_KEY = 'hdd-permits';
const MUNICIPALITIES_KEY = 'hdd-municipalities';

// Only log errors in development mode
const logError = (message: string, error: unknown) => {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
};

// Permits storage
export function loadPermits(): Permit[] {
  try {
    const stored = localStorage.getItem(PERMITS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    logError('Failed to load permits:', error);
    return [];
  }
}

export function savePermits(permits: Permit[]): void {
  try {
    localStorage.setItem(PERMITS_KEY, JSON.stringify(permits));
  } catch (error) {
    logError('Failed to save permits:', error);
  }
}

// Municipalities storage
export function loadMunicipalities(): Municipality[] {
  try {
    const stored = localStorage.getItem(MUNICIPALITIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with defaults on first load
    saveMunicipalities(DEFAULT_MUNICIPALITIES);
    return DEFAULT_MUNICIPALITIES;
  } catch (error) {
    logError('Failed to load municipalities:', error);
    return DEFAULT_MUNICIPALITIES;
  }
}

export function saveMunicipalities(municipalities: Municipality[]): void {
  try {
    localStorage.setItem(MUNICIPALITIES_KEY, JSON.stringify(municipalities));
  } catch (error) {
    logError('Failed to save municipalities:', error);
  }
}

/**
 * Escape a value for safe CSV output
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Prevent CSV injection
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }

  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function exportPermitsCSV(permits: Permit[]): void {
  const headers = [
    'ID',
    'Project Address',
    'Customer Name',
    'Municipality',
    'Permit Type',
    'Permit Number',
    'Status',
    'Application Date',
    'Approval Date',
    'Expiration Date',
    'Application Fee',
    'Fee Paid',
    'Notes',
    'Created At',
  ];

  const rows = permits.map((permit) => [
    escapeCSV(permit.id),
    escapeCSV(permit.projectAddress),
    escapeCSV(permit.customerName),
    escapeCSV(permit.municipality),
    escapeCSV(permit.permitType),
    escapeCSV(permit.permitNumber || ''),
    escapeCSV(permit.status),
    escapeCSV(permit.applicationDate || ''),
    escapeCSV(permit.approvalDate || ''),
    escapeCSV(permit.expirationDate || ''),
    escapeCSV(permit.applicationFee || ''),
    escapeCSV(permit.feePaid ? 'Yes' : 'No'),
    escapeCSV(permit.notes),
    escapeCSV(permit.createdAt),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hdd-permits-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
