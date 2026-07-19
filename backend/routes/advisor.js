const express = require('express');
const advisorController = require('../controllers/advisorController');

const router = express.Router();

router.post('/api/advisor/insights', advisorController.insights);
router.post('/api/advisor/ask', advisorController.ask);

module.exports = router;
