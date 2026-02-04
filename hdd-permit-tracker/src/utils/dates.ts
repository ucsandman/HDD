/**
 * Format a date string for display
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return '';
  try {
    return new Date(dateString).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Get days until a date (negative if past)
 */
export function getDaysUntil(dateString: string | undefined): number | null {
  if (!dateString) return null;
  try {
    const target = new Date(dateString);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

/**
 * Get days since a date
 */
export function getDaysSince(dateString: string | undefined): number | null {
  if (!dateString) return null;
  try {
    const target = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - target.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

/**
 * Check if a permit is expiring soon (within 30 days)
 */
export function isExpiringSoon(expirationDate: string | undefined): boolean {
  const days = getDaysUntil(expirationDate);
  return days !== null && days > 0 && days <= 30;
}

/**
 * Check if a permit is expired
 */
export function isExpired(expirationDate: string | undefined): boolean {
  const days = getDaysUntil(expirationDate);
  return days !== null && days < 0;
}

/**
 * Check if a permit has been pending review for too long (over 14 days)
 */
export function isPendingTooLong(applicationDate: string | undefined, status: string): boolean {
  if (status !== 'pending_review' && status !== 'application_submitted') return false;
  const days = getDaysSince(applicationDate);
  return days !== null && days > 14;
}

/**
 * Calculate estimated approval date based on municipality average
 */
export function calculateEstimatedApproval(
  applicationDate: string | undefined,
  averageApprovalDays: number
): string | null {
  if (!applicationDate) return null;
  try {
    const date = new Date(applicationDate);
    date.setDate(date.getDate() + averageApprovalDays);
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Get today's date as ISO string
 */
export function getTodayISO(): string {
  return new Date().toISOString();
}

/**
 * Get today's date for input fields
 */
export function getTodayForInput(): string {
  return new Date().toISOString().split('T')[0];
}
