const ingestService = require('../core/ingestion/ingestService');

async function fetchFile(req, res) {
  res.json(await ingestService.ingestFile());
}

module.exports = { fetchFile };
