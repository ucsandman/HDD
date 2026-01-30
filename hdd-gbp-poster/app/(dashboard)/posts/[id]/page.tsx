'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Save, Check, Send } from 'lucide-react'
import { usePost } from '@/hooks/usePost'
import { formatDateTime, getStatusColor, getStatusLabel } from '@/lib/utils'
import type { PostData, PostType, CallToActionType } from '@/types'

const CALL_TO_ACTION_TYPES = [
  { value: '', label: 'None' },
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'CALL', label: 'Call' },
  { value: 'BOOK', label: 'Book' },
  { value: 'GET_OFFER', label: 'Get Offer' },
]

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { updatePost, approvePost, publishPost, isLoading, error } = usePost()

  const [post, setPost] = useState<PostData | null>(null)
  const [isFetching, setIsFetching] = useState(true)

  // Form state
  const [postType, setPostType] = useState<PostType>('project_showcase')
  const [body, setBody] = useState('')
  const [callToAction, setCallToAction] = useState('')
  const [callToActionUrl, setCallToActionUrl] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')

  const characterCount = body.length
  const isOverLimit = characterCount > 1500
  const isNearLimit = characterCount > 1400

  useEffect(() => {
    fetchPost()
  }, [id])

  async function fetchPost() {
    try {
      const response = await fetch(`/api/posts/${id}`)
      if (response.ok) {
        const data: PostData = await response.json()
        setPost(data)
        setPostType(data.postType)
        setBody(data.body)
        setCallToAction(data.callToAction || '')
        setCallToActionUrl(data.callToActionUrl || '')
        if (data.scheduledFor) {
          setScheduledFor(new Date(data.scheduledFor).toISOString().slice(0, 16))
        }
      } else {
        router.push('/posts')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      router.push('/posts')
    } finally {
      setIsFetching(false)
    }
  }

  async function handleSave() {
    if (!body.trim() || isOverLimit) return

    try {
      const updated = await updatePost(id, {
        postType,
        body: body.trim(),
        callToAction: callToAction ? (callToAction as CallToActionType) : null,
        callToActionUrl: callToAction ? callToActionUrl : null,
      })
      setPost(updated)
    } catch {
      // Error handled by hook
    }
  }

  async function handleSubmitForReview() {
    await handleSave()
    try {
      const updated = await updatePost(id, { status: 'pending_review' })
      setPost(updated)
    } catch {
      // Error handled by hook
    }
  }

  async function handleApprove() {
    await handleSave()
    try {
      const updated = await approvePost(id, scheduledFor || undefined)
      setPost(updated)
    } catch {
      // Error handled by hook
    }
  }

  async function handlePublish() {
    await handleSave()
    try {
      const updated = await publishPost(id)
      setPost(updated)
    } catch {
      // Error handled by hook
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!post) return null

  const canEdit = ['draft', 'pending_review', 'approved'].includes(post.status)
  const canApprove = ['draft', 'pending_review'].includes(post.status)
  const canPublish = ['draft', 'pending_review', 'approved', 'scheduled', 'failed'].includes(post.status)
  const isPublished = post.status === 'published'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/posts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
              <Badge className={getStatusColor(post.status)}>
                {getStatusLabel(post.status)}
              </Badge>
            </div>
            <p className="text-gray-500 mt-1">
              Created {formatDateTime(post.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {post.publishError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Publish Error</p>
          <p className="text-sm text-red-700 mt-1">{post.publishError}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="postType">Post Type</Label>
                <Select
                  id="postType"
                  value={postType}
                  onChange={(e) => setPostType(e.target.value as PostType)}
                  disabled={!canEdit}
                >
                  <option value="project_showcase">Project Showcase</option>
                  <option value="educational">Educational</option>
                  <option value="seasonal">Seasonal</option>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="body">Post Body</Label>
                  <Badge
                    variant={isOverLimit ? 'destructive' : isNearLimit ? 'warning' : 'secondary'}
                  >
                    {characterCount}/1500
                  </Badge>
                </div>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  disabled={!canEdit}
                  className={isOverLimit ? 'border-red-500' : ''}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cta">Call to Action</Label>
                  <Select
                    id="cta"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
                    disabled={!canEdit}
                  >
                    {CALL_TO_ACTION_TYPES.map((cta) => (
                      <option key={cta.value} value={cta.value}>{cta.label}</option>
                    ))}
                  </Select>
                </div>
                {callToAction && (
                  <div>
                    <Label htmlFor="ctaUrl">CTA URL</Label>
                    <Input
                      id="ctaUrl"
                      type="url"
                      value={callToActionUrl}
                      onChange={(e) => setCallToActionUrl(e.target.value)}
                      disabled={!canEdit}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit && (
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !body.trim() || isOverLimit}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Draft
                </Button>
              )}

              {post.status === 'draft' && (
                <Button
                  onClick={handleSubmitForReview}
                  disabled={isLoading || !body.trim() || isOverLimit}
                  className="w-full"
                  variant="secondary"
                >
                  Submit for Review
                </Button>
              )}

              {canApprove && (
                <>
                  <div>
                    <Label htmlFor="scheduledFor">Schedule For (optional)</Label>
                    <Input
                      id="scheduledFor"
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleApprove}
                    disabled={isLoading || !body.trim() || isOverLimit}
                    className="w-full"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {scheduledFor ? 'Approve & Schedule' : 'Approve'}
                  </Button>
                </>
              )}

              {canPublish && (
                <Button
                  onClick={handlePublish}
                  disabled={isLoading || !body.trim() || isOverLimit}
                  className="w-full"
                  variant="default"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publish Now
                </Button>
              )}

              {isPublished && post.googlePostUrl && (
                <a
                  href={post.googlePostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full">
                    View on Google
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {post.generatedBy && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Generated by</span>
                  <Badge variant="secondary">
                    {post.generatedBy === 'ai' ? 'AI' : 'Manual'}
                  </Badge>
                </div>
              )}
              {post.scheduledFor && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Scheduled for</span>
                  <span>{formatDateTime(post.scheduledFor)}</span>
                </div>
              )}
              {post.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Published at</span>
                  <span>{formatDateTime(post.publishedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span>{formatDateTime(post.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
