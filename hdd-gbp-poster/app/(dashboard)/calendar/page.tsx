'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { getStatusColor, getStatusLabel, truncate } from '@/lib/utils'
import type { PostData } from '@/types'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function CalendarPage() {
  const [posts, setPosts] = useState<PostData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const response = await fetch('/api/posts?limit=200')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: { date: Date; posts: PostData[] }[] = []

    // Add empty days for the start of the month
    for (let i = 0; i < startingDay; i++) {
      const date = new Date(year, month, 1 - (startingDay - i))
      days.push({ date, posts: [] })
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const dayStart = new Date(year, month, i, 0, 0, 0)
      const dayEnd = new Date(year, month, i, 23, 59, 59)

      const dayPosts = posts.filter((post) => {
        const postDate = post.scheduledFor
          ? new Date(post.scheduledFor)
          : post.publishedAt
            ? new Date(post.publishedAt)
            : null

        if (!postDate) return false
        return postDate >= dayStart && postDate <= dayEnd
      })

      days.push({ date, posts: dayPosts })
    }

    // Add empty days at the end to complete the grid
    const remaining = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, posts: [] })
    }

    return days
  }, [year, month, posts])

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  const isCurrentMonth = (date: Date) =>
    date.getMonth() === month && date.getFullYear() === year

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">View scheduled and published posts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>Today</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">
              {MONTHS[month]} {year}
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
            {DAYS.map((day) => (
              <div
                key={day}
                className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] bg-white p-2 ${
                  !isCurrentMonth(day.date) ? 'bg-gray-50' : ''
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday(day.date)
                      ? 'h-6 w-6 rounded-full bg-gray-900 text-white flex items-center justify-center'
                      : isCurrentMonth(day.date)
                        ? 'text-gray-900'
                        : 'text-gray-400'
                  }`}
                >
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {day.posts.slice(0, 2).map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block"
                    >
                      <div
                        className={`text-xs p-1 rounded truncate ${getStatusColor(post.status)}`}
                      >
                        {truncate(post.body, 20)}
                      </div>
                    </Link>
                  ))}
                  {day.posts.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.posts.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        {['draft', 'scheduled', 'published', 'failed'].map((status) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded ${getStatusColor(status)}`} />
            <span className="text-sm text-gray-600">{getStatusLabel(status)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
