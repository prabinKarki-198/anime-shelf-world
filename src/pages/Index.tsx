import { useEffect, useCallback, memo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Flame, TrendingUp, Star, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPopular,
  fetchTrending,
  fetchTopRated,
  fetchNewReleases,
  setPage,
} from '@/store/mangaSlice';
import { MangaCard } from '@/components/MangaCard';
import { MangaCardSkeleton } from '@/components/MangaCardSkeleton';
import { ErrorState } from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import HeroCarousel from '@/components/HeroCarousel';
import type { MangaEntity } from '@/lib/types';

interface SectionProps {
  title: string;
  icon: ReactNode;
  mangas: MangaEntity[];
  loading: boolean;
  error: string | null;
  viewAllLink: string;
}

const MangaSection = memo(({ title, icon, mangas, loading, error, viewAllLink }: SectionProps) => (
  <section className="mb-12">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        {icon} {title}
      </h2>
      <Link
        to={viewAllLink}
        className="text-sm text-blue-600 hover:text-blue-500 dark:text-purple-400 dark:hover:text-purple-300 hover:underline transition-colors"
      >
        View All →
      </Link>
    </div>
    {error ? (
      <ErrorState message={error} />
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <MangaCardSkeleton key={i} />)
          : mangas.map((manga) => <MangaCard key={manga.id} manga={manga} />)}
      </div>
    )}
  </section>
));

MangaSection.displayName = 'MangaSection';

const Index = () => {
  const dispatch = useAppDispatch();
  const {
    popular,
    trending,
    topRated,
    newReleases,
    currentPage,
    total,
    limit,
    loading,
    error,
  } = useAppSelector((state) => state.manga);

  useEffect(() => {
    dispatch(fetchPopular(currentPage));
    dispatch(fetchTrending(currentPage));
    dispatch(fetchTopRated(currentPage));
    dispatch(fetchNewReleases(currentPage));
  }, [dispatch, currentPage]);

  const handlePageChange = useCallback(
    (page: number) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-black dark:via-gray-950 dark:to-black">
      {/* Hero Carousel */}
      <HeroCarousel mangas={popular} loading={loading} />

      {/* Manga Sections */}
      <div className="container mx-auto px-4 py-12">
        <MangaSection
          title="Popular"
          icon={<Flame className="w-6 h-6 text-orange-500" />}
          mangas={popular}
          loading={loading}
          error={error}
          viewAllLink="/search?sort=popular"
        />

        <MangaSection
          title="Trending"
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          mangas={trending}
          loading={loading}
          error={error}
          viewAllLink="/search?sort=trending"
        />

        <MangaSection
          title="Top Rated"
          icon={<Star className="w-6 h-6 text-yellow-500" />}
          mangas={topRated}
          loading={loading}
          error={error}
          viewAllLink="/search?sort=rating"
        />

        <MangaSection
          title="New Releases"
          icon={<Sparkles className="w-6 h-6 text-purple-500" />}
          mangas={newReleases}
          loading={loading}
          error={error}
          viewAllLink="/search?sort=new"
        />

        {/* Pagination */}
        {total > limit && (
          <Pagination
            currentPage={currentPage}
            total={total}
            limit={limit}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
