/**
 * Get the API secret from environment variable
 * This secret should be set in .env as VITE_API_SECRET
 *
 * SECURITY NOTE: For production deployment, this app should be
 * protected with Vercel's password protection or deployed behind
 * a VPN/authentication proxy since client-side secrets can be extracted.
 */
function getApiSecret(): string {
  const secret = import.meta.env.VITE_API_SECRET;
  if (!secret) {
    throw new Error('VITE_API_SECRET environment variable not configured');
  }
  return secret;
}

/**
 * Upload a file to Vercel Blob storage
 */
export async function uploadToBlob(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiSecret()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const blob = await response.json();
  return blob.url;
}

/**
 * Delete a file from Vercel Blob storage
 */
export async function deleteFromBlob(url: string): Promise<void> {
  const response = await fetch('/api/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getApiSecret()}`,
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Delete failed');
  }
}

/**
 * Check if a string is a base64 data URL
 */
export function isBase64DataUrl(str: string): boolean {
  return str.startsWith('data:');
}

/**
 * Check if a string is a Blob URL
 */
export function isBlobUrl(str: string): boolean {
  return str.startsWith('https://') && str.includes('blob.vercel-storage.com');
}

/**
 * Convert base64 data URL to File object
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Migrate base64 photo to Blob storage
 */
export async function migratePhotoToBlob(base64Url: string, index: number): Promise<string> {
  try {
    const filename = `migrated-photo-${Date.now()}-${index}.jpg`;
    const file = dataUrlToFile(base64Url, filename);
    return await uploadToBlob(file);
  } catch (error) {
    // Only log in development mode
    if (import.meta.env.DEV) {
      console.error('Migration failed:', error);
    }
    throw error;
  }
}
