const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/api/fetch/upload', uploadController.fetchUpload);
router.post('/api/fetch/upload-doc', upload.single('file'), uploadController.fetchUploadDoc);

module.exports = router;
