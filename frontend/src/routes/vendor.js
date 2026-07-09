import { parseJson } from './http';

export function fetchVendor({ id, password, card6Digits, startDate }) {
  return fetch('/api/fetch/vendor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password, card6Digits, startDate }),
  }).then(parseJson);
}
