import React from 'react';

interface PaginationProps {
  currentPage: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = React.memo(({ currentPage, total, limit, onPageChange, loading }) => {
  const totalPages = Math.ceil(total / limit);
  
  // Show max 5 page buttons at a time
  const getVisiblePages = () => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page !== currentPage && !loading && page >= 1 && page <= totalPages) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center items-center gap-2 mt-8" aria-label="Pagination">
      <button
        className={`rounded-full px-4 py-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white transition-all border border-slate-200 dark:border-white/10 ${
          currentPage === 1 || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        aria-label="Previous page"
      >
        ← Prev
      </button>
      
      {getVisiblePages().map((page) => (
        <button
          key={page}
          className={`rounded-full w-10 h-10 text-sm font-medium transition-all ${
            page === currentPage
              ? 'bg-gradient-to-r from-blue-600 to-violet-600 dark:from-purple-600 dark:to-pink-600 text-white scale-110 shadow-lg shadow-blue-500/25 dark:shadow-purple-500/25'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white border border-slate-200 dark:border-white/10'
          }`}
          onClick={() => handlePageChange(page)}
          disabled={loading}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      
      <button
        className={`rounded-full px-4 py-2 text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white transition-all border border-slate-200 dark:border-white/10 ${
          currentPage === totalPages || loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;
