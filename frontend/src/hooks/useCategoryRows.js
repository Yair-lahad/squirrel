import { fetchByCategory } from '../routes/analytics';
import { useAnalytics } from './useAnalytics';

export function useCategoryRows(transactions, metric) {
  return useAnalytics(
    () => fetchByCategory(transactions).then((byCategory) => [...byCategory].sort((a, b) => b[metric] - a[metric])),
    [transactions, metric]
  );
}
