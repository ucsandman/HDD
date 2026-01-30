'use client'

import { Bell, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {action && (
          <Link href={action.href}>
            <Button>
              <Plus className="h-4 w-4" />
              {action.label}
            </Button>
          </Link>
        )}
      </div>
    </header>
  )
}
