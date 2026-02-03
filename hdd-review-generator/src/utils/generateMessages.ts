import type { FormData, GeneratedMessages } from '../types';

const SMS_CHAR_LIMIT = 320;

function generateSMS(data: FormData): string {
  const fullMessage = `Hi ${data.customerFirstName}! This is ${data.franchiseeName} from Hickory Dickory Decks. We hope you're enjoying your new ${data.projectType.toLowerCase()}! If you have a moment, we'd really appreciate a Google review: ${data.googleReviewLink}`;

  if (fullMessage.length <= SMS_CHAR_LIMIT) {
    return fullMessage;
  }

  // Use shorter fallback version
  return `Hi ${data.customerFirstName}! ${data.franchiseeName} from Hickory Dickory Decks here. Enjoying your new ${data.projectType.toLowerCase()}? We'd love a quick review: ${data.googleReviewLink}`;
}

function generateEmailSubject(data: FormData): string {
  return `How's your new ${data.projectType.toLowerCase()}, ${data.customerFirstName}?`;
}

function generateEmailBody(data: FormData): string {
  return `Hi ${data.customerFirstName},

I wanted to check in and see how you're enjoying your new ${data.projectType.toLowerCase()}. It was a pleasure working with you on this project in ${data.city}, and I hope it's everything you envisioned.

If you have a few minutes, I'd be incredibly grateful if you could share your experience with a Google review. Your feedback helps other homeowners in ${data.city} find quality deck builders, and it means a lot to our team.

Leave a review here: ${data.googleReviewLink}

Thank you again for choosing Hickory Dickory Decks. If you ever have questions about maintenance or future projects, don't hesitate to reach out.

Best regards,
${data.franchiseeName}
Hickory Dickory Decks`;
}

function generateThankYouCard(data: FormData): string {
  return `Dear ${data.customerFirstName} ${data.customerLastName},

Thank you for trusting Hickory Dickory Decks with your ${data.projectType.toLowerCase()} project. It was a pleasure working with you, and we hope your new outdoor space brings years of enjoyment.

If you haven't already, we'd be honored if you'd share your experience online. Your recommendation helps us continue serving families in ${data.city}.

With gratitude,
${data.franchiseeName}
Hickory Dickory Decks`;
}

export function generateMessages(data: FormData): GeneratedMessages {
  return {
    sms: generateSMS(data),
    emailSubject: generateEmailSubject(data),
    emailBody: generateEmailBody(data),
    thankYouCard: generateThankYouCard(data),
  };
}
