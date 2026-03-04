import { Skeleton } from '@/components/ui/skeleton';

export function MangaCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-900/50 border border-slate-200/50 dark:border-white/5">
      <Skeleton className="aspect-[3/4] w-full bg-slate-200 dark:bg-gray-800" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-slate-200 dark:bg-gray-800" />
        <Skeleton className="h-3 w-1/2 bg-slate-200 dark:bg-gray-800" />
        <Skeleton className="h-5 w-16 rounded-full bg-slate-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}
