'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Mail, MessageSquare } from 'lucide-react'

interface Message {
  id: string
  leadId: string
  channel: string
  direction: string
  subject: string | null
  body: string
  status: string
  sequenceStep: number | null
  sentAt: string
  lead: {
    id: string
    firstName: string
    lastName: string | null
    phone: string | null
    email: string | null
  }
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [channel, setChannel] = useState('')
  const [direction, setDirection] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 30

  useEffect(() => {
    async function fetchMessages() {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('limit', limit.toString())
      params.set('offset', offset.toString())
      if (channel) params.set('channel', channel)
      if (direction) params.set('direction', direction)

      const res = await fetch(`/api/messages?${params}`)
      const data = await res.json()
      setMessages(data.messages)
      setTotal(data.total)
      setLoading(false)
    }

    fetchMessages()
  }, [channel, direction, offset])

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div className="flex flex-col">
      <Header
        title="Messages"
        description={`${total} total messages`}
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Select
                value={channel}
                onChange={(e) => {
                  setChannel(e.target.value)
                  setOffset(0)
                }}
                className="w-[150px]"
              >
                <option value="">All Channels</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </Select>

              <Select
                value={direction}
                onChange={(e) => {
                  setDirection(e.target.value)
                  setOffset(0)
                }}
                className="w-[150px]"
              >
                <option value="">All Directions</option>
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No messages found.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <Link
                    key={message.id}
                    href={`/leads/${message.leadId}`}
                    className="block p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          {message.channel === 'sms' ? (
                            <MessageSquare className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Mail className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {message.lead.firstName} {message.lead.lastName}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {message.channel.toUpperCase()}
                            </Badge>
                            <Badge
                              variant={message.direction === 'inbound' ? 'success' : 'info'}
                              className="text-xs"
                            >
                              {message.direction}
                            </Badge>
                          </div>
                          {message.subject && (
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              {message.subject}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {message.body}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-sm text-gray-500 whitespace-nowrap">
                        {formatDateTime(message.sentAt)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                    disabled={offset === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOffset(offset + limit)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
