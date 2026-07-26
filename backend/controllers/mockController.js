const ingestService = require('../core/ingestion/ingestService');

async function fetchMock(req, res) {
  res.json(await ingestService.ingestMock());
}

module.exports = { fetchMock };
