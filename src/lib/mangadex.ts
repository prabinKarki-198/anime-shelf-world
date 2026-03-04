const MANGADEX_API = "https://api.mangadex.org";

export async function mangadexFetch<T = unknown>(path: string, params?: Record<string, string | string[]>): Promise<T> {
  const url = new URL(`${MANGADEX_API}/${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => url.searchParams.append(key, v));
      } else {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString());

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
