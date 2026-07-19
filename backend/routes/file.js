const express = require('express');
const fileController = require('../controllers/fileController');

const router = express.Router();

router.get('/api/fetch/file', fileController.fetchFile);

module.exports = router;
