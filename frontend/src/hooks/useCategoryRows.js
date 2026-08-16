import { fetchByCategory } from '../routes/analytics';
import { useAnalytics } from './useAnalytics';

// by-category totals don't depend on metric, only the sort order does - so
// this re-sorts in place on a metric switch instead of re-fetching.
export function useCategoryRows(transactions, metric) {
  const byCategory = useAnalytics(() => fetchByCategory(transactions), [transactions]);
  return byCategory ? [...byCategory].sort((a, b) => b[metric] - a[metric]) : null;
}
