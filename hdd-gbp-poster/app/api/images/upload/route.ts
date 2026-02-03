import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { validateImageFile } from '@/lib/blob'
import { isDemoMode } from '@/lib/demo'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const projectType = formData.get('projectType') as string | null
    const altText = formData.get('altText') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    let imageUrl: string

    if (isDemoMode) {
      // Demo mode: save to local public/demo-uploads directory
      const uploadDir = path.join(process.cwd(), 'public', 'demo-uploads')

      // Ensure directory exists
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch {
        // Directory may already exist
      }

      // Generate unique filename
      const timestamp = Date.now()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${timestamp}-${sanitizedName}`
      const filepath = path.join(uploadDir, filename)

      // Write file
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filepath, buffer)

      // URL for local serving
      imageUrl = `/demo-uploads/${filename}`
    } else {
      // Production mode: upload to Vercel Blob
      const { uploadImage } = await import('@/lib/blob')
      const result = await uploadImage(file, file.name)
      imageUrl = result.url
    }

    // Create database record
    // Note: In demo mode with SQLite, tags is stored as JSON string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageData: any = {
      url: imageUrl,
      filename: file.name,
      altText: altText || null,
      projectType: projectType || null,
      tags: isDemoMode ? JSON.stringify([]) : [],
      franchiseId: session.user.franchiseId,
      uploadedBy: session.user.id,
    }

    const image = await prisma.image.create({
      data: imageData,
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
