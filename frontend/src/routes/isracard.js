import { parseJson } from './http';

export function fetchIsracard({ id, password, card6Digits, startDate }) {
  return fetch('/api/fetch/isracard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password, card6Digits, startDate }),
  }).then(parseJson);
}
