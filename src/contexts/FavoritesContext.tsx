import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Favorite {
  id: string;
  user_id: string;
  manga_id: string;
  manga_title: string | null;
  cover_url: string | null;
  created_at: string;
}

interface FavoritesContextType {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  isFavorited: (mangaId: string) => boolean;
  addFavorite: (mangaId: string, mangaTitle: string, coverUrl: string) => Promise<{ data?: Favorite; error?: Error | null }>;
  removeFavorite: (mangaId: string) => Promise<{ error: Error | null }>;
  toggleFavorite: (mangaId: string, mangaTitle: string, coverUrl: string) => Promise<{ data?: Favorite; error?: Error | null }>;
  refetch: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch all favorites - only once per user session
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setHasFetched(false);
      return;
    }

    // Skip if already fetched for this user
    if (hasFetched) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setFavorites((data as Favorite[]) || []);
    }
    setLoading(false);
    setHasFetched(true);
  }, [user, hasFetched]);

  // Force refetch
  const refetch = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setFavorites((data as Favorite[]) || []);
    }
    setLoading(false);
  }, [user]);

  // Check if a manga is favorited - O(1) lookup with Set
  const favoritedIds = useMemo(() => new Set(favorites.map(f => f.manga_id)), [favorites]);
  const isFavorited = useCallback(
    (mangaId: string) => favoritedIds.has(mangaId),
    [favoritedIds]
  );

  // Add to favorites with optimistic update
  const addFavorite = useCallback(
    async (mangaId: string, mangaTitle: string, coverUrl: string) => {
      if (!user) {
        return { error: new Error('Must be logged in to add favorites') };
      }

      // Optimistic update
      const optimisticFavorite: Favorite = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        manga_id: mangaId,
        manga_title: mangaTitle,
        cover_url: coverUrl,
        created_at: new Date().toISOString(),
      };
      setFavorites((prev) => [optimisticFavorite, ...prev]);

      const { data, error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          manga_id: mangaId,
          manga_title: mangaTitle,
          cover_url: coverUrl,
        })
        .select()
        .single();

      if (insertError) {
        // Rollback optimistic update
        setFavorites((prev) => prev.filter((fav) => fav.id !== optimisticFavorite.id));
        return { error: insertError };
      }

      // Replace optimistic with real data
      setFavorites((prev) => 
        prev.map((fav) => fav.id === optimisticFavorite.id ? (data as Favorite) : fav)
      );
      return { data: data as Favorite };
    },
    [user]
  );

  // Remove from favorites with optimistic update
  const removeFavorite = useCallback(
    async (mangaId: string) => {
      if (!user) {
        return { error: new Error('Must be logged in to remove favorites') };
      }

      // Store for potential rollback
      const removedFavorite = favorites.find((fav) => fav.manga_id === mangaId);
      
      // Optimistic update
      setFavorites((prev) => prev.filter((fav) => fav.manga_id !== mangaId));

      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('manga_id', mangaId)
        .eq('user_id', user.id);

      if (deleteError) {
        // Rollback optimistic update
        if (removedFavorite) {
          setFavorites((prev) => [removedFavorite, ...prev]);
        }
        return { error: deleteError };
      }

      return { error: null };
    },
    [user, favorites]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (mangaId: string, mangaTitle: string, coverUrl: string) => {
      if (isFavorited(mangaId)) {
        return removeFavorite(mangaId);
      } else {
        return addFavorite(mangaId, mangaTitle, coverUrl);
      }
    },
    [isFavorited, addFavorite, removeFavorite]
  );

  // Fetch favorites on mount and when user changes
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Reset hasFetched when user changes
  useEffect(() => {
    setHasFetched(false);
  }, [user?.id]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        error,
        isFavorited,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        refetch,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
