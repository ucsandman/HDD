import type { Campaign, CampaignTemplate } from '../types';
import { DEFAULT_TEMPLATES } from '../types';

const CAMPAIGNS_KEY = 'hdd-campaigns';
const CUSTOM_TEMPLATES_KEY = 'hdd-campaign-templates';

// Only log errors in development mode
const logError = (message: string, error: unknown) => {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
};

// Campaign storage
export function loadCampaigns(): Campaign[] {
  try {
    const stored = localStorage.getItem(CAMPAIGNS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    logError('Failed to load campaigns:', error);
    return [];
  }
}

export function saveCampaigns(campaigns: Campaign[]): void {
  try {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  } catch (error) {
    logError('Failed to save campaigns:', error);
  }
}

// Custom template storage
export function loadCustomTemplates(): CampaignTemplate[] {
  try {
    const stored = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    logError('Failed to load custom templates:', error);
    return [];
  }
}

export function saveCustomTemplates(templates: CampaignTemplate[]): void {
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    logError('Failed to save custom templates:', error);
  }
}

// Get all templates (default + custom)
export function getAllTemplates(): CampaignTemplate[] {
  const customTemplates = loadCustomTemplates();
  return [...DEFAULT_TEMPLATES, ...customTemplates];
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

export function exportCampaignsCSV(campaigns: Campaign[], templates: CampaignTemplate[]): void {
  const headers = [
    'ID',
    'Name',
    'Template',
    'Season',
    'Type',
    'Scheduled Date',
    'Status',
    'Sent At',
    'Notes',
  ];

  const rows = campaigns.map((campaign) => {
    const template = templates.find(t => t.id === campaign.templateId);
    return [
      escapeCSV(campaign.id),
      escapeCSV(campaign.name),
      escapeCSV(template?.name || 'Unknown'),
      escapeCSV(campaign.season),
      escapeCSV(template?.type || ''),
      escapeCSV(campaign.scheduledDate),
      escapeCSV(campaign.status),
      escapeCSV(campaign.sentAt || ''),
      escapeCSV(campaign.notes),
    ];
  });

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hdd-campaigns-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
