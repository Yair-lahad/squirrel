const fs = require('fs');
const path = require('path');

// The source file keeps the original Hebrew category names (as they appear on
// the real statement); this maps them to English for display on the web.
const CATEGORY_EN = {
  "תש' רשויות": 'Utilities & Authorities',
  'שונות': 'Miscellaneous',
  'תרבות': 'Culture & Entertainment',
  'מסעדות/קפה': 'Dining',
  'מכולת/סופר': 'Groceries',
  'פנאי/ספורט': 'Leisure & Sports',
  'ביטוח': 'Insurance',
  'שרות רפואי': 'Healthcare',
  'פארמה': 'Pharmacy',
  'מעדניות': 'Delicatessen',
  'כלי בית': 'Home Goods',
  'דלק': 'Fuel',
  'הלבשה': 'Clothing',
  'תקשורת': 'Communications',
  'תחבורה': 'Transport',
  'מנויים': 'Subscriptions',
};

function getTransactions() {
  const raw = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'data', 'hebrew-sample.json'), 'utf8');
  const transactions = JSON.parse(raw);
  return transactions.map((t) => ({ ...t, category: CATEGORY_EN[t.category] || t.category }));
}

module.exports = { getTransactions };
