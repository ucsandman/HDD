'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Upload, Loader2, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { PROJECT_TYPES } from '@/types'
import type { ImageData } from '@/types'

export default function ImagesPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [projectTypeFilter, setProjectTypeFilter] = useState('')
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [editAltText, setEditAltText] = useState('')
  const [editProjectType, setEditProjectType] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchImages()
  }, [projectTypeFilter])

  async function fetchImages() {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (projectTypeFilter) {
        params.set('projectType', projectTypeFilter)
      }
      const response = await fetch(`/api/images?${params}`)
      if (response.ok) {
        const data = await response.json()
        setImages(data.images)
      }
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          alert(data.error || 'Failed to upload image')
        }
      }
      fetchImages()
    } catch (error) {
      console.error('Error uploading:', error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/images/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchImages()
        setSelectedImage(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete image')
      }
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  async function handleSaveEdit() {
    if (!selectedImage) return

    try {
      const response = await fetch(`/api/images/${selectedImage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          altText: editAltText || null,
          projectType: editProjectType || null,
        }),
      })

      if (response.ok) {
        fetchImages()
        setSelectedImage(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to update image')
      }
    } catch (error) {
      console.error('Error updating:', error)
    }
  }

  function openEditDialog(image: ImageData) {
    setSelectedImage(image)
    setEditAltText(image.altText || '')
    setEditProjectType(image.projectType || '')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hdd-green-dark">Image Library</h1>
          <p className="text-gray-500 mt-1">Upload and manage images for your posts</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select
            value={projectTypeFilter}
            onChange={(e) => setProjectTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </option>
            ))}
          </Select>
        </div>
        <span className="text-sm text-gray-500">
          {images.length} image{images.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        onDragOver={(e) => {
          e.preventDefault()
          e.currentTarget.classList.add('border-gray-500', 'bg-gray-50')
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('border-gray-500', 'bg-gray-50')
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.currentTarget.classList.remove('border-gray-500', 'bg-gray-50')
          handleUpload(e.dataTransfer.files)
        }}
      >
        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          Drag and drop images here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-900 font-medium hover:underline"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          JPEG, PNG, WebP, GIF up to 5MB
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No images yet. Upload your first image!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <Card
              key={image.id}
              className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openEditDialog(image)}
            >
              <div className="aspect-square relative">
                <img
                  src={image.url}
                  alt={image.altText || 'Image'}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">
                  {image.filename || 'Untitled'}
                </p>
                {image.projectType && (
                  <p className="text-xs text-gray-500 capitalize">
                    {image.projectType.replace(/_/g, ' ')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="aspect-video relative bg-gray-100 rounded overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.altText || 'Image'}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-sm text-gray-500">
                Uploaded {formatDateTime(selectedImage.createdAt)}
              </div>

              <div>
                <Label htmlFor="altText">Alt Text</Label>
                <Input
                  id="altText"
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder="Describe this image..."
                />
              </div>

              <div>
                <Label htmlFor="editProjectType">Project Type</Label>
                <Select
                  id="editProjectType"
                  value={editProjectType}
                  onChange={(e) => setEditProjectType(e.target.value)}
                >
                  <option value="">None</option>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={() => selectedImage && handleDelete(selectedImage.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedImage(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
