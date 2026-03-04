import { useState, useCallback } from 'react';
import { useTags, useMangaByTag } from '@/hooks/useMangaDex';
import { MangaCard } from '@/components/MangaCard';
import { MangaCardSkeleton } from '@/components/MangaCardSkeleton';
import { ErrorState } from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import { getTitle } from '@/lib/mangadex';

const LIMIT = 20;

export default function GenresPage() {
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data: tagsData, isLoading: tagsLoading, isError: tagsError, refetch: refetchTags } = useTags();
  const { data: mangaData, isLoading: mangaLoading, isError: mangaError, refetch: refetchManga } = useMangaByTag(selectedTag, currentPage, LIMIT);

  const total = mangaData?.total || 0;

  const handleTagSelect = useCallback((tagId: string) => {
    setSelectedTag(tagId === selectedTag ? '' : tagId);
    setCurrentPage(1); // Reset to page 1 when changing tag
  }, [selectedTag]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Filter only "genre" and "theme" tags
  const tags = tagsData?.data?.filter(t => ['genre', 'theme'].includes(t.attributes.group)) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Browse by Genre</h1>

      {tagsError && <ErrorState message="Failed to load genres" onRetry={() => refetchTags()} />}

      <div className="flex flex-wrap gap-2 mb-8">
        {tagsLoading && Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-muted animate-pulse" />
        ))}
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => handleTagSelect(tag.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              tag.id === selectedTag
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
            }`}
          >
            {getTitle(tag.attributes.name)}
          </button>
        ))}
      </div>

      {mangaError && selectedTag && <ErrorState message="Failed to load manga" onRetry={() => refetchManga()} />}

      {!selectedTag && (
        <p className="text-center text-muted-foreground py-12">Select a genre to browse manga</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mangaLoading && selectedTag && Array.from({ length: 10 }).map((_, i) => <MangaCardSkeleton key={i} />)}
        {mangaData?.data?.map(manga => <MangaCard key={manga.id} manga={manga} />)}
      </div>

      {/* Pagination */}
      {selectedTag && total > LIMIT && (
        <Pagination
          currentPage={currentPage}
          total={total}
          limit={LIMIT}
          onPageChange={handlePageChange}
          loading={mangaLoading}
        />
      )}
    </div>
  );
}
