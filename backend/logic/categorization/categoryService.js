const { pool } = require('../../db');
const { applyRules } = require('./applyRules');

const RULE_COLUMNS = `id, pattern, match_type AS "matchType", category, created_at AS "createdAt"`;
const CATEGORY_COLUMNS = `id, name, created_at AS "createdAt"`;

async function ensureCategory(name) {
  await pool.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
}

async function ensureCategories(names) {
  const unique = [...new Set(names.filter(Boolean))];
  if (!unique.length) return;
  await pool.query('INSERT INTO categories (name) SELECT unnest($1::text[]) ON CONFLICT (name) DO NOTHING', [unique]);
}

async function listRules() {
  const { rows } = await pool.query(`SELECT ${RULE_COLUMNS} FROM category_rules ORDER BY id ASC`);
  return rows;
}

async function createRule({ pattern, matchType, category }) {
  await ensureCategory(category);
  const { rows } = await pool.query(
    `INSERT INTO category_rules (pattern, match_type, category) VALUES ($1, $2, $3) RETURNING ${RULE_COLUMNS}`,
    [pattern, matchType, category]
  );
  return rows[0];
}

async function updateRule(id, { pattern, matchType, category }) {
  await ensureCategory(category);
  const { rows } = await pool.query(
    `UPDATE category_rules SET pattern = $1, match_type = $2, category = $3 WHERE id = $4 RETURNING ${RULE_COLUMNS}`,
    [pattern, matchType, category, id]
  );
  return rows[0] || null;
}

async function deleteRule(id) {
  const { rowCount } = await pool.query('DELETE FROM category_rules WHERE id = $1', [id]);
  return rowCount > 0;
}

async function applyRulesTo(transactions) {
  const categorized = applyRules(transactions, await listRules());
  await ensureCategories(categorized.map((t) => t.category));
  const overrides = await titleOverridesByDescription();
  return categorized.map((t) => ({ ...t, title: overrides.get(t.description) || t.description }));
}

async function titleOverridesByDescription() {
  const { rows } = await pool.query('SELECT description, title FROM title_overrides');
  return new Map(rows.map((r) => [r.description, r.title]));
}

async function setTitleOverride(description, title) {
  const { rows } = await pool.query(
    `INSERT INTO title_overrides (description, title) VALUES ($1, $2)
     ON CONFLICT (description) DO UPDATE SET title = $2, updated_at = now()
     RETURNING description, title`,
    [description, title]
  );
  return rows[0];
}

async function listCategories() {
  const { rows } = await pool.query(`SELECT ${CATEGORY_COLUMNS} FROM categories ORDER BY name ASC`);
  return rows;
}

async function createCategory(name) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO categories (name) VALUES ($1) RETURNING ${CATEGORY_COLUMNS}`,
      [name]
    );
    return { status: 'ok', category: rows[0] };
  } catch (err) {
    if (err.code === '23505') return { status: 'conflict' };
    throw err;
  }
}

async function renameCategory(id, newName) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT name FROM categories WHERE id = $1 FOR UPDATE', [id]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return { status: 'not_found' };
    }
    const oldName = rows[0].name;
    if (oldName !== newName) {
      await client.query('UPDATE categories SET name = $1 WHERE id = $2', [newName, id]);
      await client.query('UPDATE category_rules SET category = $1 WHERE category = $2', [newName, oldName]);
      await client.query(
        `UPDATE category_rules SET pattern = $1 WHERE match_type = 'category' AND pattern = $2`,
        [newName, oldName]
      );
    }
    await client.query('COMMIT');
    return { status: 'ok', category: { id, name: newName } };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return { status: 'conflict' };
    throw err;
  } finally {
    client.release();
  }
}

async function deleteCategory(id) {
  const { rows: cat } = await pool.query('SELECT name FROM categories WHERE id = $1', [id]);
  if (!cat.length) return { status: 'not_found' };
  const { name } = cat[0];
  const { rows: usage } = await pool.query(
    `SELECT 1 FROM category_rules WHERE category = $1 OR (match_type = 'category' AND pattern = $1) LIMIT 1`,
    [name]
  );
  if (usage.length) return { status: 'in_use' };
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  return { status: 'ok' };
}

module.exports = {
  listRules,
  createRule,
  updateRule,
  deleteRule,
  applyRulesTo,
  listCategories,
  createCategory,
  renameCategory,
  deleteCategory,
  setTitleOverride,
};
