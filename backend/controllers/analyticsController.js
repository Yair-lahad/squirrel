const analytics = require('../logic/analytics/aggregations');

function requireTransactions(req, res) {
  const { transactions } = req.body || {};
  if (!Array.isArray(transactions)) {
    res.status(400).json({ error: 'transactions array is required' });
    return null;
  }
  return transactions;
}

function totals(req, res) {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  res.json(analytics.totals(transactions));
}

function byCategory(req, res) {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  res.json(analytics.byCategory(transactions));
}

function sort(req, res) {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  const { key = 'date', ascending = false } = req.body || {};
  res.json(analytics.sortTransactions(transactions, key, ascending));
}

function categoryDetail(req, res) {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  const { categories } = req.body || {};
  if (!Array.isArray(categories) || !categories.length) {
    return res.status(400).json({ error: 'categories array is required' });
  }
  res.json(analytics.categoryDetail(transactions, categories));
}

module.exports = { totals, byCategory, sort, categoryDetail };
