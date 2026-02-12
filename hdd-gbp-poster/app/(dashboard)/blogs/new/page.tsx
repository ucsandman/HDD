'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, Sparkles, FileText, Share2 } from 'lucide-react'
import { useBlog } from '@/hooks/useBlog'
import { EDUCATIONAL_TOPICS, PROJECT_TYPES } from '@/types'
import Link from 'next/link'

export default function NewBlogPage() {
  const router = useRouter()
  const { generateBlog, generateSummary, isGenerating, error, clearError } = useBlog()

  // Form state
  const [topic, setTopic] = useState<string>(EDUCATIONAL_TOPICS[0])
  const [neighborhood, setNeighborhood] = useState('')
  const [materials, setMaterials] = useState('')
  const [keywords, setKeywords] = useState('')

  // Generated blog state
  const [blog, setBlog] = useState<any>(null)

  async function handleGenerate() {
    clearError()
    try {
      const result = await generateBlog({
        topic,
        neighborhood: neighborhood || undefined,
        materials: materials || undefined,
        targetKeywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
      })
      setBlog(result)
    } catch {
      // Error is handled by useBlog
    }
  }

  async function handleCreateGBPPost() {
    if (!blog) return
    
    try {
      const result = await generateSummary(blog.id)
      
      // Store summary in session storage to pass to the new post page
      sessionStorage.setItem('pending_gbp_summary', JSON.stringify({
        body: result.summary,
        title: result.title,
        blogId: blog.id
      }))
      
      router.push('/posts/new?from_blog=' + blog.id)
    } catch {
      // Error is handled by useBlog
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/blogs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-hdd-green-dark">Blog Generator</h1>
          <p className="text-gray-500 mt-1">Generate high-value SEO content for your website</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-hdd-green" />
                Configure Blog
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic">Main Topic</Label>
                <Select
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  {EDUCATIONAL_TOPICS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="custom">Custom Topic...</option>
                </Select>
                {topic === 'custom' && (
                  <Input
                    className="mt-2"
                    placeholder="Enter custom blog topic"
                    onChange={(e) => setTopic(e.target.value)}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="neighborhood">Target Neighborhood</Label>
                <Input
                  id="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="e.g., West Chester, Mason"
                />
              </div>

              <div>
                <Label htmlFor="materials">Featured Materials</Label>
                <Input
                  id="materials"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g., Trex Transcend, TimberTech"
                />
              </div>

              <div>
                <Label htmlFor="keywords">SEO Keywords (comma separated)</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., deck builder Cincinnati, composite decking cost"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-hdd-green hover:bg-hdd-green-dark"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Crafting Blog...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Blog
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

          {blog && (
            <Card className="bg-hdd-green/5 border-hdd-green/20">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Next Step: Amplify
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Generate a perfectly formatted Google Business Profile update based on this blog.
                </p>
                <Button 
                  onClick={handleCreateGBPPost} 
                  variant="outline" 
                  className="w-full border-hdd-green text-hdd-green hover:bg-hdd-green hover:text-white"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Create GBP Update
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Content Preview */}
        <div className="lg:col-span-2">
          {blog ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle>SEO Meta Details</CardTitle>
                    <Badge variant="outline">AI Generated</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-4 space-y-4">
                  <div>
                    <Label className="text-xs uppercase text-gray-500">Slug</Label>
                    <div className="text-sm font-mono bg-gray-50 p-1 rounded mt-1">/{blog.slug}</div>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-gray-500">Meta Title</Label>
                    <div className="text-sm font-medium mt-1">{blog.metaTitle}</div>
                  </div>
                  <div>
                    <Label className="text-xs uppercase text-gray-500">Meta Description</Label>
                    <div className="text-sm text-gray-600 mt-1">{blog.metaDescription}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-hdd-green" />
                    {blog.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-6">
                  <div className="prose prose-hdd max-w-none whitespace-pre-wrap">
                    {blog.content}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>Configure and generate a blog to see the preview here.</p>
              <p className="text-sm mt-2">Content will be optimized for search and brand voice.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
