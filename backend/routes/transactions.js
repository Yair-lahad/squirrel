const express = require('express');
const transactionsController = require('../controllers/transactionsController');

const router = express.Router();

router.get('/api/transactions/uploads', transactionsController.uploads);
router.get('/api/transactions', transactionsController.list);

module.exports = router;
