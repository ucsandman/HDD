'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatDateTime,
  formatPhone,
  getLeadStatusColor,
  getLeadStatusLabel,
  getSequenceStatusColor,
  getSequenceStatusLabel,
  getProjectTypeLabel,
} from '@/lib/utils'
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  Pause,
  Play,
  SkipForward,
  XCircle,
  Loader2,
} from 'lucide-react'

interface Lead {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  phoneNormalized: string | null
  address: string | null
  city: string | null
  projectType: string | null
  projectDescription: string | null
  source: string | null
  status: string
  sequenceStatus: string
  sequenceStep: number
  nextFollowupAt: string | null
  lastContactedAt: string | null
  lastRespondedAt: string | null
  consultationBookedAt: string | null
  closedAt: string | null
  closedReason: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  messages: Message[]
}

interface Message {
  id: string
  channel: string
  direction: string
  subject: string | null
  body: string
  status: string
  sequenceStep: number | null
  sentAt: string
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLead() {
      const res = await fetch(`/api/leads/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setLead(data)
      }
      setLoading(false)
    }

    fetchLead()
  }, [params.id])

  async function handleAction(action: string) {
    setActionLoading(action)
    try {
      const res = await fetch(`/api/leads/${params.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'close' ? JSON.stringify({ reason: 'other' }) : undefined,
      })

      if (res.ok) {
        // Refresh lead data
        const leadRes = await fetch(`/api/leads/${params.id}`)
        if (leadRes.ok) {
          setLead(await leadRes.json())
        }
      }
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-6">
        <p>Lead not found.</p>
        <Button className="mt-4" onClick={() => router.push('/leads')}>
          Back to Leads
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Header
        title={`${lead.firstName} ${lead.lastName || ''}`}
        description={lead.city || 'Lead details'}
      />

      <div className="p-6 space-y-6">
        {/* Status and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge className={getLeadStatusColor(lead.status)}>
              {getLeadStatusLabel(lead.status)}
            </Badge>
            <Badge className={getSequenceStatusColor(lead.sequenceStatus)}>
              {getSequenceStatusLabel(lead.sequenceStatus)} (Step {lead.sequenceStep})
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {lead.sequenceStatus === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('pause')}
                disabled={actionLoading === 'pause'}
              >
                {actionLoading === 'pause' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
                Pause
              </Button>
            )}

            {lead.sequenceStatus === 'paused' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('resume')}
                disabled={actionLoading === 'resume'}
              >
                {actionLoading === 'resume' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Resume
              </Button>
            )}

            {['active', 'paused'].includes(lead.sequenceStatus) && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('skip')}
                  disabled={actionLoading === 'skip'}
                >
                  {actionLoading === 'skip' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SkipForward className="h-4 w-4" />
                  )}
                  Skip Step
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleAction('close')}
                  disabled={actionLoading === 'close'}
                >
                  {actionLoading === 'close' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Close
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lead.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}

              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${lead.phoneNormalized}`} className="text-blue-600 hover:underline">
                    {formatPhone(lead.phone)}
                  </a>
                </div>
              )}

              {(lead.address || lead.city) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span>
                    {lead.address && <span className="block">{lead.address}</span>}
                    {lead.city && <span className="text-gray-500">{lead.city}</span>}
                  </span>
                </div>
              )}

              {lead.projectType && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500">Project Type</p>
                  <p className="font-medium">{getProjectTypeLabel(lead.projectType)}</p>
                </div>
              )}

              {lead.source && (
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium capitalize">{lead.source.replace('_', ' ')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDateTime(lead.createdAt)}</p>
                </div>
              </div>

              {lead.lastContactedAt && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Contacted</p>
                    <p className="font-medium">{formatDateTime(lead.lastContactedAt)}</p>
                  </div>
                </div>
              )}

              {lead.lastRespondedAt && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Last Response</p>
                    <p className="font-medium">{formatDateTime(lead.lastRespondedAt)}</p>
                  </div>
                </div>
              )}

              {lead.consultationBookedAt && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Consultation Booked</p>
                    <p className="font-medium">{formatDateTime(lead.consultationBookedAt)}</p>
                  </div>
                </div>
              )}

              {lead.nextFollowupAt && (
                <div className="flex items-center gap-3 pt-2 border-t">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Next Followup</p>
                    <p className="font-medium">{formatDateTime(lead.nextFollowupAt)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.projectDescription && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Project Description</p>
                  <p className="text-sm">{lead.projectDescription}</p>
                </div>
              )}

              {lead.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Internal Notes</p>
                  <p className="text-sm">{lead.notes}</p>
                </div>
              )}

              {!lead.projectDescription && !lead.notes && (
                <p className="text-sm text-gray-500">No notes yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <Card>
          <CardHeader>
            <CardTitle>Message History</CardTitle>
          </CardHeader>
          <CardContent>
            {lead.messages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {lead.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.direction === 'outbound'
                        ? 'bg-blue-50 ml-8'
                        : 'bg-gray-50 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {message.channel.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {message.direction === 'outbound' ? 'Sent' : 'Received'}
                        </span>
                        {message.sequenceStep !== null && (
                          <span className="text-xs text-gray-400">
                            Step {message.sequenceStep}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(message.sentAt)}
                      </span>
                    </div>

                    {message.subject && (
                      <p className="font-medium text-sm mb-1">{message.subject}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
