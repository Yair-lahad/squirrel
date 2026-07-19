const advisor = require('../agents/advisor');

function insights(req, res) {
  const { categories, transactions } = req.body || {};

  if (!Array.isArray(categories) || !categories.length || !Array.isArray(transactions)) {
    return res.status(400).json({ error: 'categories and transactions are required' });
  }

  res.json({ insights: advisor.getAdvice({ categories, transactions }) });
}

function ask(req, res) {
  const { categories, transactions, question } = req.body || {};

  if (!Array.isArray(categories) || !categories.length || !Array.isArray(transactions) || !question) {
    return res.status(400).json({ error: 'categories, transactions and question are required' });
  }

  res.json(advisor.answerQuestion({ categories, transactions, question }));
}

module.exports = { insights, ask };
