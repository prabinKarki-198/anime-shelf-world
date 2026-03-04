import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Heart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useMangaDetail, useChapterFeed } from "@/hooks/useMangaDex";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { getCoverUrl, getTitle, getDescription } from "@/lib/mangadex";
import { fetchSimilarManga } from "@/lib/mangaApi";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { ErrorState } from "@/components/ErrorState";
import { MangaCard } from "@/components/MangaCard";
import { MangaCardSkeleton } from "@/components/MangaCardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import type { MangaEntity } from "@/lib/types";

const CHAPTERS_PER_PAGE = 100;

export default function MangaDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  const {
    data: mangaRes,
    isLoading,
    isError,
    refetch,
  } = useMangaDetail(id || "");

  // Chapter pagination state
  const [chapterPage, setChapterPage] = useState(1);
  const {
    data: chaptersRes,
    isLoading: chaptersLoading,
    isError: chaptersError,
    refetch: refetchChapters,
  } = useChapterFeed(id || "", chapterPage, CHAPTERS_PER_PAGE);

  // Recommendations state
  const [recommendations, setRecommendations] = useState<MangaEntity[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState<string | null>(null);

  // Update page title when manga is loaded
  useEffect(() => {
    if (mangaRes?.data) {
      const mangaTitle = getTitle(mangaRes.data.attributes.title);
      document.title = `${mangaTitle} - Manga Verse`;
    }
    return () => {
      document.title = "Manga Verse";
    };
  }, [mangaRes]);

  // Fetch similar manga when manga details are loaded
  useEffect(() => {
    if (mangaRes?.data) {
      const tagIds = mangaRes.data.attributes.tags
        .map((tag) => tag.id)
        .slice(0, 5);
      if (tagIds.length > 0) {
        setRecLoading(true);
        setRecError(null);
        fetchSimilarManga(tagIds)
          .then((res) => {
            // Filter out current manga from recommendations
            setRecommendations(res.data.filter((m) => m.id !== id));
            setRecLoading(false);
          })
          .catch((err) => {
            setRecError(err.message || "Failed to load recommendations");
            setRecLoading(false);
          });
      }
    }
  }, [mangaRes, id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-72 aspect-[3/4] rounded-2xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !mangaRes?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState
          message="Failed to load manga details"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const manga = mangaRes.data;
  const enAltTitle = manga.attributes.altTitles?.find(
    (titleObj) => titleObj.en,
  )?.en;

  const title = enAltTitle || getTitle(manga.attributes.title);
  const desc = getDescription(manga.attributes.description);
  const coverRel = manga.relationships.find((r) => r.type === "cover_art");
  const coverFile = coverRel?.attributes?.fileName as string | undefined;
  const coverUrl = coverFile
    ? getCoverUrl(manga.id, coverFile)
    : "/placeholder.svg";
  const author = manga.relationships.find((r) => r.type === "author");
  const authorName = author?.attributes?.name as string | undefined;
  const chapters = chaptersRes?.data || [];
  const totalChapters = chaptersRes?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalChapters / CHAPTERS_PER_PAGE));

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-72 shrink-0">
          <ImageWithFallback
            src={coverUrl}
            alt={title}
            className="w-full rounded-2xl shadow-lg"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {authorName && (
            <p className="text-muted-foreground mt-1">by {authorName}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="capitalize">
              {manga.attributes.status}
            </Badge>
            {manga.attributes.contentRating && (
              <Badge variant="secondary" className="capitalize">
                {manga.attributes.contentRating}
              </Badge>
            )}
            {manga.attributes.year && (
              <Badge variant="secondary">{manga.attributes.year}</Badge>
            )}
          </div>

          {/* Favorite Button */}
          <div className="mt-4">
            <Button
              variant={isFavorited(id || '') ? 'default' : 'outline'}
              size="sm"
              disabled={favoriteLoading}
              onClick={async () => {
                if (!user) {
                  toast({
                    variant: 'warning',
                    title: 'Login Required',
                    description: 'Please login to add favorites.',
                  });
                  return;
                }
                setFavoriteLoading(true);
                const { error } = await toggleFavorite(id || '', title, coverUrl);
                if (error) {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error.message,
                  });
                } else {
                  toast({
                    variant: 'success',
                    title: isFavorited(id || '') ? 'Removed from favorites' : 'Added to favorites',
                    description: isFavorited(id || '') ? `${title} removed from your library` : `${title} added to your library`,
                  });
                }
                setFavoriteLoading(false);
              }}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${isFavorited(id || '') ? 'fill-current' : ''}`} />
              {isFavorited(id || '') ? 'In Library' : 'Add to Library'}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {manga.attributes.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground"
              >
                {getTitle(tag.attributes.name)}
              </span>
            ))}
          </div>

          {desc && (
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {desc}
            </p>
          )}
        </div>
      </div>

      {/* Chapters */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Chapters{" "}
            {totalChapters > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalChapters} total)
              </span>
            )}
          </h2>
          {(totalPages > 1 || totalChapters > CHAPTERS_PER_PAGE) && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChapterPage((p) => Math.max(1, p - 1))}
                disabled={chapterPage === 1 || chaptersLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {chapterPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setChapterPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={chapterPage === totalPages || chaptersLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {chaptersError && (
          <ErrorState
            message="Failed to load chapters"
            onRetry={() => refetchChapters()}
          />
        )}

        {chaptersLoading && (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        )}

        {chapters.length === 0 && !chaptersLoading && !chaptersError && (
          <p className="text-muted-foreground">
            No English chapters available.
          </p>
        )}

        <ScrollArea className={`${chapters.length === 0 && !chaptersLoading && !chaptersError ? 'h-0 border-0' : 'h-80 border'}  rounded-lg`}>
          <div className="space-y-1 p-2">
            {chapters.map((ch) => (
              <Link
                key={ch.id}
                to={`/read/${ch.id}`}
                className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-primary">
                  {ch.attributes.chapter
                    ? `Ch. ${ch.attributes.chapter}`
                    : "Oneshot"}
                  {ch.attributes.title && ` — ${ch.attributes.title}`}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(ch.attributes.publishAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </section>

      {/* More Like This - Recommendations */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-yellow-500" /> More Like This
        </h2>
        {recError ? (
          <ErrorState message={recError} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <MangaCardSkeleton key={i} />
                ))
              : recommendations.length > 0
                ? recommendations.map((rec) => (
                    <MangaCard key={rec.id} manga={rec} />
                  ))
                : !recLoading && (
                    <p className="text-muted-foreground col-span-full">
                      No recommendations found.
                    </p>
                  )}
          </div>
        )}
      </section>
    </div>
  );
}
