import { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchManga } from '@/hooks/useMangaDex';
import { MangaCard } from '@/components/MangaCard';
import { MangaCardSkeleton } from '@/components/MangaCardSkeleton';
import { ErrorState } from '@/components/ErrorState';
import Pagination from '@/components/Pagination';

const LIMIT = 20;

export default function SearchPage() {
  const [input, setInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(input.trim());
      setCurrentPage(1); // Reset to page 1 when query changes
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const { data, isLoading, isError, refetch } = useSearchManga(debouncedQuery, currentPage, LIMIT);
  const total = data?.total || 0;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6">Search Manga</h1>

      <div className="relative mb-8 max-w-xl">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {isError && <ErrorState message="Search failed" onRetry={() => refetch()} />}

      {debouncedQuery && !isLoading && data?.data?.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No results found for "{debouncedQuery}"</p>
      )}

      {!debouncedQuery && (
        <p className="text-center text-muted-foreground py-12">Type something to search for manga...</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading && Array.from({ length: 10 }).map((_, i) => <MangaCardSkeleton key={i} />)}
        {data?.data?.map(manga => <MangaCard key={manga.id} manga={manga} />)}
      </div>

      {/* Pagination */}
      {debouncedQuery && total > LIMIT && (
        <Pagination
          currentPage={currentPage}
          total={total}
          limit={LIMIT}
          onPageChange={handlePageChange}
          loading={isLoading}
        />
      )}
    </div>
  );
}
