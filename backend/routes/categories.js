const express = require('express');
const rulesStore = require('../logic/categorization/rulesStore');
const { applyRules } = require('../logic/categorization/applyRules');

const router = express.Router();

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

router.get('/api/categories/rules', async (req, res) => {
  res.json(await rulesStore.listRules());
});

router.post('/api/categories/rules', async (req, res) => {
  const rule = validateRuleBody(req.body, res);
  if (!rule) return;
  res.status(201).json(await rulesStore.createRule(rule));
});

router.put('/api/categories/rules/:id', async (req, res) => {
  const rule = validateRuleBody(req.body, res);
  if (!rule) return;
  const updated = await rulesStore.updateRule(Number(req.params.id), rule);
  if (!updated) return res.status(404).json({ error: 'rule not found' });
  res.json(updated);
});

router.delete('/api/categories/rules/:id', async (req, res) => {
  const deleted = await rulesStore.deleteRule(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: 'rule not found' });
  res.status(204).end();
});

router.post('/api/categories/apply', async (req, res) => {
  const { transactions } = req.body || {};
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'transactions array is required' });
  }
  res.json(applyRules(transactions, await rulesStore.listRules()));
});

module.exports = router;
