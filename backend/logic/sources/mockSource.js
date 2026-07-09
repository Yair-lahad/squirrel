const fs = require('fs');
const path = require('path');

function getTransactions() {
  const raw = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'data', 'sample-data.json'), 'utf8');
  return JSON.parse(raw);
}

module.exports = { getTransactions };
