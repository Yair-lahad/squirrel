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

// The canonical English category set this app knows about in code, independent
// of whatever happens to be in the DB right now (which starts empty on a
// fresh install). Other sources (e.g. the LLM statement extractor) use this
// alongside the DB's live category list so categorization stays consistent
// even before any real data has been loaded.
const CANONICAL_CATEGORIES = [...new Set(Object.values(CATEGORY_EN))];

module.exports = { getTransactions, CANONICAL_CATEGORIES };
