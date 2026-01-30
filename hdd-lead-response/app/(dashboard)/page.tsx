import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import prisma from '@/lib/db'
import { formatRelativeTime } from '@/lib/utils'
import { Users, MessageSquare, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalLeads,
    newLeads,
    activeSequences,
    bookings,
    recentMessages,
    recentLeads,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.lead.count({
      where: { sequenceStatus: 'active' },
    }),
    prisma.lead.count({
      where: { consultationBookedAt: { gte: thirtyDaysAgo } },
    }),
    prisma.message.count({
      where: { sentAt: { gte: sevenDaysAgo } },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        sequenceStatus: true,
        createdAt: true,
      },
    }),
  ])

  return {
    totalLeads,
    newLeads,
    activeSequences,
    bookings,
    recentMessages,
    recentLeads,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        description="Lead response automation overview"
        action={{ label: 'New Lead', href: '/leads/new' }}
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-gray-500">
                +{stats.newLeads} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sequences</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSequences}</div>
              <p className="text-xs text-gray-500">
                Leads being followed up
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentMessages}</div>
              <p className="text-xs text-gray-500">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bookings}</div>
              <p className="text-xs text-gray-500">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentLeads.length === 0 ? (
                <p className="text-sm text-gray-500">No leads yet. Create your first lead to get started.</p>
              ) : (
                stats.recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
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
                          {formatRelativeTime(lead.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          lead.sequenceStatus === 'active'
                            ? 'success'
                            : lead.sequenceStatus === 'paused'
                              ? 'warning'
                              : 'secondary'
                        }
                      >
                        {lead.sequenceStatus}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
