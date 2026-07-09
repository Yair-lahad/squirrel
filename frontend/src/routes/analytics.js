import { parseJson } from './http';

function post(path, body) {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(parseJson);
}

export function fetchTotals(transactions) {
  return post('/api/analytics/totals', { transactions });
}

export function fetchByCategory(transactions) {
  return post('/api/analytics/by-category', { transactions });
}

export function fetchSortedTransactions(transactions, key, ascending) {
  return post('/api/analytics/sort', { transactions, key, ascending });
}

export function fetchCategoryDetail(transactions, categories) {
  return post('/api/analytics/category-detail', { transactions, categories });
}
