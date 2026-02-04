import { del } from '@vercel/blob';

export const config = {
  runtime: 'edge',
};

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

export default async function handler(request: Request) {
  if (request.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify authentication
  if (!verifyApiSecret(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { url } = await request.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'No URL provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await del(url);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Log detailed error server-side for debugging
    console.error('Delete error:', error);
    // Return generic error to client to prevent information leakage
    return new Response(
      JSON.stringify({ error: 'Delete failed. Please try again.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
