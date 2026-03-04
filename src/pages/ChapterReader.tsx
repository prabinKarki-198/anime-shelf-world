import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useChapterPages, useChapterDetail, useChapterFeed } from '@/hooks/useMangaDex';
import { ErrorState } from '@/components/ErrorState';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function ChapterReader() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useChapterPages(chapterId || '');
  const { data: chapterDetail } = useChapterDetail(chapterId || '');
  
  // Get manga ID from chapter relationships
  const mangaId = chapterDetail?.data?.relationships?.find(r => r.type === 'manga')?.id || '';
  
  // Fetch all chapters for the manga to enable navigation
  const { data: chaptersRes } = useChapterFeed(mangaId, 1, 500);
  
  const [preloaded, setPreloaded] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort chapters and find prev/next
  const { prevChapter, nextChapter, currentChapterNum } = useMemo(() => {
    if (!chaptersRes?.data || !chapterId) {
      return { prevChapter: null, nextChapter: null, currentChapterNum: null };
    }
    
    // Sort chapters by chapter number (ascending)
    const sortedChapters = [...chaptersRes.data].sort((a, b) => {
      const aNum = parseFloat(a.attributes.chapter || '0');
      const bNum = parseFloat(b.attributes.chapter || '0');
      return aNum - bNum;
    });
    
    const currentIndex = sortedChapters.findIndex(ch => ch.id === chapterId);
    const current = sortedChapters[currentIndex];
    
    return {
      prevChapter: currentIndex > 0 ? sortedChapters[currentIndex - 1] : null,
      nextChapter: currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null,
      currentChapterNum: current?.attributes?.chapter || 'Oneshot',
    };
  }, [chaptersRes, chapterId]);

  // Construct full-quality image URLs
  const pages = useMemo(() => {
    return data
      ? data.chapter.data.map(filename => `${data.baseUrl}/data/${data.chapter.hash}/${filename}`)
      : [];
  }, [data]);

  // Preload next 3 images
  const preloadAhead = useCallback((currentIndex: number) => {
    for (let i = currentIndex + 1; i <= Math.min(currentIndex + 3, pages.length - 1); i++) {
      if (!preloaded.has(i)) {
        const img = new Image();
        img.src = pages[i];
        setPreloaded(prev => new Set(prev).add(i));
      }
    }
  }, [pages, preloaded]);

  // Keyboard navigation (placeholder for prev/next chapter)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  // Intersection Observer for preloading
  useEffect(() => {
    if (!containerRef.current || pages.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) preloadAhead(index);
          }
        });
      },
      { rootMargin: '200px' }
    );

    const images = containerRef.current.querySelectorAll('[data-index]');
    images.forEach(img => observer.observe(img));

    return () => observer.disconnect();
  }, [pages, preloadAhead]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-3xl px-4 py-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-[2/3] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ErrorState message="Failed to load chapter pages" onRetry={() => refetch()} />
      </div>
    );
  }

  if (!data || pages.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Chapter Not Available</h2>
          <p className="text-muted-foreground">This chapter has no pages or is not available for reading.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border">
        <div className="container mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentChapterNum && `Ch. ${currentChapterNum} • `}{pages.length} pages
          </span>
        </div>
      </div>

      {/* Pages */}
      <div ref={containerRef} className="container mx-auto max-w-3xl px-0 md:px-4 py-4 space-y-1">
        {pages.map((url, i) => (
          <div key={i} data-index={i} className="w-full">
            <ImageWithFallback
              src={url}
              alt={`Page ${i + 1}`}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="container mx-auto max-w-3xl flex items-center justify-between px-4 py-6">
        <Button 
          variant="outline" 
          onClick={() => prevChapter && navigate(`/read/${prevChapter.id}`)}
          disabled={!prevChapter}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" /> 
          {prevChapter ? `Ch. ${prevChapter.attributes.chapter || 'Prev'}` : 'Previous'}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => nextChapter && navigate(`/read/${nextChapter.id}`)}
          disabled={!nextChapter}
          className="gap-1"
        >
          {nextChapter ? `Ch. ${nextChapter.attributes.chapter || 'Next'}` : 'Next'} 
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
