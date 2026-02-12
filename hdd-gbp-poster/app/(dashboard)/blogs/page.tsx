import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Calendar, MessageSquare, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function BlogsPage() {
  const session = await auth()
  if (!session?.user) return null

  const blogs = await prisma.blog.findMany({
    where: { franchiseId: session.user.franchiseId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hdd-green-dark">Blog Posts</h1>
          <p className="text-gray-500 mt-1">Manage your website content and SEO strategy</p>
        </div>
        <Link href="/blogs/new">
          <Button className="bg-hdd-green hover:bg-hdd-green-dark">
            <Plus className="h-4 w-4 mr-2" />
            New Blog
          </Button>
        </Link>
      </div>

      {blogs.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No blog posts yet</h3>
            <p className="text-gray-500 max-w-sm mt-2">
              Generate high-quality SEO content to improve your website rankings and provide value to homeowners.
            </p>
            <Link href="/blogs/new" className="mt-6">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create your first blog
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {blogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden hover:border-hdd-green/50 transition-colors">
              <CardContent className="p-0">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg hover:text-hdd-green">
                        <Link href={`/blogs/${blog.id}`}>{blog.title}</Link>
                      </h3>
                      <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                        {blog.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {blog._count.posts} GBP Posts
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {blog.keywords.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/blogs/${blog.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/posts/new?from_blog=${blog.id}`}>
                      <Button size="sm" className="bg-hdd-green hover:bg-hdd-green-dark">
                        <Share2 className="h-4 w-4 mr-2" />
                        Create GBP Update
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-2 border-t text-xs text-gray-500 flex items-center justify-between">
                  <span>Slug: /{blog.slug}</span>
                  <span className="flex items-center gap-1">
                    Meta Title: {blog.metaTitle?.substring(0, 40)}...
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Share2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
