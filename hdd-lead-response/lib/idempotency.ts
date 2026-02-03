import prisma from '@/lib/db'

/**
 * Check if a webhook has already been processed
 * Returns true if already processed, false if new
 */
export async function isWebhookProcessed(
  webhookId: string,
  webhookType: string
): Promise<boolean> {
  const existing = await prisma.processedWebhook.findUnique({
    where: { webhookId },
  })

  return !!existing
}

/**
 * Mark a webhook as processed with 24 hour TTL
 */
export async function markWebhookProcessed(
  webhookId: string,
  webhookType: string
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  await prisma.processedWebhook.create({
    data: {
      webhookId,
      webhookType,
      expiresAt,
    },
  })
}

/**
 * Clean up expired webhook records
 * Should be called periodically (e.g., via cron)
 */
export async function cleanupExpiredWebhooks(): Promise<number> {
  const now = new Date()

  const result = await prisma.processedWebhook.deleteMany({
    where: {
      expiresAt: { lt: now },
    },
  })

  return result.count
}
