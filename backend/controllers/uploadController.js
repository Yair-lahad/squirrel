const ingestService = require('../core/ingestion/ingestService');

async function fetchUpload(req, res) {
  const { transactions, label } = req.body || {};
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'transactions array is required' });
  }
  res.json(await ingestService.ingestUploadJson(transactions, label));
}

async function fetchUploadDoc(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'file is required' });
  }
  try {
    res.json(await ingestService.ingestUploadDoc(req.file));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { fetchUpload, fetchUploadDoc };
