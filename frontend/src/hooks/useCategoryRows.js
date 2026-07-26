import { useMemo } from 'react';
import { fetchByCategory } from '../routes/analytics';
import { useAnalytics } from './useAnalytics';

// by-category totals don't depend on metric - only the sort order does -
// so metric switches re-sort in place instead of re-fetching, which would
// otherwise flash stale-order data while the request is in flight and
// visibly jump the chart layout.
export function useCategoryRows(transactions, metric) {
  const byCategory = useAnalytics(() => fetchByCategory(transactions), [transactions]);

  return useMemo(
    () => (byCategory ? [...byCategory].sort((a, b) => b[metric] - a[metric]) : null),
    [byCategory, metric]
  );
}
