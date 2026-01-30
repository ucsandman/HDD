/**
 * Normalize a phone number to E.164 format (+1XXXXXXXXXX for US numbers)
 * Returns null if the phone number is invalid
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Handle different formats
  if (digits.length === 10) {
    // US number without country code: 5135551234
    return `+1${digits}`
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    // US number with country code: 15135551234
    return `+${digits}`
  }

  if (digits.length >= 10 && digits.length <= 15) {
    // International number - assume it's valid
    return `+${digits}`
  }

  // Invalid phone number
  return null
}

/**
 * Format a phone number for display (XXX) XXX-XXXX
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return ''

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // Handle US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  // Return as-is for international numbers
  return phone
}

/**
 * Validate that a phone number can be normalized to E.164 format
 */
export function isValidPhone(phone: string | null | undefined): boolean {
  return normalizePhone(phone) !== null
}

/**
 * Compare two phone numbers for equality (normalizing both first)
 */
export function phonesMatch(
  phone1: string | null | undefined,
  phone2: string | null | undefined
): boolean {
  const normalized1 = normalizePhone(phone1)
  const normalized2 = normalizePhone(phone2)

  if (!normalized1 || !normalized2) return false
  return normalized1 === normalized2
}
