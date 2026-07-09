const db = require('./db');

function listRules() {
  return db.prepare('SELECT * FROM category_rules ORDER BY id ASC').all();
}

function createRule({ pattern, matchType, category }) {
  const { lastInsertRowid } = db
    .prepare('INSERT INTO category_rules (pattern, matchType, category) VALUES (?, ?, ?)')
    .run(pattern, matchType, category);
  return db.prepare('SELECT * FROM category_rules WHERE id = ?').get(lastInsertRowid);
}

function updateRule(id, { pattern, matchType, category }) {
  const result = db
    .prepare('UPDATE category_rules SET pattern = ?, matchType = ?, category = ? WHERE id = ?')
    .run(pattern, matchType, category, id);
  if (result.changes === 0) return null;
  return db.prepare('SELECT * FROM category_rules WHERE id = ?').get(id);
}

function deleteRule(id) {
  const result = db.prepare('DELETE FROM category_rules WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = { listRules, createRule, updateRule, deleteRule };
