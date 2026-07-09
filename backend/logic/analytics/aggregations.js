function totals(transactions) {
  const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spend = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  return { income, spend, net: income + spend };
}

function byCategory(transactions) {
  const byCat = {};
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    const entry = byCat[t.category] || { category: t.category, amount: 0, count: 0 };
    entry.amount += Math.abs(t.amount);
    entry.count += 1;
    byCat[t.category] = entry;
  }
  return Object.values(byCat).sort((a, b) => b.amount - a.amount);
}

// Folds everything past the top `limit` entries (by `key`) into a single
// "Other" bucket — a pie only reads cleanly with a handful of slices, and
// the fixed categorical palette only has so many distinguishable hues.
function topWithOther(rows, key, limit = 7) {
  const sorted = [...rows].sort((a, b) => b[key] - a[key]);
  if (sorted.length <= limit) return sorted;

  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit);
  const other = rest.reduce(
    (acc, r) => ({ category: 'Other', amount: acc.amount + r.amount, count: acc.count + r.count }),
    { category: 'Other', amount: 0, count: 0 }
  );
  return [...top, other];
}

function sortTransactions(transactions, key, ascending) {
  const dir = ascending ? 1 : -1;
  return [...transactions].sort((a, b) => {
    if (a[key] < b[key]) return -1 * dir;
    if (a[key] > b[key]) return 1 * dir;
    return 0;
  });
}

function categoryDetail(transactions, category) {
  const items = transactions.filter((t) => t.category === category);
  const spend = items.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  return { items, spend, count: items.length };
}

module.exports = { totals, byCategory, topWithOther, sortTransactions, categoryDetail };
