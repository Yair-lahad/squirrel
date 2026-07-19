const fileSource = require('../logic/sources/fileSource');
const transactionService = require('../logic/transactions/transactionService');
const ruleService = require('../logic/categorization/ruleService');

async function fetchFile(req, res) {
  const stored = await transactionService.storeAndGetIds(fileSource.getTransactions(), 'file');
  res.json(await ruleService.applyRulesTo(stored));
}

module.exports = { fetchFile };
