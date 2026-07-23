const mockSource = require('../logic/sources/mockSource');
const transactionService = require('../logic/transactions/transactionService');
const ruleService = require('../logic/categorization/ruleService');

async function fetchMock(req, res) {
  const stored = await transactionService.storeAndGetIds(mockSource.getTransactions(), 'mock', 'Mock data');
  res.json(await ruleService.applyRulesTo(stored));
}

module.exports = { fetchMock };
