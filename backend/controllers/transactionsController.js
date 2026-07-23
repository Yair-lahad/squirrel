const transactionService = require('../logic/transactions/transactionService');
const ruleService = require('../logic/categorization/ruleService');

async function list(req, res) {
  const { all, uploadId } = req.query;
  const rows = all === 'true'
    ? await transactionService.getAll()
    : await transactionService.getTransactions({ uploadId });
  res.json(await ruleService.applyRulesTo(rows));
}

async function uploads(req, res) {
  res.json(await transactionService.getUploads());
}

module.exports = { list, uploads };
