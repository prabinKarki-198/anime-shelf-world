import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites();

  useEffect(() => {
    document.title = 'My Library - Manga Verse';
    return () => {
      document.title = 'Manga Verse';
    };
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Login Required</h1>
        <p className="text-muted-foreground mb-6">Please login to view your library.</p>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Heart className="h-8 w-8" /> My Library
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Your Library is Empty</h1>
        <p className="text-muted-foreground mb-6">
          Start adding manga to your library by clicking the heart icon on any manga page.
        </p>
        <Link to="/">
          <Button>Browse Manga</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Heart className="h-8 w-8 text-red-500" /> My Library
        <span className="text-lg font-normal text-muted-foreground">
          ({favorites.length} manga)
        </span>
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {favorites.map((favorite) => (
          <Card
            key={favorite.id}
            className="group overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link to={`/manga/${favorite.manga_id}`}>
              <div className="relative aspect-[3/4] overflow-hidden">
                <ImageWithFallback
                  src={favorite.cover_url || '/placeholder.svg'}
                  alt={favorite.manga_title || 'Manga'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFavorite(favorite.manga_id);
                  }}
                  className="absolute top-2 right-2 p-1 transition-all duration-200 hover:scale-110"
                >
                  <Heart className="h-5 w-5 text-red-500 fill-red-500 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] hover:scale-110 transition-transform" />
                </button>
              </div>
            </Link>
            <CardContent className="p-3">
              <Link to={`/manga/${favorite.manga_id}`}>
                <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                  {favorite.manga_title || 'Unknown Title'}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                Added {new Date(favorite.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
