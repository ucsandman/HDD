import { useState, useCallback } from 'react'
import type { PostData, PostType, CallToActionType, GeneratePostParams } from '@/types'

interface UsePostOptions {
  onSuccess?: (post: PostData) => void
  onError?: (error: string) => void
}

export function usePost(options?: UsePostOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPost = useCallback(async (data: {
    postType: PostType
    body: string
    title?: string
    callToAction?: CallToActionType
    callToActionUrl?: string
    imageIds?: string[]
    generatedBy?: 'ai' | 'manual'
    generationPrompt?: string
    blogId?: string
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create post')
      }

      options?.onSuccess?.(result)
      return result as PostData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post'
      setError(message)
      options?.onError?.(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const updatePost = useCallback(async (id: string, data: {
    postType?: PostType
    body?: string
    title?: string | null
    callToAction?: CallToActionType | null
    callToActionUrl?: string | null
    imageIds?: string[]
    status?: string
    blogId?: string
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update post')
      }

      options?.onSuccess?.(result)
      return result as PostData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update post'
      setError(message)
      options?.onError?.(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const generateDraft = useCallback(async (params: GeneratePostParams) => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`)
        }
        throw new Error(result.error || 'Failed to generate draft')
      }

      return result as {
        body: string
        postType: PostType
        generationPrompt: string
        characterCount: number
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate draft'
      setError(message)
      options?.onError?.(message)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [options])

  const approvePost = useCallback(async (id: string, scheduledFor?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/posts/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledFor }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve post')
      }

      options?.onSuccess?.(result)
      return result as PostData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve post'
      setError(message)
      options?.onError?.(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [options])

  const publishPost = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/posts/${id}/publish`, {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to publish post')
      }

      options?.onSuccess?.(result)
      return result as PostData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish post'
      setError(message)
      options?.onError?.(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [options])

  return {
    createPost,
    updatePost,
    generateDraft,
    approvePost,
    publishPost,
    isLoading,
    isGenerating,
    error,
    clearError: () => setError(null),
  }
}
