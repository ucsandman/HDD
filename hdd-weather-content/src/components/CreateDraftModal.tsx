import { useState } from 'react'
import { createDraft, GBPApiError } from '../lib/gbpApi'
import type { ContentSuggestion } from '../types'
import './CreateDraftModal.css'

export interface CreateDraftModalProps {
  suggestion: ContentSuggestion
  onClose: () => void
  onSuccess: (postId: string, editUrl: string) => void
  onError: (message: string) => void
}

export default function CreateDraftModal({
  suggestion,
  onClose,
  onSuccess,
  onError,
}: CreateDraftModalProps) {
  const [body, setBody] = useState(suggestion.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await createDraft({
        body: body.trim(),
        postType: 'seasonal',
        source: 'weather-content',
      })

      onSuccess(response.postId, response.editUrl)
      onClose()
    } catch (error) {
      if (error instanceof GBPApiError) {
        onError(error.message)
      } else {
        onError('An unexpected error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create GBP Draft</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-field">
              <label htmlFor="post-body">Post Content</label>
              <textarea
                id="post-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                maxLength={1500}
                required
              />
              <div className="field-hint">
                {body.length}/1500 characters
              </div>
            </div>

            <div className="modal-info">
              <strong>Note:</strong> This will create a draft in GBP Post Scheduler.
              You can edit and schedule it there.
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
