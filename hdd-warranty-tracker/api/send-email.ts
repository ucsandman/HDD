import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Verify API secret for authentication
 */
function verifyApiSecret(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const apiSecret = process.env.API_SECRET;

  if (!apiSecret) {
    console.error('API_SECRET environment variable not configured');
    return false;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  return token === apiSecret;
}

export default async function handler(req: Request) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Verify authentication
  if (!verifyApiSecret(req)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const body = await req.json();
    const { to, subject, html, customerName } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format (RFC 5322 compliant pattern)
    // Requires: local part, @, domain with at least one dot, TLD 2-63 chars
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,63}$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Hickory Dickory Decks <noreply@hickorydickorydecks.com>',
      to,
      subject,
      html,
      replyTo: process.env.REPLY_TO_EMAIL || 'cincinnati@hickorydickorydecks.com',
    });

    if (error) {
      // Log detailed error server-side for debugging
      console.error('Resend API error:', error);
      // Return generic error to client to prevent information leakage
      return new Response(
        JSON.stringify({ error: 'Failed to send email. Please try again.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        id: data?.id,
        message: `Email sent to ${customerName || to}`
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    // Log detailed error server-side for debugging
    console.error('Email send error:', error);
    // Return generic error to client to prevent information leakage
    return new Response(
      JSON.stringify({
        error: 'An error occurred while sending the email. Please try again.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
