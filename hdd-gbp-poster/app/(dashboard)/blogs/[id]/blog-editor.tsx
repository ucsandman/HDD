'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Share2, Save, X, Edit2, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { GenerateSummaryButton } from './generate-summary-button'

interface BlogEditorProps {
  initialBlog: any // Using any for simplicity, ideally should be the Prisma type
}

export function BlogEditor({ initialBlog }: BlogEditorProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form State
  const [blog, setBlog] = useState(initialBlog)
  const [formData, setFormData] = useState({
    title: initialBlog.title,
    content: initialBlog.content,
    metaTitle: initialBlog.metaTitle || '',
    metaDescription: initialBlog.metaDescription || '',
    slug: initialBlog.slug,
    keywords: initialBlog.keywords.join(', ')
  })

  const toggleEdit = () => {
    if (isEditing) {
      // Cancel edit - reset form
      setFormData({
        title: blog.title,
        content: blog.content,
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        slug: blog.slug,
        keywords: blog.keywords.join(', ')
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/blogs/${blog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        })
      })

      if (!response.ok) throw new Error('Failed to update')

      const updatedBlog = await response.json()
      setBlog(updatedBlog)
      setIsEditing(false)
      router.refresh() // Refresh server components
    } catch (error) {
      console.error(error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const response = await fetch(`/api/blogs/${blog.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete')
      router.push('/blogs')
    } catch (error) {
      alert('Failed to delete blog')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/blogs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-hdd-green-dark">
              {isEditing ? 'Editing Blog' : 'Blog Details'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditing ? 'Make changes to your content' : 'Review and amplify your content'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={toggleEdit} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-hdd-green">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={toggleEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Content
              </Button>
              <GenerateSummaryButton blogId={blog.id} />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs uppercase text-gray-500">Status</Label>
                <div className="mt-1">
                  <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                    {blog.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-xs uppercase text-gray-500">Created</Label>
                <div className="text-sm mt-1">
                  {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase text-gray-500">Keywords</Label>
                {isEditing ? (
                  <Textarea 
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    placeholder="Comma separated keywords"
                    className="mt-1"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {blog.keywords.map((keyword: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs uppercase text-gray-500">Slug</Label>
                {isEditing ? (
                  <Input 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="mt-1 font-mono text-sm"
                  />
                ) : (
                  <div className="text-sm font-mono bg-gray-50 p-1 rounded mt-1 break-all">
                    /{blog.slug}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-xs uppercase text-gray-500">Meta Title</Label>
                {isEditing ? (
                  <Input 
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <div className="text-sm font-medium mt-1">{blog.metaTitle || '-'}</div>
                )}
              </div>
              <div>
                <Label className="text-xs uppercase text-gray-500">Meta Description</Label>
                {isEditing ? (
                  <Textarea 
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                    className="mt-1"
                  />
                ) : (
                  <div className="text-sm text-gray-600 mt-1">{blog.metaDescription || '-'}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="border-b bg-gray-50/50">
              {isEditing ? (
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="text-lg font-bold"
                  placeholder="Blog Title"
                />
              ) : (
                <CardTitle className="text-xl">{blog.title}</CardTitle>
              )}
            </CardHeader>
            <CardContent className="py-6">
              {isEditing ? (
                <Textarea 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="min-h-[500px] font-mono text-sm"
                  placeholder="Write your markdown content here..."
                />
              ) : (
                <div className="prose prose-hdd max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                    {blog.content}
                  </ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
