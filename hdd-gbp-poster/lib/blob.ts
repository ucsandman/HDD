import { put, del } from '@vercel/blob'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

/**
 * Validate file extension matches allowed types
 */
export function validateFileExtension(filename: string): { valid: boolean; error?: string } {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'))
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }
  return { valid: true }
}

// Magic bytes for image file type validation
// These are the first bytes that identify the file format
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG starts with FF D8 FF
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG signature
  'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]], // GIF87a or GIF89a
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF (WebP starts with RIFF....WEBP)
}

/**
 * Validate file content matches declared MIME type using magic bytes
 * This prevents attackers from uploading malicious files with spoofed MIME types
 */
export async function validateMagicBytes(file: File | Blob): Promise<{ valid: boolean; detectedType?: string }> {
  const buffer = await file.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  for (const [mimeType, signatures] of Object.entries(MAGIC_BYTES)) {
    for (const signature of signatures) {
      if (signature.every((byte, index) => bytes[index] === byte)) {
        // Special case for WebP: check for WEBP marker at offset 8
        if (mimeType === 'image/webp') {
          const webpMarker = new Uint8Array(await file.slice(8, 12).arrayBuffer())
          if (webpMarker[0] === 0x57 && webpMarker[1] === 0x45 &&
              webpMarker[2] === 0x42 && webpMarker[3] === 0x50) {
            return { valid: true, detectedType: mimeType }
          }
        } else {
          return { valid: true, detectedType: mimeType }
        }
      }
    }
  }

  return { valid: false }
}

export interface UploadResult {
  url: string
  pathname: string
}

export async function uploadImage(
  file: File | Blob,
  filename: string
): Promise<UploadResult> {
  // Validate file extension
  const extValidation = validateFileExtension(filename)
  if (!extValidation.valid) {
    throw new Error(extValidation.error)
  }

  // Validate declared MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`)
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Validate actual file content matches declared type (magic bytes)
  const magicValidation = await validateMagicBytes(file)
  if (!magicValidation.valid) {
    throw new Error('File content does not match declared type. File may be corrupted or malicious.')
  }

  // Ensure detected type matches declared type
  if (magicValidation.detectedType && magicValidation.detectedType !== file.type) {
    throw new Error(`File content (${magicValidation.detectedType}) does not match declared type (${file.type})`)
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

/**
 * Full async validation including magic bytes check
 */
export async function validateImageFileAsync(file: File): Promise<{ valid: boolean; error?: string }> {
  // Basic validation
  const basicValidation = validateImageFile(file)
  if (!basicValidation.valid) {
    return basicValidation
  }

  // Magic bytes validation
  const magicValidation = await validateMagicBytes(file)
  if (!magicValidation.valid) {
    return {
      valid: false,
      error: 'File content does not match declared type. File may be corrupted.',
    }
  }

  if (magicValidation.detectedType && magicValidation.detectedType !== file.type) {
    return {
      valid: false,
      error: `File content (${magicValidation.detectedType}) does not match declared type (${file.type})`,
    }
  }

  return { valid: true }
}
