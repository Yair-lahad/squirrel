import { useEffect, useState } from 'react';

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 'All'];

// Shared paging logic for any table — slices `items` into pages and resets
// back to page 1 whenever the underlying list (a new sort, a different
// upload, etc.) or the page size changes, so you can't get stranded on a
// page index that no longer has any rows.
export function usePagination(items, initialPageSize = 100) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [items, pageSize]);

  const pageCount = items && pageSize !== 'All' ? Math.max(1, Math.ceil(items.length / pageSize)) : 1;
  const currentPage = Math.min(page, pageCount - 1);
  const pageStart = items && pageSize !== 'All' ? currentPage * pageSize : 0;
  const paginated = items && pageSize !== 'All' ? items.slice(pageStart, pageStart + pageSize) : items;

  return { pageSize, setPageSize, page: currentPage, setPage, pageCount, pageStart, paginated };
}
