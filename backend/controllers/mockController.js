const mockSource = require('../logic/sources/mockSource');
const categoryService = require('../logic/categorization/categoryService');

async function fetchMock(req, res) {
  res.json(await categoryService.applyRulesTo(mockSource.getTransactions()));
}

module.exports = { fetchMock };
