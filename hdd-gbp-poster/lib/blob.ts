import { put, del } from '@vercel/blob'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export interface UploadResult {
  url: string
  pathname: string
}

export async function uploadImage(
  file: File | Blob,
  filename: string
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`)
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Generate unique pathname
  const timestamp = Date.now()
  const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const pathname = `images/${timestamp}-${sanitizedName}`

  const blob = await put(pathname, file, {
    access: 'public',
    addRandomSuffix: false,
  })

  return {
    url: blob.url,
    pathname: blob.pathname,
  }
}

export async function deleteImage(url: string): Promise<void> {
  await del(url)
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: JPEG, PNG, WebP, GIF`,
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: 5MB`,
    }
  }

  return { valid: true }
}
