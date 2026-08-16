// Client-side mirror of backend/core/analytics/aggregations.js's categoryDetail -
// a plain filter/reduce over data already in memory, not worth a round trip.
export function categoryDetail(transactions, categories) {
  const items = transactions.filter((t) => categories.includes(t.category));
  const spend = items.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  return { items, spend, count: items.length };
}
