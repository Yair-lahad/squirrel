import { parseJson } from './http';

export function fetchAdvisorInsights({ categories, transactions }) {
  return fetch('/api/advisor/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categories, transactions }),
  }).then(parseJson);
}

export function fetchAdvisorAnswer({ categories, transactions, question }) {
  return fetch('/api/advisor/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ categories, transactions, question }),
  }).then(parseJson);
}
