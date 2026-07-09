const express = require('express');
const path = require('path');
const vendorSource = require('./sources/vendorSource');
const mockSource = require('./sources/mockSource');
const fileSource = require('./sources/fileSource');
const advisor = require('./advisor/advisor');
const analytics = require('./analytics/aggregations');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

app.post('/api/fetch/vendor', async (req, res) => {
  const { id, password, card6Digits, startDate } = req.body || {};

  if (!id || !password || !card6Digits || !startDate) {
    return res.status(400).json({ error: 'id, password, card6Digits and startDate are required' });
  }

  try {
    const transactions = await vendorSource.fetchTransactions({ id, password, card6Digits, startDate });
    res.json(transactions);
  } catch (err) {
    res.status(502).json({ error: err.message || 'Fetch failed' });
  }
});

app.get('/api/fetch/mock', (req, res) => {
  res.json(mockSource.getTransactions());
});

app.get('/api/fetch/file', (req, res) => {
  res.json(fileSource.getTransactions());
});

app.post('/api/advisor/messages', (req, res) => {
  const { category, transactions } = req.body || {};

  if (!category || !Array.isArray(transactions)) {
    return res.status(400).json({ error: 'category and transactions are required' });
  }

  res.json({ messages: advisor.getAdvice({ category, transactions }) });
});

function requireTransactions(req, res) {
  const { transactions } = req.body || {};
  if (!Array.isArray(transactions)) {
    res.status(400).json({ error: 'transactions array is required' });
    return null;
  }
  return transactions;
}

app.post('/api/analytics/totals', (req, res) => {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  res.json(analytics.totals(transactions));
});

app.post('/api/analytics/by-category', (req, res) => {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  res.json(analytics.byCategory(transactions));
});

app.post('/api/analytics/top-with-other', (req, res) => {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  const { metric = 'amount', limit = 7 } = req.body || {};
  res.json(analytics.topWithOther(analytics.byCategory(transactions), metric, limit));
});

app.post('/api/analytics/sort', (req, res) => {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  const { key = 'date', ascending = false } = req.body || {};
  res.json(analytics.sortTransactions(transactions, key, ascending));
});

app.post('/api/analytics/category-detail', (req, res) => {
  const transactions = requireTransactions(req, res);
  if (!transactions) return;
  const { category } = req.body || {};
  if (!category) return res.status(400).json({ error: 'category is required' });
  res.json(analytics.categoryDetail(transactions, category));
});

// Client-side routing (no # in the URL) means the browser can request paths
// like /charts directly (e.g. on refresh) that don't exist as files — fall
// back to index.html so React Router-less client routing can handle them.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Squirrel running at http://localhost:${PORT}`);
});
