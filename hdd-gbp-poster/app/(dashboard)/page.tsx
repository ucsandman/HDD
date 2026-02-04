import Link from 'next/link'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Clock, CheckCircle, Plus, ArrowRight } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel, truncate } from '@/lib/utils'

async function getDashboardData(franchiseId: string) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  const [postsThisWeek, draftsAwaitingReview, nextScheduled, recentPosts] = await Promise.all([
    // Posts published or scheduled this week
    prisma.post.count({
      where: {
        franchiseId,
        OR: [
          {
            status: 'published',
            publishedAt: { gte: startOfWeek, lt: endOfWeek }
          },
          {
            status: 'scheduled',
            scheduledFor: { gte: startOfWeek, lt: endOfWeek }
          }
        ]
      }
    }),
    // Drafts awaiting review
    prisma.post.count({
      where: {
        franchiseId,
        status: { in: ['draft', 'pending_review'] }
      }
    }),
    // Next scheduled post
    prisma.post.findFirst({
      where: {
        franchiseId,
        status: 'scheduled',
        scheduledFor: { gte: now }
      },
      orderBy: { scheduledFor: 'asc' }
    }),
    // Recent posts
    prisma.post.findMany({
      where: { franchiseId },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        postType: true,
        body: true,
        status: true,
        scheduledFor: true,
        publishedAt: true,
        updatedAt: true
      }
    })
  ])

  return { postsThisWeek, draftsAwaitingReview, nextScheduled, recentPosts }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const { postsThisWeek, draftsAwaitingReview, nextScheduled, recentPosts } =
    await getDashboardData(session.user.franchiseId)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hdd-green-dark">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>
        <Link href="/posts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Posts This Week
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postsThisWeek}</div>
            <p className="text-xs text-gray-500 mt-1">
              Scheduled and published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Drafts to Review
            </CardTitle>
            <Clock className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftsAwaitingReview}</div>
            <p className="text-xs text-gray-500 mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Next Scheduled
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextScheduled?.scheduledFor
                ? formatDateTime(nextScheduled.scheduledFor)
                : 'None'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {nextScheduled ? 'Upcoming post' : 'No posts scheduled'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your posts</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/posts/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Generate New Post
            </Button>
          </Link>
          <Link href="/posts?status=draft">
            <Button variant="outline">
              Review Drafts
              {draftsAwaitingReview > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {draftsAwaitingReview}
                </Badge>
              )}
            </Button>
          </Link>
          <Link href="/images">
            <Button variant="outline">Manage Images</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Your latest post activity</CardDescription>
          </div>
          <Link href="/posts">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <p className="text-gray-500 text-sm">No posts yet. Create your first post!</p>
          ) : (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {truncate(post.body, 60)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Updated {formatDateTime(post.updatedAt)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(post.status)}>
                    {getStatusLabel(post.status)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
