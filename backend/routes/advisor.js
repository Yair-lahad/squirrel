const express = require('express');
const advisor = require('../agents/advisor');

const router = express.Router();

router.post('/api/advisor/messages', (req, res) => {
  const { category, transactions } = req.body || {};

  if (!category || !Array.isArray(transactions)) {
    return res.status(400).json({ error: 'category and transactions are required' });
  }

  res.json({ messages: advisor.getAdvice({ category, transactions }) });
});

module.exports = router;
