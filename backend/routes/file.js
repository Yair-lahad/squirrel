const express = require('express');
const fileSource = require('../logic/sources/fileSource');

const router = express.Router();

router.get('/api/fetch/file', (req, res) => {
  res.json(fileSource.getTransactions());
});

module.exports = router;
