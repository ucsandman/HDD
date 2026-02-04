/**
 * Server-side proxy for GBP Post Scheduler API
 * Keeps API credentials secure on the server, not exposed in client bundle
 */

export const config = {
  runtime: 'edge',
};

interface CreateDraftRequest {
  title?: string;
  body: string;
  postType?: 'project_showcase' | 'educational' | 'seasonal';
  suggestedDate?: string;
  source?: string;
}

export default async function handler(request: Request) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get server-side environment variables (not exposed to client)
  const GBP_POSTER_URL = process.env.GBP_POSTER_URL;
  const API_KEY = process.env.GBP_POSTER_API_KEY;
  const FRANCHISE_ID = process.env.GBP_FRANCHISE_ID;

  if (!GBP_POSTER_URL || !API_KEY || !FRANCHISE_ID) {
    return new Response(
      JSON.stringify({
        error: 'GBP integration not configured',
        details: 'Server environment variables not set',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body: CreateDraftRequest = await request.json();

    // Validate required fields
    if (!body.body || typeof body.body !== 'string' || body.body.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate body length
    if (body.body.length > 1500) {
      return new Response(
        JSON.stringify({ error: 'Body too long. Maximum 1500 characters.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Proxy the request to GBP Post Scheduler
    const response = await fetch(`${GBP_POSTER_URL}/api/external/create-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-franchise-id': FRANCHISE_ID,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.error || 'Failed to create draft',
          details: data.details,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // Log detailed error server-side for debugging
    console.error('Error proxying to GBP API:', error);
    // Return generic error to client to prevent information leakage
    return new Response(
      JSON.stringify({
        error: 'Failed to connect to GBP Post Scheduler. Please try again.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
