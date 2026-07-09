import { parseJson } from './http';

export function fetchAdvisorMessages({ category, transactions }) {
  return fetch('/api/advisor/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, transactions }),
  }).then(parseJson);
}
