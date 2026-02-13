'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Share2, Loader2 } from 'lucide-react'
import { useBlog } from '@/hooks/useBlog'

export function GenerateSummaryButton({ blogId }: { blogId: string }) {
  const router = useRouter()
  const { generateSummary, isGenerating } = useBlog()

  async function handleCreateGBPPost() {
    try {
      const result = await generateSummary(blogId)
      
      // Store summary in session storage to pass to the new post page
      sessionStorage.setItem('pending_gbp_summary', JSON.stringify({
        body: result.summary,
        title: result.title,
        blogId: blogId
      }))
      
      router.push('/posts/new?from_blog=' + blogId)
    } catch {
      // Error is handled by useBlog toast
    }
  }

  return (
    <Button 
      onClick={handleCreateGBPPost} 
      className="bg-hdd-green hover:bg-hdd-green-dark"
      disabled={isGenerating}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Share2 className="h-4 w-4 mr-2" />
      )}
      Create GBP Update
    </Button>
  )
}
