import type { Lead, SequenceStep } from '@prisma/client'

interface TemplateContext {
  lead: Lead
  settings: Record<string, string>
}

/**
 * Render a template string with {{variable}} placeholders
 */
export function renderTemplate(
  template: string,
  context: TemplateContext
): string {
  const { lead, settings } = context

  // Build variables map
  const variables: Record<string, string> = {
    // Lead variables
    firstName: lead.firstName || '',
    lastName: lead.lastName || '',
    fullName: [lead.firstName, lead.lastName].filter(Boolean).join(' '),
    email: lead.email || '',
    phone: lead.phone || '',
    city: lead.city || '',
    address: lead.address || '',
    projectType: lead.projectType || 'deck',
    projectDescription: lead.projectDescription || '',
    source: lead.source || '',

    // Business variables from settings
    businessName: settings.businessName || 'Hickory Dickory Decks Cincinnati',
    businessPhone: settings.businessPhone || '',
    ownerName: settings.ownerName || 'Nathan',
    bookingLink: settings.bookingLink || process.env.CAL_BOOKING_LINK || '',
    websiteUrl: settings.websiteUrl || '',
    googleReviewUrl: settings.googleReviewUrl || '',
  }

  // Replace all {{variable}} placeholders
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] ?? match
  })
}

/**
 * Render SMS template for a sequence step
 */
export function renderSmsTemplate(
  step: SequenceStep,
  context: TemplateContext
): string | null {
  if (!step.smsTemplate) return null
  return renderTemplate(step.smsTemplate, context)
}

/**
 * Render email templates for a sequence step
 */
export function renderEmailTemplates(
  step: SequenceStep,
  context: TemplateContext
): { subject: string; body: string } | null {
  if (!step.emailSubject || !step.emailTemplate) return null

  return {
    subject: renderTemplate(step.emailSubject, context),
    body: renderTemplate(step.emailTemplate, context),
  }
}

/**
 * Get preview of a template with sample data
 */
export function previewTemplate(template: string): string {
  const sampleContext: TemplateContext = {
    lead: {
      id: 'sample',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      phone: '(513) 555-1234',
      phoneNormalized: '+15135551234',
      city: 'Mason',
      address: '123 Main St',
      projectType: 'deck',
      projectDescription: 'New composite deck with railing',
      source: 'website',
      status: 'new',
      sequenceStatus: 'active',
      sequenceStep: 0,
      nextFollowupAt: null,
      lastContactedAt: null,
      lastRespondedAt: null,
      consultationBookedAt: null,
      closedAt: null,
      closedReason: null,
      notes: null,
      externalId: null,
      createdById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    settings: {
      businessName: 'Hickory Dickory Decks Cincinnati',
      businessPhone: '(513) 555-4321',
      ownerName: 'Nathan',
      bookingLink: 'https://cal.com/hdd-cincinnati/consultation',
      websiteUrl: 'https://hdd-cincinnati.com',
    },
  }

  return renderTemplate(template, sampleContext)
}

/**
 * Default SMS templates for each sequence step
 */
export const DEFAULT_SMS_TEMPLATES = {
  instant: `Hi {{firstName}}! This is {{ownerName}} from {{businessName}}. Thanks for reaching out about your {{projectType}} project in {{city}}! I'd love to learn more. Can we schedule a quick call? Book a time here: {{bookingLink}}`,

  fourHours: `Hi {{firstName}}, just following up on your {{projectType}} inquiry. I have some great ideas for your project in {{city}}. Would you like to chat? {{bookingLink}}`,

  twentyFourHours: `{{firstName}}, I wanted to make sure you got my message about your {{projectType}} project. We're booking consultations for the next few weeks - would love to get you on the calendar: {{bookingLink}}`,

  seventyTwoHours: `Hi {{firstName}}, final follow-up on your deck project! We'd love to help transform your outdoor space in {{city}}. Book a free consultation: {{bookingLink}} - {{ownerName}}`,
}

/**
 * Default email templates for each sequence step
 */
export const DEFAULT_EMAIL_TEMPLATES = {
  instant: {
    subject: `Your {{projectType}} project in {{city}} - Let's chat!`,
    body: `Hi {{firstName}},

Thank you for reaching out about your {{projectType}} project! I'm {{ownerName}} from {{businessName}}, and I'm excited to help you create the perfect outdoor living space.

I'd love to learn more about your vision for your home in {{city}}. Our team specializes in custom decks, pergolas, and outdoor structures built to last.

**Book a free consultation:** {{bookingLink}}

Or reply to this email with any questions - I'm happy to help!

Best,
{{ownerName}}
{{businessName}}
{{businessPhone}}`,
  },

  twentyFourHours: {
    subject: `Following up on your {{projectType}} project`,
    body: `Hi {{firstName}},

I wanted to follow up on your inquiry about a {{projectType}} for your home in {{city}}.

At {{businessName}}, we pride ourselves on quality craftsmanship and customer service. We'd love to show you some of our recent projects and discuss how we can bring your vision to life.

**Schedule your free consultation:** {{bookingLink}}

Looking forward to hearing from you!

{{ownerName}}
{{businessName}}`,
  },

  sevenDays: {
    subject: `Last chance: Free {{projectType}} consultation`,
    body: `Hi {{firstName}},

I hope this message finds you well! I wanted to reach out one more time about your {{projectType}} project in {{city}}.

If you're still considering upgrading your outdoor space, we'd love to help. Our consultations are free and no-obligation - we'll visit your home, discuss your ideas, and provide a detailed quote.

**Book your consultation before our schedule fills up:** {{bookingLink}}

If the timing isn't right, no worries at all. Feel free to reach out whenever you're ready.

Best wishes,
{{ownerName}}
{{businessName}}
{{businessPhone}}`,
  },
}
