import { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCoverUrl, getTitle, getDescription } from '@/lib/mangadex';
import type { MangaEntity } from '@/lib/types';

interface HeroCarouselProps {
  mangas: MangaEntity[];
  loading?: boolean;
}

const HeroCarousel = memo(({ mangas, loading }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance carousel
  useEffect(() => {
    if (mangas.length === 0) return;
    const maxItems = Math.min(mangas.length, 8);
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % maxItems);
      setTimeout(() => setIsTransitioning(false), 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [mangas.length]);

  const handleNext = useCallback(() => {
    if (isTransitioning || mangas.length === 0) return;
    const maxItems = Math.min(mangas.length, 8);
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % maxItems);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, mangas.length]);

  const handlePrev = useCallback(() => {
    if (isTransitioning || mangas.length === 0) return;
    const maxItems = Math.min(mangas.length, 8);
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + maxItems) % maxItems);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, mangas.length]);

  const handleThumbnailClick = useCallback((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, currentIndex]);

  if (loading || mangas.length === 0) {
    return (
      <div className="relative h-[80vh] min-h-[500px] max-h-[800px] bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:from-black dark:via-purple-950/50 dark:to-black animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-black dark:to-transparent" />
      </div>
    );
  }

  const currentManga = mangas[currentIndex];
  const coverRel = currentManga?.relationships?.find(r => r.type === 'cover_art');
  const coverFile = coverRel?.attributes?.fileName as string | undefined;
  const coverUrl = coverFile ? getCoverUrl(currentManga.id, coverFile, '512') : '';
  const title = getTitle(currentManga?.attributes?.title);
  const description = getDescription(currentManga?.attributes?.description);
  const tags = currentManga?.attributes?.tags?.slice(0, 4) || [];

  return (
    <section className="relative h-[80vh] min-h-[500px] max-h-[800px] overflow-hidden bg-slate-100 dark:bg-black">
      {/* Background Images with Transition */}
      {mangas.slice(0, 8).map((manga, index) => {
        const rel = manga.relationships?.find(r => r.type === 'cover_art');
        const file = rel?.attributes?.fileName as string | undefined;
        const url = file ? getCoverUrl(manga.id, file, '512') : '';

        
        return (
          <div
            key={manga.id}

            className={`absolute inset-y-0 right-0 w-[60%] transition-all duration-700 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-100'
            }`}
          >
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover object-right-top"
              loading={index < 3 ? 'eager' : 'lazy'}
            />
            {/* Left edge fade gradient */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-100 dark:from-black to-transparent" />
          </div>
        );
      })}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent dark:from-black dark:via-black/70 dark:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-black dark:via-transparent dark:to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent dark:from-purple-900/20 dark:via-transparent dark:to-pink-900/10" />

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
        <div className="md:ml-5 ml-0 max-w-2xl">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-md bg-white/70 dark:bg-black/30 rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-white/10 shadow-2xl shadow-slate-300/50 dark:shadow-black/50">
            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30 backdrop-blur-sm"
                >
                  {getTitle(tag.attributes.name)}
                </span>
              ))}
              {currentManga?.attributes?.contentRating && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-violet-500/10 text-violet-600 border border-violet-500/20 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30 backdrop-blur-sm uppercase">
                  {currentManga.attributes.contentRating}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl text-nowrap text-ellipsis font-black text-slate-900 dark:text-white leading-tight mb-4 drop-shadow-sm dark:drop-shadow-lg">
              {title.length > 20 ? `${title.slice(0, 20)}...` : title}
            </h1>

            {/* Description */}
            <p className="text-sm md:text-base text-slate-600 dark:text-gray-300 line-clamp-2 mb-6 leading-relaxed">
              {description || 'Dive into an amazing manga adventure. Start reading now!'}
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/manga/${currentManga.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-500 dark:hover:to-pink-500 text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 dark:shadow-purple-500/25 dark:hover:shadow-purple-500/40 hover:scale-105"
              >
                <Play className="h-5 w-5 fill-current" />
                Read Now
              </Link>
              <button
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900/10 hover:bg-slate-900/20 text-slate-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white font-semibold rounded-full backdrop-blur-sm border border-slate-900/20 dark:border-white/20 transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                Add to Library
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 hover:bg-white/70 text-slate-700 hover:text-slate-900 dark:bg-black/50 dark:hover:bg-black/70 dark:text-white/70 dark:hover:text-white transition-all duration-300 backdrop-blur-sm border border-slate-200/50 dark:border-white/10 hidden md:flex"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 hover:bg-white/70 text-slate-700 hover:text-slate-900 dark:bg-black/50 dark:hover:bg-black/70 dark:text-white/70 dark:hover:text-white transition-all duration-300 backdrop-blur-sm border border-slate-200/50 dark:border-white/10 hidden md:flex"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom Thumbnail Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-md bg-white/60 dark:bg-black/40 border border-slate-200/50 dark:border-white/10">
        {mangas.slice(0, 8).map((manga, index) => {
          const rel = manga.relationships?.find(r => r.type === 'cover_art');
          const file = rel?.attributes?.fileName as string | undefined;
          const thumbUrl = file ? getCoverUrl(manga.id, file, '256') : '';
          
          return (
            <button
              key={manga.id}
              onClick={() => handleThumbnailClick(index)}
              className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
                index === currentIndex
                  ? 'ring-2 ring-blue-500 dark:ring-purple-500 ring-offset-2 ring-offset-white/50 dark:ring-offset-black/50 scale-110'
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              <img
                src={thumbUrl}
                alt=""
                className="w-12 h-16 md:w-14 md:h-20 object-cover"
                loading="lazy"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-500/20 dark:bg-purple-500/20" />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/50 dark:bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 dark:from-purple-500 dark:to-pink-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / Math.min(mangas.length, 8)) * 100}%` }}
        />
      </div>
    </section>
  );
});

HeroCarousel.displayName = 'HeroCarousel';

export default HeroCarousel;
