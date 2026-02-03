import type { Lead, DateRange } from '../types'

export function filterLeadsByDateRange(leads: Lead[], range: DateRange): Lead[] {
  if (range === 'all') return leads

  const now = new Date()
  const cutoffDate = new Date()

  switch (range) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7)
      break
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3)
      break
  }

  return leads.filter(lead => {
    const leadDate = new Date(lead.createdAt)
    return leadDate >= cutoffDate
  })
}

export interface ConversionFunnelData {
  stage: string
  count: number
  percentage: number
  averageDays?: number
}

export function calculateConversionFunnel(leads: Lead[]): ConversionFunnelData[] {
  const total = leads.length
  if (total === 0) return []

  const statusOrder: Lead['status'][] = ['new', 'contacted', 'quoted', 'qualified', 'sold']
  const statusLabels: Record<Lead['status'], string> = {
    new: 'New Leads',
    contacted: 'Contacted',
    quoted: 'Quoted',
    qualified: 'Qualified',
    sold: 'Sold',
    lost: 'Lost'
  }

  const statusCounts = statusOrder.reduce((acc, status) => {
    acc[status] = leads.filter(l => l.status === status).length
    return acc
  }, {} as Record<Lead['status'], number>)

  // Calculate cumulative counts (each stage includes all later stages)
  const cumulativeCounts: Record<Lead['status'], number> = { ...statusCounts }
  for (let i = statusOrder.length - 2; i >= 0; i--) {
    for (let j = i + 1; j < statusOrder.length; j++) {
      cumulativeCounts[statusOrder[i]] += statusCounts[statusOrder[j]]
    }
  }

  return statusOrder.map(status => ({
    stage: statusLabels[status],
    count: cumulativeCounts[status],
    percentage: Math.round((cumulativeCounts[status] / total) * 100)
  }))
}

export function calculateAverageTimeToClose(leads: Lead[]): number {
  const soldLeads = leads.filter(l => l.status === 'sold')
  if (soldLeads.length === 0) return 0

  const totalDays = soldLeads.reduce((sum, lead) => {
    const createdDate = new Date(lead.createdAt)
    const now = new Date()
    const days = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)

  return Math.round(totalDays / soldLeads.length)
}

export interface SourceMetrics {
  source: string
  count: number
  sold: number
  value: number
  conversionRate: number
  avgTimeToClose: number
}

export function calculateSourceMetrics(leads: Lead[], sources: string[]): SourceMetrics[] {
  return sources
    .map(source => {
      const sourceLeads = leads.filter(l => l.source === source)
      const sold = sourceLeads.filter(l => l.status === 'sold')

      // Calculate average time to close for this source
      let avgTimeToClose = 0
      if (sold.length > 0) {
        const totalDays = sold.reduce((sum, lead) => {
          const createdDate = new Date(lead.createdAt)
          const now = new Date()
          const days = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0)
        avgTimeToClose = Math.round(totalDays / sold.length)
      }

      return {
        source,
        count: sourceLeads.length,
        sold: sold.length,
        value: sold.reduce((sum, l) => sum + (l.value || 0), 0),
        conversionRate: sourceLeads.length ? Math.round((sold.length / sourceLeads.length) * 100) : 0,
        avgTimeToClose
      }
    })
    .filter(s => s.count > 0)
    .sort((a, b) => b.value - a.value)
}
