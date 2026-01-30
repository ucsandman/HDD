import { PrismaClient } from '@prisma/client'
import {
  DEFAULT_SMS_TEMPLATES,
  DEFAULT_EMAIL_TEMPLATES,
} from '../lib/templates'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'nricke@decks.ca' },
    update: {},
    create: {
      email: 'nricke@decks.ca',
      name: 'Nathan Ricke',
      role: 'admin',
    },
  })
  console.log('Created admin user:', adminUser.email)

  // Create sequence steps
  const sequenceSteps = [
    {
      stepNumber: 0,
      name: 'Instant Response',
      delayMinutes: 0,
      smsTemplate: DEFAULT_SMS_TEMPLATES.instant,
      emailSubject: DEFAULT_EMAIL_TEMPLATES.instant.subject,
      emailTemplate: DEFAULT_EMAIL_TEMPLATES.instant.body,
      sendSms: true,
      sendEmail: true,
      isActive: true,
    },
    {
      stepNumber: 1,
      name: '4 Hour Follow-up',
      delayMinutes: 240, // 4 hours
      smsTemplate: DEFAULT_SMS_TEMPLATES.fourHours,
      emailSubject: null,
      emailTemplate: null,
      sendSms: true,
      sendEmail: false,
      isActive: true,
    },
    {
      stepNumber: 2,
      name: '24 Hour Follow-up',
      delayMinutes: 1440, // 24 hours
      smsTemplate: DEFAULT_SMS_TEMPLATES.twentyFourHours,
      emailSubject: DEFAULT_EMAIL_TEMPLATES.twentyFourHours.subject,
      emailTemplate: DEFAULT_EMAIL_TEMPLATES.twentyFourHours.body,
      sendSms: true,
      sendEmail: true,
      isActive: true,
    },
    {
      stepNumber: 3,
      name: '72 Hour Follow-up',
      delayMinutes: 4320, // 72 hours
      smsTemplate: DEFAULT_SMS_TEMPLATES.seventyTwoHours,
      emailSubject: null,
      emailTemplate: null,
      sendSms: true,
      sendEmail: false,
      isActive: true,
    },
    {
      stepNumber: 4,
      name: '7 Day Final Follow-up',
      delayMinutes: 10080, // 7 days
      smsTemplate: null,
      emailSubject: DEFAULT_EMAIL_TEMPLATES.sevenDays.subject,
      emailTemplate: DEFAULT_EMAIL_TEMPLATES.sevenDays.body,
      sendSms: false,
      sendEmail: true,
      isActive: true,
    },
  ]

  for (const step of sequenceSteps) {
    await prisma.sequenceStep.upsert({
      where: { stepNumber: step.stepNumber },
      update: step,
      create: step,
    })
  }
  console.log('Created sequence steps:', sequenceSteps.length)

  // Create default settings
  const defaultSettings = [
    { key: 'businessName', value: 'Hickory Dickory Decks Cincinnati' },
    { key: 'businessPhone', value: '(513) 555-4321' },
    { key: 'ownerName', value: 'Nathan' },
    { key: 'bookingLink', value: 'https://cal.com/hdd-cincinnati/consultation' },
    { key: 'websiteUrl', value: 'https://hdd-cincinnati.com' },
    { key: 'googleReviewUrl', value: '' },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  console.log('Created default settings:', defaultSettings.length)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
