const fileSource = require('../logic/sources/fileSource');
const categoryService = require('../logic/categorization/categoryService');

async function fetchFile(req, res) {
  res.json(await categoryService.applyRulesTo(fileSource.getTransactions()));
}

module.exports = { fetchFile };
