const express = require('express');
const path = require('path');
const isracardSource = require('./sources/isracardSource');
const mockSource = require('./sources/mockSource');
const fileSource = require('./sources/fileSource');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

app.post('/api/fetch/isracard', async (req, res) => {
  const { id, password, card6Digits, startDate } = req.body || {};

  if (!id || !password || !card6Digits || !startDate) {
    return res.status(400).json({ error: 'id, password, card6Digits and startDate are required' });
  }

  try {
    const transactions = await isracardSource.fetchTransactions({ id, password, card6Digits, startDate });
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
