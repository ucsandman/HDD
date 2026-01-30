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

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'pending_review':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
      return 'bg-blue-100 text-blue-800'
    case 'scheduled':
      return 'bg-purple-100 text-purple-800'
    case 'published':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'pending_review':
      return 'Pending Review'
    case 'approved':
      return 'Approved'
    case 'scheduled':
      return 'Scheduled'
    case 'published':
      return 'Published'
    case 'failed':
      return 'Failed'
    default:
      return status
  }
}

export function getPostTypeLabel(type: string): string {
  switch (type) {
    case 'project_showcase':
      return 'Project Showcase'
    case 'educational':
      return 'Educational'
    case 'seasonal':
      return 'Seasonal'
    default:
      return type
  }
}
