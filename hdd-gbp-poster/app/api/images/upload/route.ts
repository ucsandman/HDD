import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import { uploadImage, validateImageFile } from '@/lib/blob'

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

    // Upload to Vercel Blob
    const result = await uploadImage(file, file.name)

    // Create database record
    const image = await prisma.image.create({
      data: {
        url: result.url,
        filename: file.name,
        altText: altText || null,
        projectType: projectType || null,
        tags: [],
        franchiseId: session.user.franchiseId,
        uploadedBy: session.user.id,
      },
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
