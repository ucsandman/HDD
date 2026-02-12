'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Sparkles, Save, FileText } from 'lucide-react'
import { usePost } from '@/hooks/usePost'
import { EDUCATIONAL_TOPICS, SEASONS, PROJECT_TYPES } from '@/types'
import type { PostType, CallToActionType } from '@/types'
import Link from 'next/link'

const CALL_TO_ACTION_TYPES = [
  { value: '', label: 'None' },
  { value: 'LEARN_MORE', label: 'Learn More' },
  { value: 'CALL', label: 'Call' },
  { value: 'BOOK', label: 'Book' },
  { value: 'GET_OFFER', label: 'Get Offer' },
]

function NewPostForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { createPost, generateDraft, isLoading, isGenerating, error, clearError } = usePost()

  // Form state
  const [postType, setPostType] = useState<PostType>('project_showcase')
  const [body, setBody] = useState('')
  const [title, setTitle] = useState('')
  const [callToAction, setCallToAction] = useState('')
  const [callToActionUrl, setCallToActionUrl] = useState('https://decks.ca/deck-builders/cincinnati')
  const [blogId, setBlogId] = useState<string | null>(null)

  // Check for incoming blog summary
  useEffect(() => {
    const pendingSummary = sessionStorage.getItem('pending_gbp_summary')
    if (pendingSummary) {
      try {
        const data = JSON.parse(pendingSummary)
        setBody(data.body)
        setTitle(data.title || '')
        setBlogId(data.blogId || null)
        setPostType('educational')
        setCallToAction('LEARN_MORE')
        
        // Clear it so it doesn't persist on refresh
        sessionStorage.removeItem('pending_gbp_summary')
      } catch (e) {
        console.error('Failed to parse pending summary', e)
      }
    }
  }, [])

  // Generation params
  const [projectTypeName, setProjectTypeName] = useState('deck')
  const [neighborhood, setNeighborhood] = useState('')
  const [materials, setMaterials] = useState('')
  const [features, setFeatures] = useState('')
  const [topic, setTopic] = useState<string>(EDUCATIONAL_TOPICS[0])
  const [season, setSeason] = useState<string>(SEASONS[0])

  const [generationPrompt, setGenerationPrompt] = useState<string | null>(null)

  const characterCount = body.length
  const isOverLimit = characterCount > 1500
  const isNearLimit = characterCount > 1400

  async function handleGenerate() {
    clearError()
    try {
      const result = await generateDraft({
        postType,
        ...(postType === 'project_showcase' && {
          projectTypeName,
          neighborhood: neighborhood || undefined,
          materials: materials || undefined,
          features: features || undefined,
        }),
        ...(postType === 'educational' && { topic }),
        ...(postType === 'seasonal' && { season }),
      })

      setBody(result.body)
      setGenerationPrompt(result.generationPrompt)
    } catch {
      // Error is handled by usePost
    }
  }

  async function handleSave() {
    if (!body.trim()) {
      alert('Post body is required')
      return
    }

    if (isOverLimit) {
      alert('Post body exceeds 1500 character limit')
      return
    }

    try {
      const post = await createPost({
        postType,
        body: body.trim(),
        title: title || undefined,
        callToAction: callToAction ? (callToAction as CallToActionType) : undefined,
        callToActionUrl: callToAction ? callToActionUrl : undefined,
        generatedBy: generationPrompt || blogId ? 'ai' : 'manual',
        generationPrompt: generationPrompt || undefined,
        blogId: blogId || undefined,
      })

      router.push(`/posts/${post.id}`)
    } catch {
      // Error is handled by usePost
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/posts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-hdd-green-dark">New Post</h1>
          <p className="text-gray-500 mt-1">Create a new Google Business Profile post</p>
        </div>
      </div>

      {blogId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-blue-900">Linked to Blog Post</p>
            <p className="text-xs text-blue-700">This post was generated as a summary for your new blog.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Generation */}
        <Card className={blogId ? 'opacity-50 pointer-events-none' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="postType">Post Type</Label>
              <Select
                id="postType"
                value={postType}
                onChange={(e) => setPostType(e.target.value as PostType)}
              >
                <option value="project_showcase">Project Showcase</option>
                <option value="educational">Educational</option>
                <option value="seasonal">Seasonal</option>
              </Select>
            </div>

            {postType === 'project_showcase' && (
              <>
                <div>
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select
                    id="projectType"
                    value={projectTypeName}
                    onChange={(e) => setProjectTypeName(e.target.value)}
                  >
                    {PROJECT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="neighborhood">Neighborhood (optional)</Label>
                  <Input
                    id="neighborhood"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g., West Chester, Mason"
                  />
                </div>
                <div>
                  <Label htmlFor="materials">Materials (optional)</Label>
                  <Input
                    id="materials"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="e.g., TimberTech, Trex"
                  />
                </div>
                <div>
                  <Label htmlFor="features">Special Features (optional)</Label>
                  <Input
                    id="features"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder="e.g., built-in seating, LED lighting"
                  />
                </div>
              </>
            )}

            {postType === 'educational' && (
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Select
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  {EDUCATIONAL_TOPICS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
            )}

            {postType === 'seasonal' && (
              <div>
                <Label htmlFor="season">Season</Label>
                <Select
                  id="season"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Draft
                </>
              )}
            </Button>

            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column - Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Post Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title (Internal only)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Spring Deck Special"
              />
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
                rows={10}
                placeholder="Write your post content here or use AI to generate..."
                className={isOverLimit ? 'border-red-500' : ''}
              />
              {isOverLimit && (
                <p className="text-sm text-red-500 mt-1">
                  Post exceeds the 1500 character limit
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cta">Call to Action</Label>
                <Select
                  id="cta"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
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
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/posts">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSave} disabled={isLoading || !body.trim() || isOverLimit}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function NewPostPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-hdd-green" /></div>}>
      <NewPostForm />
    </Suspense>
  )
}
