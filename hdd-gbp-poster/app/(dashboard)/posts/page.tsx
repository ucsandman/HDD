'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Plus, Loader2, ExternalLink, Trash2, Edit } from 'lucide-react'
import { formatDateTime, getStatusColor, getStatusLabel, getPostTypeLabel, truncate } from '@/lib/utils'
import type { PostData } from '@/types'

interface PostsResponse {
  posts: PostData[]
  total: number
}

export default function PostsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [posts, setPosts] = useState<PostData[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all')

  useEffect(() => {
    fetchPosts()
  }, [statusFilter])

  async function fetchPosts() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }
      const response = await fetch(`/api/posts?${params}`)
      if (response.ok) {
        const data: PostsResponse = await response.json()
        setPosts(data.posts)
        setTotal(data.total)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchPosts()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value)
    const params = new URLSearchParams(searchParams)
    if (value === 'all') {
      params.delete('status')
    } else {
      params.set('status', value)
    }
    router.push(`/posts?${params}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hdd-green-dark">Posts</h1>
          <p className="text-gray-500 mt-1">Manage your Google Business Profile posts</p>
        </div>
        <Link href="/posts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)}>
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
        <span className="text-sm text-gray-500">
          {total} post{total !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No posts found</p>
            <Link href="/posts/new">
              <Button>Create your first post</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(post.status)}>
                        {getStatusLabel(post.status)}
                      </Badge>
                      <Badge variant="outline">
                        {getPostTypeLabel(post.postType)}
                      </Badge>
                      {post.generatedBy === 'ai' && (
                        <Badge variant="secondary">AI Generated</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 mb-2">
                      {truncate(post.body, 200)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Updated {formatDateTime(post.updatedAt)}</span>
                      {post.scheduledFor && (
                        <span>Scheduled for {formatDateTime(post.scheduledFor)}</span>
                      )}
                      {post.publishedAt && (
                        <span>Published {formatDateTime(post.publishedAt)}</span>
                      )}
                    </div>
                    {post.publishError && (
                      <p className="text-xs text-red-600 mt-2">
                        Error: {post.publishError}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {post.googlePostUrl && (
                      <a
                        href={post.googlePostUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Link href={`/posts/${post.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {post.status !== 'published' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
                {post.images.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {post.images.slice(0, 5).map((image) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt={image.altText || 'Post image'}
                        className="h-16 w-16 rounded object-cover flex-shrink-0"
                      />
                    ))}
                    {post.images.length > 5 && (
                      <div className="h-16 w-16 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm text-gray-500">+{post.images.length - 5}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
