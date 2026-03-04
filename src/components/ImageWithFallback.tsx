import { useState, useEffect, memo } from 'react';
import { RefreshCw, ImageOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onRetry?: () => void;
}

export const ImageWithFallback = memo(function ImageWithFallback({ src, alt, className = '', onRetry }: ImageWithFallbackProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [retrySrc, setRetrySrc] = useState(src);

  // Reset state when src changes
  useEffect(() => {
    setStatus('loading');
    setRetrySrc(src);
  }, [src]);

  const handleRetry = () => {
    setStatus('loading');
    setRetrySrc(`${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`);
    onRetry?.();
  };

  return (
    <div className="relative w-full h-full">
      {status === 'loading' && (
        <Skeleton className="absolute inset-0 rounded-lg" />
      )}
      {status === 'error' ? (
        <div className="flex flex-col items-center justify-center gap-2 bg-muted rounded-lg w-full h-full min-h-[200px]">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
          <button onClick={handleRetry} className="flex items-center gap-1 text-sm text-primary hover:underline">
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      ) : (
        <img
          src={retrySrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`${className} ${status === 'loading' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
});
