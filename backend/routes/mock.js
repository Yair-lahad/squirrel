const express = require('express');
const mockSource = require('../logic/sources/mockSource');

const router = express.Router();

router.get('/api/fetch/mock', (req, res) => {
  res.json(mockSource.getTransactions());
});

module.exports = router;
