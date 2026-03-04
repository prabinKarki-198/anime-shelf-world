import { MangaEntity, MangaDexResponse } from '../lib/types';

export interface MangaSectionResult {
  data: MangaEntity[];
  total: number;
}

export async function fetchMangaSection(
  section: 'popular' | 'trending' | 'topRated' | 'newReleases',
  page: number
): Promise<MangaSectionResult> {
  const limit = 20;
  const offset = (page - 1) * limit;
  let order: Record<string, string> = {};
  switch (section) {
    case 'popular':
      order = { 'followedCount': 'desc' };
      break;
    case 'trending':
      order = { 'latestUploadedChapter': 'desc' };
      break;
    case 'topRated':
      order = { 'rating': 'desc' };
      break;
    case 'newReleases':
      order = { 'createdAt': 'desc' };
      break;
  }
  const params: Record<string, string | string[]> = {
    [`order[${Object.keys(order)[0]}]`]: Object.values(order)[0],
    limit: String(limit),
    offset: String(offset),
    'includes[]': ['cover_art', 'author', 'artist'],
  };
  const res = await import('./mangadex').then(m => m.mangadexFetch<MangaDexResponse<MangaEntity[]>>('manga', params));
  return {
    data: res.data,
    total: res.total || 0,
  };
}

export async function fetchMangaDetail(id: string) {
  return await import('./mangadex').then(m => m.mangadexFetch<MangaDexResponse<MangaEntity>>(`manga/${id}`));
}

export async function fetchSimilarManga(tagIds: string[]): Promise<MangaSectionResult> {
  const params: Record<string, string | string[]> = {
    'includedTags[]': tagIds,
    limit: '12',
    'includes[]': ['cover_art', 'author', 'artist'],
  };
  const res = await import('./mangadex').then(m => m.mangadexFetch<MangaDexResponse<MangaEntity[]>>('manga', params));
  return {
    data: res.data,
    total: res.total || 0,
  };
}
