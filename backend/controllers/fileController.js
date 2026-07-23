const fileSource = require('../logic/sources/fileSource');
const transactionService = require('../logic/transactions/transactionService');
const ruleService = require('../logic/categorization/ruleService');

async function fetchFile(req, res) {
  const existing = await transactionService.findUploadBySource('file');
  const stored = existing
    ? await transactionService.getTransactions({ uploadId: existing.id })
    : await transactionService.storeAndGetIds(fileSource.getTransactions(), 'file', 'Sample file');
  res.json(await ruleService.applyRulesTo(stored));
}

module.exports = { fetchFile };
