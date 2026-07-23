import { parseJson } from './http';

export function fetchTransactions({ all = false, uploadId } = {}) {
  const params = new URLSearchParams();
  if (all) params.set('all', 'true');
  if (uploadId) params.set('uploadId', uploadId);
  const query = params.toString();
  return fetch(`/api/transactions${query ? `?${query}` : ''}`).then(parseJson);
}

export function fetchUploads() {
  return fetch('/api/transactions/uploads').then(parseJson);
}
