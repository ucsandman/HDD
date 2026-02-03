import type { Lead, Referrer } from '../types'

export interface CSVImportResult {
  imported: Lead[]
  skipped: Array<{ row: number; reason: string; data: string }>
  errors: Array<{ row: number; message: string }>
}

export function parseLeadCSV(csvText: string, existingLeads: Lead[]): CSVImportResult {
  const result: CSVImportResult = {
    imported: [],
    skipped: [],
    errors: []
  }

  const lines = csvText.trim().split('\n')
  if (lines.length === 0) {
    result.errors.push({ row: 0, message: 'Empty CSV file' })
    return result
  }

  const headers = lines[0].toLowerCase().split(',').map(h => h.trim())

  // Validate headers
  const requiredHeaders = ['name']
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
  if (missingHeaders.length > 0) {
    result.errors.push({
      row: 0,
      message: `Missing required headers: ${missingHeaders.join(', ')}`
    })
    return result
  }

  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    try {
      const values = parseCSVLine(line)
      const row: Record<string, string> = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      // Validate required fields
      if (!row.name || row.name.trim() === '') {
        result.skipped.push({
          row: i + 1,
          reason: 'Missing name',
          data: line
        })
        continue
      }

      // Check for duplicates
      const isDuplicate = checkDuplicate(row, existingLeads, result.imported)
      if (isDuplicate) {
        result.skipped.push({
          row: i + 1,
          reason: `Duplicate: ${isDuplicate}`,
          data: line
        })
        continue
      }

      // Create lead object
      const lead: Lead = {
        id: `${Date.now()}-${i}`,
        name: row.name.trim(),
        phone: row.phone?.trim() || '',
        email: row.email?.trim() || '',
        source: validateSource(row.source?.trim()) || 'Other',
        referralCode: row.referralcode?.trim().toUpperCase() || undefined,
        referredBy: row.referredby?.trim() || undefined,
        status: validateStatus(row.status?.trim()) || 'new',
        value: row.value ? parseFloat(row.value) : undefined,
        createdAt: row.createdat?.trim() || new Date().toISOString().split('T')[0],
        notes: row.notes?.trim() || ''
      }

      result.imported.push(lead)
    } catch (error) {
      result.errors.push({
        row: i + 1,
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return result
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

function checkDuplicate(row: Record<string, string>, existingLeads: Lead[], importedLeads: Lead[]): string | null {
  const allLeads = [...existingLeads, ...importedLeads]

  const phone = row.phone?.trim()
  const email = row.email?.trim().toLowerCase()

  if (phone) {
    const phoneMatch = allLeads.find(l => l.phone === phone)
    if (phoneMatch) return `phone ${phone} exists`
  }

  if (email) {
    const emailMatch = allLeads.find(l => l.email.toLowerCase() === email)
    if (emailMatch) return `email ${email} exists`
  }

  return null
}

function validateSource(source?: string): string | undefined {
  const validSources = [
    'Google Search', 'Google Business Profile', 'Facebook', 'Instagram',
    'Nextdoor', 'Yard Sign', 'Customer Referral', 'Home Show',
    'Angi/HomeAdvisor', 'Thumbtack', 'Direct Mail', 'Other'
  ]

  if (!source) return undefined

  const match = validSources.find(s => s.toLowerCase() === source.toLowerCase())
  return match
}

function validateStatus(status?: string): Lead['status'] | undefined {
  const validStatuses: Lead['status'][] = ['new', 'contacted', 'quoted', 'qualified', 'sold', 'lost']

  if (!status) return undefined

  const normalized = status.toLowerCase() as Lead['status']
  return validStatuses.includes(normalized) ? normalized : undefined
}

export function exportLeadsToCSV(leads: Lead[]): string {
  const headers = ['name', 'phone', 'email', 'source', 'referralCode', 'referredBy', 'status', 'value', 'createdAt', 'notes']
  const rows = [headers.join(',')]

  leads.forEach(lead => {
    const row = [
      escapeCSV(lead.name),
      escapeCSV(lead.phone),
      escapeCSV(lead.email),
      escapeCSV(lead.source),
      escapeCSV(lead.referralCode || ''),
      escapeCSV(lead.referredBy || ''),
      escapeCSV(lead.status),
      lead.value ? lead.value.toString() : '',
      escapeCSV(lead.createdAt),
      escapeCSV(lead.notes)
    ]
    rows.push(row.join(','))
  })

  return rows.join('\n')
}

export function exportReferrersToCSV(referrers: Referrer[]): string {
  const headers = ['name', 'code', 'phone', 'email', 'projectDate', 'referralCount', 'totalValue']
  const rows = [headers.join(',')]

  referrers.forEach(ref => {
    const row = [
      escapeCSV(ref.name),
      escapeCSV(ref.code),
      escapeCSV(ref.phone || ''),
      escapeCSV(ref.email || ''),
      escapeCSV(ref.projectDate || ''),
      ref.referralCount.toString(),
      ref.totalValue.toString()
    ]
    rows.push(row.join(','))
  })

  return rows.join('\n')
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
