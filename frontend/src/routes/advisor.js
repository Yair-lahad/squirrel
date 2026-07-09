import { parseJson } from './http';

export function fetchAdvisorInsights({ category, transactions }) {
  return fetch('/api/advisor/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, transactions }),
  }).then(parseJson);
}

export function fetchAdvisorAnswer({ category, transactions, question }) {
  return fetch('/api/advisor/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, transactions, question }),
  }).then(parseJson);
}
