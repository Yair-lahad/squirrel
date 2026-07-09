const express = require('express');
const advisor = require('../agents/advisor');

const router = express.Router();

router.post('/api/advisor/insights', (req, res) => {
  const { categories, transactions } = req.body || {};

  if (!Array.isArray(categories) || !categories.length || !Array.isArray(transactions)) {
    return res.status(400).json({ error: 'categories and transactions are required' });
  }

  res.json({ insights: advisor.getAdvice({ categories, transactions }) });
});

router.post('/api/advisor/ask', (req, res) => {
  const { categories, transactions, question } = req.body || {};

  if (!Array.isArray(categories) || !categories.length || !Array.isArray(transactions) || !question) {
    return res.status(400).json({ error: 'categories, transactions and question are required' });
  }

  res.json(advisor.answerQuestion({ categories, transactions, question }));
});

module.exports = router;
