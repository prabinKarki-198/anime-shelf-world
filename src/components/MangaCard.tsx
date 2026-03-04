import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getCoverUrl, getTitle } from '@/lib/mangadex';
import { ImageWithFallback } from './ImageWithFallback';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { MangaEntity } from '@/lib/types';

interface MangaCardProps {
  manga: MangaEntity;
}

export function MangaCard({ manga }: MangaCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const enAltTitle = manga.attributes.altTitles?.find(
    (titleObj) => titleObj.en
  )?.en;

  const title = enAltTitle || getTitle(manga.attributes.title);
  const coverRel = manga.relationships.find(r => r.type === 'cover_art');
  const coverFile = coverRel?.attributes?.fileName as string | undefined;
  // Use 256px thumbnail for faster loading
  const coverUrl = coverFile ? getCoverUrl(manga.id, coverFile, '256') : '/placeholder.svg';
  const author = manga.relationships.find(r => r.type === 'author');
  const authorName = author?.attributes?.name as string | undefined;
  const favorited = isFavorited(manga.id);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        variant: 'warning',
        title: 'Login Required',
        description: 'Please login to add favorites.',
      });
      return;
    }
    
    setFavoriteLoading(true);
    const { error } = await toggleFavorite(manga.id, title, coverUrl);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } else {
      toast({
        variant: 'success',
        title: favorited ? 'Removed from library' : 'Added to library',
        description: favorited ? `${title} removed` : `${title} added`,
      });
    }
    setFavoriteLoading(false);
  };

  return (
    <Link
      to={`/manga/${manga.id}`}
      className="group block rounded-xl overflow-hidden bg-white dark:bg-gray-900/50 border border-slate-200/50 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-blue-500/10 dark:hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 dark:hover:border-purple-500/30"
    >
      <div className="aspect-[3/4] overflow-hidden relative">
        <ImageWithFallback
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          disabled={favoriteLoading}
          className="absolute top-2 right-2 p-1 transition-all duration-200 hover:scale-110"
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            className={`h-5 w-5 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] transition-all duration-200 ${
              favorited 
                ? 'text-red-500 fill-red-500' 
                : 'text-white/80 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:fill-red-500/50'
            }`} 
          />
        </button>
      </div>
      <div className="p-3 h-full bg-gradient-to-t from-slate-50 to-transparent dark:from-gray-900 dark:to-transparent">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="font-semibold text-nowrap text-ellipsis text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight overflow-hidden">{title}</h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>{title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {authorName && (
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 truncate">{authorName}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:bg-purple-500/20 dark:text-purple-300 capitalize border border-blue-500/20 dark:border-purple-500/30">
            {manga.attributes.status || 'Unknown'}
          </span>
        </div>
      </div>
    </Link>
  );
}
