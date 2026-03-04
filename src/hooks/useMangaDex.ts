import { useQuery } from '@tanstack/react-query';
import { mangadexFetch } from '@/lib/mangadex';
import type { MangaDexResponse, MangaEntity, ChapterEntity, AtHomeResponse, TagEntity } from '@/lib/types';

// Popular manga
export function usePopularManga() {
  return useQuery({
    queryKey: ['popular-manga'],
    queryFn: () =>
      mangadexFetch<MangaDexResponse<MangaEntity[]>>('/manga', {
      'order[followedCount]': 'desc',
        limit: '20',
        'includes[]': ['cover_art', 'author'],
        'contentRating[]': ['safe', 'suggestive'],
      }),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}

// Search manga with pagination
export function useSearchManga(query: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  return useQuery({
    queryKey: ['search-manga', query, page],
    queryFn: () =>
      mangadexFetch<MangaDexResponse<MangaEntity[]>>('/manga', {
        title: query,
        limit: String(limit),
        offset: String(offset),
        'includes[]': ['cover_art', 'author'],
        'contentRating[]': ['safe', 'suggestive'],
      }),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Genre tags
export function useTags() {
  return useQuery({
    queryKey: ['manga-tags'],
    queryFn: () => mangadexFetch<MangaDexResponse<TagEntity[]>>('/manga/tag'),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });
}

// Manga by tag with pagination
export function useMangaByTag(tagId: string, page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit;
  return useQuery({
    queryKey: ['manga-by-tag', tagId, page],
    queryFn: () =>
      mangadexFetch<MangaDexResponse<MangaEntity[]>>('/manga', {
        'includedTags[]': [tagId],
        limit: String(limit),
        offset: String(offset),
        'includes[]': ['cover_art', 'author'],
        'contentRating[]': ['safe', 'suggestive'],
      }),
    enabled: !!tagId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
}

// Manga details
export function useMangaDetail(mangaId: string) {
  return useQuery({
    queryKey: ['manga-detail', mangaId],
    queryFn: () =>
      mangadexFetch<MangaDexResponse<MangaEntity>>(`/manga/${mangaId}`, {
        'includes[]': ['cover_art', 'author', 'artist'],
      }),
    enabled: !!mangaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
}

// Chapter feed with pagination
export function useChapterFeed(mangaId: string, page: number = 1, limit: number = 100) {
  const offset = (page - 1) * limit;
  return useQuery({
    queryKey: ['chapter-feed', mangaId, page],
    queryFn: () =>
      mangadexFetch<MangaDexResponse<ChapterEntity[]>>(`/manga/${mangaId}/feed`, {
        'translatedLanguage[]': ['en'],
        'order[chapter]': 'desc',
        limit: String(limit),
        offset: String(offset),
        'includes[]': ['scanlation_group'],
      }),
    enabled: !!mangaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// Chapter pages (at-home)
export function useChapterPages(chapterId: string) {
  return useQuery({
    queryKey: ['chapter-pages', chapterId],
    queryFn: () => mangadexFetch<AtHomeResponse>(`/at-home/server/${chapterId}`),
    enabled: !!chapterId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 2,
  });
}

// Chapter detail (to get manga relationship)
export function useChapterDetail(chapterId: string) {
  return useQuery({
    queryKey: ['chapter-detail', chapterId],
    queryFn: () =>
      mangadexFetch<MangaDexResponse<ChapterEntity>>(`/chapter/${chapterId}`, {
        'includes[]': ['manga'],
      }),
    enabled: !!chapterId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}
