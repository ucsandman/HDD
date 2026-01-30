'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Clock, Mail, MessageSquare } from 'lucide-react'

interface SequenceStep {
  id: string
  stepNumber: number
  name: string
  delayMinutes: number
  smsTemplate: string | null
  emailSubject: string | null
  emailTemplate: string | null
  sendSms: boolean
  sendEmail: boolean
  isActive: boolean
}

export default function SequencesPage() {
  const [steps, setSteps] = useState<SequenceStep[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchSteps() {
      const res = await fetch('/api/sequences')
      if (res.ok) {
        setSteps(await res.json())
      }
      setLoading(false)
    }

    fetchSteps()
  }, [])

  function updateStep(index: number, updates: Partial<SequenceStep>) {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, ...updates } : step))
    )
    setSuccess(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch('/api/sequences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(steps),
      })

      if (!res.ok) {
        throw new Error('Failed to save sequences')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  function formatDelay(minutes: number): string {
    if (minutes === 0) return 'Instant'
    if (minutes < 60) return `${minutes} minutes`
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours`
    return `${Math.round(minutes / 1440)} days`
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
        title="Sequences"
        description="Configure automated follow-up templates"
      />

      <div className="p-6 space-y-6">
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

        {/* Sequence Steps */}
        {steps.map((step, index) => (
          <Card key={step.id} className={step.isActive ? '' : 'opacity-60'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Step {step.stepNumber}</Badge>
                  <div>
                    <CardTitle className="text-lg">{step.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDelay(step.delayMinutes)} after previous step
                    </CardDescription>
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={step.isActive}
                    onChange={(e) =>
                      updateStep(index, { isActive: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Timing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={step.name}
                    onChange={(e) => updateStep(index, { name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delay (minutes)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={step.delayMinutes}
                    onChange={(e) =>
                      updateStep(index, {
                        delayMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* SMS */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">SMS Message</span>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={step.sendSms}
                      onChange={(e) =>
                        updateStep(index, { sendSms: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Send SMS</span>
                  </label>
                </div>
                {step.sendSms && (
                  <div className="space-y-2">
                    <Textarea
                      value={step.smsTemplate || ''}
                      onChange={(e) =>
                        updateStep(index, { smsTemplate: e.target.value })
                      }
                      rows={3}
                      placeholder="Hi {{firstName}}! This is {{ownerName}} from {{businessName}}..."
                    />
                    <p className="text-xs text-gray-500">
                      Variables: {'{{firstName}}, {{lastName}}, {{city}}, {{projectType}}, {{ownerName}}, {{businessName}}, {{bookingLink}}'}
                    </p>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email Message</span>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={step.sendEmail}
                      onChange={(e) =>
                        updateStep(index, { sendEmail: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Send Email</span>
                  </label>
                </div>
                {step.sendEmail && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input
                        value={step.emailSubject || ''}
                        onChange={(e) =>
                          updateStep(index, { emailSubject: e.target.value })
                        }
                        placeholder="Your {{projectType}} project in {{city}}"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Body</Label>
                      <Textarea
                        value={step.emailTemplate || ''}
                        onChange={(e) =>
                          updateStep(index, { emailTemplate: e.target.value })
                        }
                        rows={6}
                        placeholder="Hi {{firstName}},\n\nThank you for reaching out..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
