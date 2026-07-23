import { parseJson } from './http';

export function uploadTransactions(transactions, label) {
  return fetch('/api/fetch/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions, label }),
  }).then(parseJson);
}
