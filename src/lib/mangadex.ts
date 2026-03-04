const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function mangadexFetch<T = unknown>(path: string, params?: Record<string, string | string[]>): Promise<T> {
  // Build query string for the proxy
  const queryParams = new URLSearchParams();
  queryParams.set('path', path);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      } else {
        queryParams.set(key, value);
      }
    });
  }

  const proxyUrl = `${SUPABASE_URL}/functions/v1/clever-worker?${queryParams.toString()}`;

  const response = await fetch(proxyUrl, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// Helper to extract cover filename from manga relationships
export function getCoverUrl(mangaId: string, fileName: string, size?: '256' | '512'): string {
  if (size) {
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.${size}.jpg`;
  }
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
}

// Helper to extract attribute by locale with fallback
export function getTitle(titleMap: Record<string, string> | undefined): string {
  if (!titleMap) return 'Untitled';
  return titleMap['en'] || titleMap['ja-ro'] || titleMap['ja'] || Object.values(titleMap)[0] || 'Untitled';
}

export function getDescription(descMap: Record<string, string> | undefined): string {
  if (!descMap) return '';
  return descMap['en'] || Object.values(descMap)[0] || '';
}
