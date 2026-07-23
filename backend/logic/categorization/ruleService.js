const repo = require('./ruleRepository');

// Only one "Once" rule can ever make sense for a given transaction+attribute
// — re-editing the same row with "Once" should replace that rule, not stack
// a second one on top of it (which left the older one winning, since
// resolution used to just take the first match by id order).
async function createRule({ attribute, matchType, pattern, transactionId, value }) {
  if (attribute === 'category') await repo.ensureCategory(value);
  if (matchType === 'transaction') await repo.deleteTransactionRule(attribute, transactionId);
  return repo.insertRule({ attribute, matchType, pattern, transactionId, value });
}

async function updateRule(id, { attribute, matchType, pattern, transactionId, value }) {
  if (attribute === 'category') await repo.ensureCategory(value);
  return repo.updateRuleRow(id, { attribute, matchType, pattern, transactionId, value });
}

async function deleteRule(id) {
  return repo.deleteRuleRow(id);
}

// Once -> Always: reuse the pattern the transaction already matched. Looked
// up straight from the DB so this works regardless of which upload the
// frontend currently has loaded.
async function promoteRuleToAlways(id) {
  const rule = await repo.getRuleById(id);
  if (!rule) return { status: 'not_found' };
  if (rule.matchType !== 'transaction') return { status: 'not_once' };
  const description = await repo.getTransactionDescription(rule.transactionId);
  if (description == null) return { status: 'transaction_missing' };
  const updated = await repo.updateRuleRow(id, {
    attribute: rule.attribute,
    matchType: 'exact',
    pattern: description,
    transactionId: null,
    value: rule.value,
  });
  return { status: 'ok', rule: updated };
}

// Scraped bank data (israeli-bank-scrapers, Hebrew descriptions especially)
// routinely embeds invisible characters — RTL/bidi control marks, BOM,
// non-breaking spaces — that look identical on screen but break a plain
// substring match, since a pattern typed by hand won't contain them. Strip
// those and collapse whitespace before comparing, on both sides.
// Zero-width spaces/joiners (U+200B-200D), bidi marks/embeddings/overrides
// (U+200E-200F, U+202A-202E, U+2066-2069), and a stray BOM (U+FEFF). Written
// as \\u escapes rather than literal characters so the pattern stays legible
// (and correct) in any editor/encoding.
const INVISIBLE_CHARS = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g;

function normalizeForMatch(text) {
  return (text || '')
    .normalize('NFC')
    .replace(INVISIBLE_CHARS, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Rule matching — among every exact/contains rule that matches this
// description, the most recently created one wins (same recency principle
// as once-vs-always below): an old `exact` rule doesn't get to permanently
// outrank a `contains` rule you set up afterward just because "exact beats
// contains" used to be a fixed priority instead of a tiebreaker.
function findDescriptionMatch(description, rules) {
  const desc = normalizeForMatch(description);
  const matches = rules.filter((r) => {
    const pattern = normalizeForMatch(r.pattern);
    return r.matchType === 'exact' ? desc === pattern : desc.includes(pattern);
  });
  return matches.reduce((latest, r) => (!latest || new Date(r.createdAt) > new Date(latest.createdAt) ? r : latest), null);
}

function findCategoryMerge(category, rules) {
  const cat = normalizeForMatch(category);
  return rules.find((r) => cat === normalizeForMatch(r.pattern));
}

// A "once" rule (matchType 'transaction', tied to this row's real id) and an
// "always" rule (exact/contains, tied to the description) can both match the
// same transaction — whichever was created more recently wins, so setting
// "Always" after a prior "Once" actually overrides it instead of staying
// stuck on the older once-off value.
function resolveAttribute(t, attribute, rules) {
  const attrRules = rules.filter((r) => r.attribute === attribute);
  // Guards against any pre-existing duplicate Once rules (from before this
  // was deduped on create) — picks the most recently created one rather than
  // whichever happens to come first by id order.
  const txnMatch = attrRules
    .filter((r) => r.matchType === 'transaction' && r.transactionId === t.id)
    .reduce((latest, r) => (!latest || new Date(r.createdAt) > new Date(latest.createdAt) ? r : latest), null);
  const descMatch = findDescriptionMatch(t.description, attrRules.filter((r) => r.matchType === 'exact' || r.matchType === 'contains'));
  if (txnMatch && descMatch) {
    return new Date(txnMatch.createdAt) >= new Date(descMatch.createdAt) ? txnMatch.value : descMatch.value;
  }
  return (txnMatch ?? descMatch)?.value ?? null;
}

function applyRules(transactions, rules) {
  return transactions.map((t) => {
    let category = resolveAttribute(t, 'category', rules) ?? t.category;
    const merge = findCategoryMerge(category, rules.filter((r) => r.attribute === 'category' && r.matchType === 'category'));
    if (merge) category = merge.value;
    const title = resolveAttribute(t, 'title', rules) ?? t.description;
    return { ...t, category, title };
  });
}

async function applyRulesTo(transactions) {
  const result = applyRules(transactions, await repo.listRules());
  await repo.ensureCategories(result.map((t) => t.category));
  return result;
}

async function listRules() {
  return repo.listRules();
}

async function listCategories() {
  return repo.listCategories();
}

async function createCategory(name) {
  return repo.insertCategory(name);
}

async function renameCategory(id, newName) {
  return repo.updateCategoryName(id, newName);
}

async function deleteCategory(id) {
  return repo.deleteCategoryRow(id);
}

module.exports = {
  listRules,
  createRule,
  updateRule,
  deleteRule,
  promoteRuleToAlways,
  applyRulesTo,
  listCategories,
  createCategory,
  renameCategory,
  deleteCategory,
};
