const ruleService = require('../logic/categorization/ruleService');

const MATCH_TYPES = ['contains', 'exact', 'category', 'transaction'];
const ATTRIBUTES = ['category', 'title'];

function validateRuleBody(body, res) {
  const { attribute, matchType, pattern, transactionId, value } = body || {};

  if (!ATTRIBUTES.includes(attribute)) {
    res.status(400).json({ error: `attribute must be one of: ${ATTRIBUTES.join(', ')}` });
    return null;
  }
  if (!MATCH_TYPES.includes(matchType)) {
    res.status(400).json({ error: `matchType must be one of: ${MATCH_TYPES.join(', ')}` });
    return null;
  }
  if (matchType === 'category' && attribute !== 'category') {
    res.status(400).json({ error: "matchType 'category' (merge) only applies to attribute 'category'" });
    return null;
  }
  if (matchType === 'transaction') {
    if (!Number.isInteger(transactionId)) {
      res.status(400).json({ error: 'transactionId is required for a single-use rule' });
      return null;
    }
  } else if (!pattern || typeof pattern !== 'string') {
    res.status(400).json({ error: 'pattern is required' });
    return null;
  }
  if (!value || typeof value !== 'string') {
    res.status(400).json({ error: 'value is required' });
    return null;
  }

  return { attribute, matchType, pattern: pattern || null, transactionId: transactionId ?? null, value };
}

function validateCategoryName(body, res) {
  const name = (body || {}).name;
  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'name is required' });
    return null;
  }
  return name.trim();
}

async function listRules(req, res) {
  res.json(await ruleService.listRules());
}

async function createRule(req, res) {
  const rule = validateRuleBody(req.body, res);
  if (!rule) return;
  res.status(201).json(await ruleService.createRule(rule));
}

async function updateRule(req, res) {
  const rule = validateRuleBody(req.body, res);
  if (!rule) return;
  const updated = await ruleService.updateRule(Number(req.params.id), rule);
  if (!updated) return res.status(404).json({ error: 'rule not found' });
  res.json(updated);
}

async function deleteRule(req, res) {
  const deleted = await ruleService.deleteRule(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'rule not found' });
  res.status(204).end();
}

async function promoteRule(req, res) {
  const result = await ruleService.promoteRuleToAlways(Number(req.params.id));
  if (result.status === 'not_found') return res.status(404).json({ error: 'rule not found' });
  if (result.status === 'not_once') return res.status(400).json({ error: 'only a Once rule can be promoted to Always' });
  if (result.status === 'transaction_missing') return res.status(409).json({ error: 'the original transaction no longer exists' });
  res.json(result.rule);
}

async function applyRulesEndpoint(req, res) {
  const { transactions } = req.body || {};
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'transactions array is required' });
  }
  res.json(await ruleService.applyRulesTo(transactions));
}

async function listCategories(req, res) {
  res.json(await ruleService.listCategories());
}

async function createCategory(req, res) {
  const name = validateCategoryName(req.body, res);
  if (!name) return;
  const result = await ruleService.createCategory(name);
  if (result.status === 'conflict') return res.status(409).json({ error: `A category named "${name}" already exists` });
  res.status(201).json(result.category);
}

async function renameCategory(req, res) {
  const name = validateCategoryName(req.body, res);
  if (!name) return;
  const result = await ruleService.renameCategory(Number(req.params.id), name);
  if (result.status === 'not_found') return res.status(404).json({ error: 'category not found' });
  if (result.status === 'conflict') return res.status(409).json({ error: `A category named "${name}" already exists` });
  res.json(result.category);
}

async function deleteCategory(req, res) {
  const result = await ruleService.deleteCategory(Number(req.params.id));
  if (result.status === 'not_found') return res.status(404).json({ error: 'category not found' });
  if (result.status === 'in_use') {
    return res.status(409).json({ error: 'Category is in use by one or more rules; update or delete those rules first.' });
  }
  res.status(204).end();
}

module.exports = {
  listRules,
  createRule,
  updateRule,
  deleteRule,
  promoteRule,
  applyRules: applyRulesEndpoint,
  listCategories,
  createCategory,
  renameCategory,
  deleteCategory,
};
