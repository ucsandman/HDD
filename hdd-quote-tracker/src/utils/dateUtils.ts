import type { Quote } from '../types';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function addHours(dateString: string, hours: number): string {
  const date = new Date(dateString);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function calculateNextFollowUp(quote: Quote): string | null {
  const now = new Date();

  // Check which follow-up is due based on status
  switch (quote.status) {
    case 'sent':
    case 'viewed':
      // 24 hour follow-up
      const followUp24h = addHours(quote.createdAt, 24);
      if (new Date(followUp24h) > now) {
        return followUp24h;
      }
      return addHours(quote.createdAt, 72); // Move to 72h

    case 'followup1':
      // 72 hour follow-up
      return addHours(quote.createdAt, 72);

    case 'followup2':
      // 7 day follow-up
      return addDays(quote.createdAt, 7);

    case 'followup3':
      // Auto-close at 14 days
      return addDays(quote.createdAt, 14);

    default:
      return null;
  }
}

export function isOverdue(nextFollowUp: string | null): boolean {
  if (!nextFollowUp) return false;
  return new Date(nextFollowUp) < new Date();
}

export function getDaysOld(dateString: string): number {
  const created = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
