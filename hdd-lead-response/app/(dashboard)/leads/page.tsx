'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  formatRelativeTime,
  getLeadStatusColor,
  getLeadStatusLabel,
  getSequenceStatusColor,
  getSequenceStatusLabel,
} from '@/lib/utils'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Lead {
  id: string
  firstName: string
  lastName: string | null
  email: string | null
  phone: string | null
  city: string | null
  projectType: string | null
  status: string
  sequenceStatus: string
  sequenceStep: number
  createdAt: string
  _count: { messages: number }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [sequenceStatus, setSequenceStatus] = useState('')
  const [offset, setOffset] = useState(0)
  const limit = 20

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('limit', limit.toString())
      params.set('offset', offset.toString())
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      if (sequenceStatus) params.set('sequenceStatus', sequenceStatus)

      const res = await fetch(`/api/leads?${params}`)
      const data = await res.json()
      setLeads(data.leads)
      setTotal(data.total)
      setLoading(false)
    }

    fetchLeads()
  }, [search, status, sequenceStatus, offset])

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <div className="flex flex-col">
      <Header
        title="Leads"
        description={`${total} total leads`}
        action={{ label: 'New Lead', href: '/leads/new' }}
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search leads..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setOffset(0)
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setOffset(0)
                }}
                className="w-[150px]"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="engaged">Engaged</option>
                <option value="qualified">Qualified</option>
                <option value="booked">Booked</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </Select>

              <Select
                value={sequenceStatus}
                onChange={(e) => {
                  setSequenceStatus(e.target.value)
                  setOffset(0)
                }}
                className="w-[150px]"
              >
                <option value="">All Sequences</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="stopped">Stopped</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No leads found. Create your first lead to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {leads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium">
                        {lead.firstName[0]}
                        {lead.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-medium">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {[lead.city, lead.projectType]
                            .filter(Boolean)
                            .join(' - ') || 'No details'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-gray-500">
                        <p>{lead._count.messages} messages</p>
                        <p>{formatRelativeTime(lead.createdAt)}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getLeadStatusColor(lead.status)}>
                          {getLeadStatusLabel(lead.status)}
                        </Badge>
                        <Badge className={getSequenceStatusColor(lead.sequenceStatus)}>
                          {getSequenceStatusLabel(lead.sequenceStatus)}
                        </Badge>
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
