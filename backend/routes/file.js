const express = require('express');
const fileSource = require('../logic/sources/fileSource');
const rulesStore = require('../logic/categorization/rulesStore');
const { applyRules } = require('../logic/categorization/applyRules');

const router = express.Router();

router.get('/api/fetch/file', async (req, res) => {
  res.json(applyRules(fileSource.getTransactions(), await rulesStore.listRules()));
});

module.exports = router;
