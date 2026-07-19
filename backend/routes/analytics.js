const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.post('/api/analytics/totals', analyticsController.totals);
router.post('/api/analytics/by-category', analyticsController.byCategory);
router.post('/api/analytics/sort', analyticsController.sort);
router.post('/api/analytics/category-detail', analyticsController.categoryDetail);

module.exports = router;
