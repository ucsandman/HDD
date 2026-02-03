import type { Quote } from '../types';

export interface FollowUpTemplate {
  type: 'sms' | 'email';
  subject?: string;
  message: string;
}

const franchiseeName = 'Nathan Ricke';
const franchiseePhone = '(513) 555-1234';
const companyName = 'Hickory Dickory Decks';

export function generateFollowUp24h(quote: Quote): FollowUpTemplate {
  return {
    type: 'sms',
    message: `Hi ${quote.customerName.split(' ')[0]}, this is ${franchiseeName} from ${companyName}. Just following up on your ${quote.projectType.toLowerCase()} quote for $${quote.estimatedTotal.toLocaleString()}. Any questions I can answer?`,
  };
}

export function generateFollowUp72h(quote: Quote): FollowUpTemplate {
  const firstName = quote.customerName.split(' ')[0];
  const subject = `Your ${quote.projectType} Quote from ${companyName}`;

  const message = `Hi ${firstName},

I wanted to follow up on the ${quote.projectType.toLowerCase()} quote I sent you for $${quote.estimatedTotal.toLocaleString()}.

Project Details:
• Type: ${quote.projectType}
• Size: ${quote.squareFootage} sq ft
• Material: ${quote.material}

We'd love to help bring your outdoor living space to life! Here's what sets us apart:

✓ Premium materials with 25+ year warranties
✓ Professional installation by experienced crews
✓ Locally owned and operated in Cincinnati
✓ Full project management from design to completion

Do you have any questions about the quote? I'm happy to discuss options or adjust anything to better fit your needs.

Best regards,
${franchiseeName}
${companyName}
${franchiseePhone}`;

  return {
    type: 'email',
    subject,
    message,
  };
}

export function generateFollowUp7d(quote: Quote): FollowUpTemplate {
  const firstName = quote.customerName.split(' ')[0];

  return {
    type: 'sms',
    message: `Hi ${firstName}, wanted to check in one last time about your ${quote.projectType.toLowerCase()} project. We'd love to help make it happen! Reply or call ${franchiseePhone}.`,
  };
}

export function generateCustomMessage(quote: Quote, template: string): string {
  const firstName = quote.customerName.split(' ')[0];

  return template
    .replace(/\{\{name\}\}/g, firstName)
    .replace(/\{\{fullName\}\}/g, quote.customerName)
    .replace(/\{\{franchisee\}\}/g, franchiseeName)
    .replace(/\{\{projectType\}\}/g, quote.projectType.toLowerCase())
    .replace(/\{\{total\}\}/g, quote.estimatedTotal.toLocaleString())
    .replace(/\{\{sqft\}\}/g, quote.squareFootage.toString())
    .replace(/\{\{material\}\}/g, quote.material)
    .replace(/\{\{phone\}\}/g, franchiseePhone);
}
