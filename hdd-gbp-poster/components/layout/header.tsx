'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Calendar,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Posts', href: '/posts', icon: FileText },
  { name: 'Images', href: '/images', icon: ImageIcon },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
]

// Demo mode indicator (read from environment at build time)
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

interface HeaderProps {
  user?: {
    name: string | null
    email: string
  }
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center gap-x-2">
          <h1 className="text-lg font-semibold text-hdd-green lg:hidden">
            GBP Poster
          </h1>
          {isDemoMode && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 lg:hidden">
              Demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {user && (
            <div className="hidden sm:flex sm:items-center sm:gap-x-3">
              <span className="text-sm text-gray-500">{user.name || user.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/80"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs overflow-y-auto bg-white px-6 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/hdd-logo.webp"
                  alt="Hickory Dickory Decks"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
                <span className="font-semibold text-hdd-green">GBP Poster</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-6">
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                          isActive
                            ? 'bg-hdd-green-50 text-hdd-green-dark'
                            : 'text-gray-700 hover:bg-hdd-green-50 hover:text-hdd-green-dark'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-6 w-6 shrink-0',
                            isActive ? 'text-hdd-green' : 'text-gray-400 group-hover:text-hdd-green'
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-hdd-green-50 hover:text-hdd-green-dark"
                  >
                    <LogOut className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-hdd-green" />
                    Sign out
                  </button>
                </form>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
