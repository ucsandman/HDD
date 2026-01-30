import twilio from 'twilio'

const globalForTwilio = globalThis as unknown as {
  twilioClient: twilio.Twilio | undefined
}

function createTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error('Missing Twilio credentials')
  }

  return twilio(accountSid, authToken)
}

export const twilioClient =
  globalForTwilio.twilioClient ?? createTwilioClient()

if (process.env.NODE_ENV !== 'production') {
  globalForTwilio.twilioClient = twilioClient
}

export default twilioClient

/**
 * Validate Twilio request signature
 */
export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) return false

  return twilio.validateRequest(authToken, signature, url, params)
}

/**
 * Get the Twilio phone number from environment
 */
export function getTwilioPhoneNumber(): string {
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER
  if (!phoneNumber) {
    throw new Error('Missing TWILIO_PHONE_NUMBER')
  }
  return phoneNumber
}
