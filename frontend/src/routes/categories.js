import { parseJson } from './http';

export function fetchRules() {
  return fetch('/api/categories/rules').then(parseJson);
}

export function createRule(rule) {
  return fetch('/api/categories/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  }).then(parseJson);
}

export function deleteRule(id) {
  return fetch(`/api/categories/rules/${id}`, { method: 'DELETE' }).then((res) => {
    if (!res.ok) throw new Error('Failed to delete rule');
  });
}

export function applyCategoryRules(transactions) {
  return fetch('/api/categories/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions }),
  }).then(parseJson);
}
