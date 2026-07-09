const express = require('express');
const mockSource = require('../logic/sources/mockSource');
const rulesStore = require('../logic/categorization/rulesStore');
const { applyRules } = require('../logic/categorization/applyRules');

const router = express.Router();

router.get('/api/fetch/mock', (req, res) => {
  res.json(applyRules(mockSource.getTransactions(), rulesStore.listRules()));
});

module.exports = router;
