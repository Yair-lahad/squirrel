const ingestService = require('../core/ingestion/ingestService');

async function fetchVendor(req, res) {
  const { id, password, card6Digits, startDate } = req.body || {};

  if (!id || !password || !card6Digits || !startDate) {
    return res.status(400).json({ error: 'id, password, card6Digits and startDate are required' });
  }

  try {
    res.json(await ingestService.ingestVendor({ id, password, card6Digits, startDate }));
  } catch (err) {
    res.status(502).json({ error: err.message || 'Fetch failed' });
  }
}

module.exports = { fetchVendor };
