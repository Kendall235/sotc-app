interface Env {}

const ALLOWED_DOMAINS = [
  'casio.com',
  'www.casio.com',
  'gshock.com',
  'www.gshock.com',
  'amazon.com',
  'm.media-amazon.com',
  'images-na.ssl-images-amazon.com',
];

const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');

  if (!imageUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validate domain is allowed
  const hostname = parsedUrl.hostname.toLowerCase();
  const isAllowed = ALLOWED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith('.' + domain)
  );

  if (!isAllowed) {
    return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Fetch the image from the source
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SOTC-App/1.0)',
        'Accept': 'image/*',
      },
    });

    if (!imageResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
        status: imageResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the image content type
    const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';

    // Return the image with CORS headers
    return new Response(imageResponse.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to proxy image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Handle CORS preflight requests
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};
