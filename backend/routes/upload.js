const express = require('express');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

router.post('/api/fetch/upload', uploadController.fetchUpload);

module.exports = router;
