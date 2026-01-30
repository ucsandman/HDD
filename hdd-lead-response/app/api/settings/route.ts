import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { updateSettingsSchema, SETTING_KEYS } from '@/schemas/settings'

export async function GET() {
  try {
    await requireAuth()

    const settings = await prisma.setting.findMany()

    // Convert to key-value object
    const settingsMap = settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, string>
    )

    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    await requireAuth()

    const body = await request.json()
    const validation = updateSettingsSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const updates = validation.data

    // Upsert each setting
    const results = await Promise.all(
      Object.entries(updates).map(([key, value]) => {
        if (!SETTING_KEYS.includes(key as typeof SETTING_KEYS[number])) {
          return null
        }
        return prisma.setting.upsert({
          where: { key },
          create: { key, value: value as string },
          update: { value: value as string },
        })
      })
    )

    return NextResponse.json({ success: true, updated: results.filter(Boolean).length })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
