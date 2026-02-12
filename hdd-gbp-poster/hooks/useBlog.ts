import { useState, useCallback } from 'react'
import type { BlogData } from '@/types'
import type { GenerateBlogInput } from '@/schemas/blog'

interface UseBlogOptions {
  onSuccess?: (blog: BlogData) => void
  onError?: (error: string) => void
}

export function useBlog(options?: UseBlogOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateBlog = useCallback(async (params: GenerateBlogInput) => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate blog')
      }

      options?.onSuccess?.(result)
      return result as BlogData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate blog'
      setError(message)
      options?.onError?.(message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [options])

  const generateSummary = useCallback(async (blogId: string) => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(`/api/blogs/${blogId}/summary`, {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate summary')
      }

      return result as {
        summary: string
        postType: string
        blogId: string
        title: string
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate summary'
      setError(message)
      options?.onError?.(message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [options])

  return {
    generateBlog,
    generateSummary,
    isLoading,
    isGenerating,
    error,
    clearError: () => setError(null),
  }
}
