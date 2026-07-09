const express = require('express');
const analytics = require('../logic/analytics/aggregations');

const router = express.Router();

function requireTransactions(req, res) {
  const { transactions } = req.body || {};
  if (!Array.isArray(transactions)) {
    res.status(400).json({ error: 'transactions array is required' });
    return null;
  }
  return transactions;
}

router.post('/api/analytics/totals', (req, res) => {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  res.json(analytics.totals(transactions));
});

router.post('/api/analytics/by-category', (req, res) => {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  res.json(analytics.byCategory(transactions));
});

router.post('/api/analytics/top-with-other', (req, res) => {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  const { metric = 'amount', limit = 7 } = req.body || {};
  res.json(analytics.topWithOther(analytics.byCategory(transactions), metric, limit));
});

router.post('/api/analytics/sort', (req, res) => {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  const { key = 'date', ascending = false } = req.body || {};
  res.json(analytics.sortTransactions(transactions, key, ascending));
});

router.post('/api/analytics/category-detail', (req, res) => {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  const { category } = req.body || {};
  if (!category) return res.status(400).json({ error: 'category is required' });
  res.json(analytics.categoryDetail(transactions, category));
});

module.exports = router;
