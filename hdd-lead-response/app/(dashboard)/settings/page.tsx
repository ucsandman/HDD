'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'

interface Settings {
  businessName: string
  businessPhone: string
  ownerName: string
  bookingLink: string
  websiteUrl: string
  googleReviewUrl: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    businessName: '',
    businessPhone: '',
    ownerName: '',
    bookingLink: '',
    websiteUrl: '',
    googleReviewUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          businessName: data.businessName || '',
          businessPhone: data.businessPhone || '',
          ownerName: data.ownerName || '',
          bookingLink: data.bookingLink || '',
          websiteUrl: data.websiteUrl || '',
          googleReviewUrl: data.googleReviewUrl || '',
        })
      }
      setLoading(false)
    }

    fetchSettings()
  }, [])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!res.ok) {
        throw new Error('Failed to save settings')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Settings"
        description="Configure business information and defaults"
      />

      <div className="p-6 space-y-6 max-w-2xl">
        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">Saved successfully!</p>}
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Business Info */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              These values are used in message templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={settings.businessName}
                onChange={(e) =>
                  setSettings({ ...settings, businessName: e.target.value })
                }
                placeholder="Hickory Dickory Decks Cincinnati"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={settings.ownerName}
                  onChange={(e) =>
                    setSettings({ ...settings, ownerName: e.target.value })
                  }
                  placeholder="Nathan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone</Label>
                <Input
                  id="businessPhone"
                  value={settings.businessPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, businessPhone: e.target.value })
                  }
                  placeholder="(513) 555-1234"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
            <CardDescription>
              URLs used in messages and for tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bookingLink">Booking Link (Cal.com)</Label>
              <Input
                id="bookingLink"
                value={settings.bookingLink}
                onChange={(e) =>
                  setSettings({ ...settings, bookingLink: e.target.value })
                }
                placeholder="https://cal.com/hdd-cincinnati/consultation"
              />
              <p className="text-xs text-gray-500">
                Used as {'{{bookingLink}}'} in message templates
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                value={settings.websiteUrl}
                onChange={(e) =>
                  setSettings({ ...settings, websiteUrl: e.target.value })
                }
                placeholder="https://hdd-cincinnati.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleReviewUrl">Google Review URL</Label>
              <Input
                id="googleReviewUrl"
                value={settings.googleReviewUrl}
                onChange={(e) =>
                  setSettings({ ...settings, googleReviewUrl: e.target.value })
                }
                placeholder="https://g.page/r/..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>
              Environment variables configured on server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Database</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Twilio SMS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Resend Email</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Configure TWILIO_* and RESEND_* environment variables to enable messaging.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
