import { parseJson } from './http';

export function uploadTransactions(transactions, label) {
  return fetch('/api/fetch/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions, label }),
  }).then(parseJson);
}

export function uploadDocFile(file) {
  const body = new FormData();
  body.append('file', file);
  return fetch('/api/fetch/upload-doc', { method: 'POST', body }).then(parseJson);
}
