const categoryService = require('../logic/categorization/categoryService');

const MATCH_TYPES = ['contains', 'exact', 'category'];

function validateRuleBody(body, res) {
  const { pattern, matchType, category } = body || {};
  if (!pattern || typeof pattern !== 'string') {
    res.status(400).json({ error: 'pattern is required' });
    return null;
  }
  if (!MATCH_TYPES.includes(matchType)) {
    res.status(400).json({ error: `matchType must be one of: ${MATCH_TYPES.join(', ')}` });
    return null;
  }
  if (!category || typeof category !== 'string') {
    res.status(400).json({ error: 'category is required' });
    return null;
  }
  return { pattern, matchType, category };
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
  res.json(await categoryService.listRules());
}

async function createRule(req, res) {
  const rule = validateRuleBody(req.body, res);
  if (!rule) return;
  res.status(201).json(await categoryService.createRule(rule));
}

async function updateRule(req, res) {
  const rule = validateRuleBody(req.body, res);
  if (!rule) return;
  const updated = await categoryService.updateRule(Number(req.params.id), rule);
  if (!updated) return res.status(404).json({ error: 'rule not found' });
  res.json(updated);
}

async function deleteRule(req, res) {
  const deleted = await categoryService.deleteRule(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'rule not found' });
  res.status(204).end();
}

async function applyRulesEndpoint(req, res) {
  const { transactions } = req.body || {};
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'transactions array is required' });
  }
  res.json(await categoryService.applyRulesTo(transactions));
}

async function listCategories(req, res) {
  res.json(await categoryService.listCategories());
}

async function createCategory(req, res) {
  const name = validateCategoryName(req.body, res);
  if (!name) return;
  const result = await categoryService.createCategory(name);
  if (result.status === 'conflict') return res.status(409).json({ error: `A category named "${name}" already exists` });
  res.status(201).json(result.category);
}

async function renameCategory(req, res) {
  const name = validateCategoryName(req.body, res);
  if (!name) return;
  const result = await categoryService.renameCategory(Number(req.params.id), name);
  if (result.status === 'not_found') return res.status(404).json({ error: 'category not found' });
  if (result.status === 'conflict') return res.status(409).json({ error: `A category named "${name}" already exists` });
  res.json(result.category);
}

async function deleteCategory(req, res) {
  const result = await categoryService.deleteCategory(Number(req.params.id));
  if (result.status === 'not_found') return res.status(404).json({ error: 'category not found' });
  if (result.status === 'in_use') {
    return res.status(409).json({ error: 'Category is in use by one or more rules; update or delete those rules first.' });
  }
  res.status(204).end();
}

async function setTitleOverride(req, res) {
  const { description, title } = req.body || {};
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'description is required' });
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }
  res.json(await categoryService.setTitleOverride(description, title.trim()));
}

module.exports = {
  listRules,
  createRule,
  updateRule,
  deleteRule,
  applyRules: applyRulesEndpoint,
  listCategories,
  createCategory,
  renameCategory,
  deleteCategory,
  setTitleOverride,
};
