'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Link2, UserPlus, Trash2 } from 'lucide-react'

interface FranchiseData {
  id: string
  name: string
  slug: string
  postsPerWeek: number
  preferredPostDays: string
  preferredPostTime: string
  timezone: string
  contextInfo: string | null
  googleConnected: boolean
}

interface UserData {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: string
}

const DAYS = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
]

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
]

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [franchise, setFranchise] = useState<FranchiseData | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [postsPerWeek, setPostsPerWeek] = useState(3)
  const [preferredPostDays, setPreferredPostDays] = useState<string[]>([])
  const [preferredPostTime, setPreferredPostTime] = useState('09:00')
  const [timezone, setTimezone] = useState('America/New_York')
  const [contextInfo, setContextInfo] = useState('')

  // New user form
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState('editor')
  const [isInviting, setIsInviting] = useState(false)

  // Status messages
  const success = searchParams.get('success')
  const error = searchParams.get('error')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [franchiseRes, usersRes] = await Promise.all([
        fetch('/api/franchise'),
        fetch('/api/users'),
      ])

      if (franchiseRes.ok) {
        const data: FranchiseData = await franchiseRes.json()
        setFranchise(data)
        setName(data.name)
        setPostsPerWeek(data.postsPerWeek)
        setPreferredPostDays(data.preferredPostDays.split(',').filter(Boolean))
        setPreferredPostTime(data.preferredPostTime)
        setTimezone(data.timezone)
        setContextInfo(data.contextInfo || '')
      }

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const response = await fetch('/api/franchise', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          postsPerWeek,
          preferredPostDays: preferredPostDays.join(','),
          preferredPostTime,
          timezone,
          contextInfo: contextInfo || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setFranchise({ ...franchise!, ...data })
        alert('Settings saved successfully')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleInviteUser() {
    if (!newUserEmail) return

    setIsInviting(true)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName || undefined,
          role: newUserRole,
        }),
      })

      if (response.ok) {
        setNewUserEmail('')
        setNewUserName('')
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to invite user')
      }
    } catch (error) {
      console.error('Error inviting user:', error)
    } finally {
      setIsInviting(false)
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm('Are you sure you want to remove this user?')) return

    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to remove user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  function toggleDay(day: string) {
    setPreferredPostDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-hdd-green-dark">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your franchise settings</p>
      </div>

      {success === 'google_connected' && (
        <div className="rounded-md bg-hdd-green-50 p-4">
          <p className="text-sm text-hdd-green-dark">Google Business Profile connected successfully!</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error === 'google_denied'
              ? 'Google authorization was denied.'
              : 'An error occurred. Please try again.'}
          </p>
        </div>
      )}

      {/* Google Connection */}
      <Card>
        <CardHeader>
          <CardTitle>Google Business Profile</CardTitle>
          <CardDescription>Connect your Google account to publish posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={franchise?.googleConnected ? 'success' : 'secondary'}>
                {franchise?.googleConnected ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            {franchise?.googleConnected ? (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/api/auth/google'}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            ) : (
              <Button onClick={() => window.location.href = '/api/auth/google'}>
                <Link2 className="h-4 w-4 mr-2" />
                Connect Google
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Franchise Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Franchise Profile</CardTitle>
          <CardDescription>Basic information about your franchise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Franchise Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contextInfo">AI Context (used for post generation)</Label>
            <Textarea
              id="contextInfo"
              value={contextInfo}
              onChange={(e) => setContextInfo(e.target.value)}
              rows={6}
              placeholder="Additional context about your franchise for the AI..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Include details about services, specialties, and local information.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Posting Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Posting Schedule</CardTitle>
          <CardDescription>Configure when posts are scheduled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="postsPerWeek">Posts per Week</Label>
            <Select
              id="postsPerWeek"
              value={String(postsPerWeek)}
              onChange={(e) => setPostsPerWeek(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Preferred Days</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DAYS.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={preferredPostDays.includes(day.value) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="preferredPostTime">Preferred Time</Label>
              <Input
                id="preferredPostTime"
                type="time"
                value={preferredPostTime}
                onChange={(e) => setPreferredPostTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage users who can access this franchise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg divide-y">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{user.name || user.email}</p>
                  {user.name && <p className="text-sm text-gray-500">{user.email}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Invite New User</h4>
            <div className="grid gap-3 sm:grid-cols-4">
              <Input
                placeholder="Email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
              <Input
                placeholder="Name (optional)"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <Select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
              >
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </Select>
              <Button onClick={handleInviteUser} disabled={isInviting || !newUserEmail}>
                {isInviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
