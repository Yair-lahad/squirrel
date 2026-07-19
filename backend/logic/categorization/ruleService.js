const { pool } = require('../../db');

const RULE_COLUMNS = `id, attribute, pattern, match_type AS "matchType", transaction_id AS "transactionId", value, created_at AS "createdAt"`;
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
  const { rows } = await pool.query(`SELECT ${RULE_COLUMNS} FROM rules ORDER BY id ASC`);
  return rows;
}

async function createRule({ attribute, matchType, pattern, transactionId, value }) {
  if (attribute === 'category') await ensureCategory(value);
  const { rows } = await pool.query(
    `INSERT INTO rules (attribute, match_type, pattern, transaction_id, value) VALUES ($1, $2, $3, $4, $5) RETURNING ${RULE_COLUMNS}`,
    [attribute, matchType, pattern || null, transactionId || null, value]
  );
  return rows[0];
}

async function updateRule(id, { attribute, matchType, pattern, transactionId, value }) {
  if (attribute === 'category') await ensureCategory(value);
  const { rows } = await pool.query(
    `UPDATE rules SET attribute = $1, match_type = $2, pattern = $3, transaction_id = $4, value = $5 WHERE id = $6 RETURNING ${RULE_COLUMNS}`,
    [attribute, matchType, pattern || null, transactionId || null, value, id]
  );
  return rows[0] || null;
}

async function deleteRule(id) {
  const { rowCount } = await pool.query('DELETE FROM rules WHERE id = $1', [id]);
  return rowCount > 0;
}

// Rule matching — a `transaction`-matchType rule (single-use, keyed by the
// transaction's real id) always wins over description-based rules for that
// attribute; `contains`/`exact` decide it otherwise (exact beats contains);
// a `category`-matchType rule (merge one category into another) then remaps
// on top of whatever category was just resolved, same as before.
function findDescriptionMatch(description, rules) {
  const desc = (description || '').toLowerCase();
  const exact = rules.filter((r) => r.matchType === 'exact');
  const contains = rules.filter((r) => r.matchType === 'contains');

  const exactHit = exact.find((r) => desc === (r.pattern || '').toLowerCase());
  if (exactHit) return exactHit;

  return contains.find((r) => desc.includes((r.pattern || '').toLowerCase()));
}

function findCategoryMerge(category, rules) {
  const cat = (category || '').toLowerCase();
  return rules.find((r) => cat === (r.pattern || '').toLowerCase());
}

function resolveAttribute(t, attribute, rules) {
  const attrRules = rules.filter((r) => r.attribute === attribute);
  const txnMatch = attrRules.find((r) => r.matchType === 'transaction' && r.transactionId === t.id);
  if (txnMatch) return txnMatch.value;
  const descMatch = findDescriptionMatch(t.description, attrRules.filter((r) => r.matchType === 'exact' || r.matchType === 'contains'));
  return descMatch ? descMatch.value : null;
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
  const result = applyRules(transactions, await listRules());
  await ensureCategories(result.map((t) => t.category));
  return result;
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
      await client.query(`UPDATE rules SET value = $1 WHERE attribute = 'category' AND value = $2`, [newName, oldName]);
      await client.query(
        `UPDATE rules SET pattern = $1 WHERE attribute = 'category' AND match_type = 'category' AND pattern = $2`,
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
    `SELECT 1 FROM rules WHERE attribute = 'category' AND (value = $1 OR (match_type = 'category' AND pattern = $1)) LIMIT 1`,
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
};
