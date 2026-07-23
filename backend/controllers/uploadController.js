const transactionService = require('../logic/transactions/transactionService');
const ruleService = require('../logic/categorization/ruleService');

async function fetchUpload(req, res) {
  const { transactions, label } = req.body || {};
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'transactions array is required' });
  }
  const stored = await transactionService.storeAndGetIds(transactions, 'upload', label);
  res.json(await ruleService.applyRulesTo(stored));
}

module.exports = { fetchUpload };
