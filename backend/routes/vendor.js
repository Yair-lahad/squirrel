const express = require('express');
const vendorSource = require('../logic/sources/vendorSource');
const rulesStore = require('../logic/categorization/rulesStore');
const { applyRules } = require('../logic/categorization/applyRules');

const router = express.Router();

router.post('/api/fetch/vendor', async (req, res) => {
  const { id, password, card6Digits, startDate } = req.body || {};

  if (!id || !password || !card6Digits || !startDate) {
    return res.status(400).json({ error: 'id, password, card6Digits and startDate are required' });
  }

  try {
    const transactions = await vendorSource.fetchTransactions({ id, password, card6Digits, startDate });
    res.json(applyRules(transactions, rulesStore.listRules()));
  } catch (err) {
    res.status(502).json({ error: err.message || 'Fetch failed' });
  }
});

module.exports = router;
