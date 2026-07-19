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

export function fetchCategories() {
  return fetch('/api/categories').then(parseJson);
}

export function renameCategory(id, name) {
  return fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  }).then(parseJson);
}

export function deleteCategory(id) {
  return fetch(`/api/categories/${id}`, { method: 'DELETE' }).then(async (res) => {
    if (res.ok) return;
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete category');
  });
}
