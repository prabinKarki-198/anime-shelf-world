const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');

    if (!path) {
      return new Response(
        JSON.stringify({ error: 'Missing "path" query parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build MangaDex URL with remaining query params
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const mangadexUrl = new URL(`https://api.mangadex.org${cleanPath}`);
    url.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        mangadexUrl.searchParams.append(key, value);
      }
    });

    const response = await fetch(mangadexUrl.toString(), {
      headers: {
        'User-Agent': 'MangaVerse/1.0',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `MangaDex API error: ${response.status}`, details: errorText }),
        { status: response.status >= 500 ? 502 : response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Proxy error', message: error.message }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
