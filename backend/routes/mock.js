const express = require('express');
const mockController = require('../controllers/mockController');

const router = express.Router();

router.get('/api/fetch/mock', mockController.fetchMock);

module.exports = router;
