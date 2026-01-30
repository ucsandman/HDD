import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(d)
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getLeadStatusColor(status: string): string {
  switch (status) {
    case 'new':
      return 'bg-blue-100 text-blue-800'
    case 'contacted':
      return 'bg-yellow-100 text-yellow-800'
    case 'engaged':
      return 'bg-purple-100 text-purple-800'
    case 'qualified':
      return 'bg-indigo-100 text-indigo-800'
    case 'booked':
      return 'bg-green-100 text-green-800'
    case 'won':
      return 'bg-emerald-100 text-emerald-800'
    case 'lost':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getLeadStatusLabel(status: string): string {
  switch (status) {
    case 'new':
      return 'New'
    case 'contacted':
      return 'Contacted'
    case 'engaged':
      return 'Engaged'
    case 'qualified':
      return 'Qualified'
    case 'booked':
      return 'Booked'
    case 'won':
      return 'Won'
    case 'lost':
      return 'Lost'
    default:
      return status
  }
}

export function getSequenceStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'stopped':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getSequenceStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'paused':
      return 'Paused'
    case 'completed':
      return 'Completed'
    case 'stopped':
      return 'Stopped'
    default:
      return status
  }
}

export function getMessageChannelIcon(channel: string): string {
  switch (channel) {
    case 'sms':
      return 'MessageSquare'
    case 'email':
      return 'Mail'
    default:
      return 'MessageCircle'
  }
}

export function getProjectTypeLabel(type: string): string {
  switch (type) {
    case 'deck':
      return 'Deck'
    case 'pergola':
      return 'Pergola'
    case 'railing':
      return 'Railing'
    case 'sunroom':
      return 'Sunroom'
    case 'hot_tub_deck':
      return 'Hot Tub Deck'
    case 'pool_deck':
      return 'Pool Deck'
    case 'multi_level_deck':
      return 'Multi-Level Deck'
    case 'screen_room':
      return 'Screen Room'
    case 'other':
      return 'Other'
    default:
      return type
  }
}
