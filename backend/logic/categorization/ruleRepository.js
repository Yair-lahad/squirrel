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

// A 'transaction' (Once) rule only stores the transaction's id, not its
// description — joining here lets the rules list show the actual text the
// rule is pinned to instead of a bare "#123".
async function listRules() {
  const { rows } = await pool.query(`
    SELECT r.id, r.attribute, r.pattern, r.match_type AS "matchType", r.transaction_id AS "transactionId",
           r.value, r.created_at AS "createdAt", t.description AS "transactionDescription"
    FROM rules r
    LEFT JOIN transactions t ON t.id = r.transaction_id
    ORDER BY r.id ASC
  `);
  return rows;
}

async function getRuleById(id) {
  const { rows } = await pool.query(`SELECT ${RULE_COLUMNS} FROM rules WHERE id = $1`, [id]);
  return rows[0] || null;
}

// Looked up directly from the transactions table rather than relying on
// whatever's currently loaded in the frontend — a "once" rule's transaction
// may belong to a different upload than the one the user has open right now.
async function getTransactionDescription(transactionId) {
  const { rows } = await pool.query('SELECT description FROM transactions WHERE id = $1', [transactionId]);
  return rows[0]?.description ?? null;
}

async function deleteTransactionRule(attribute, transactionId) {
  await pool.query(
    `DELETE FROM rules WHERE attribute = $1 AND match_type = 'transaction' AND transaction_id = $2`,
    [attribute, transactionId]
  );
}

async function insertRule({ attribute, matchType, pattern, transactionId, value }) {
  const { rows } = await pool.query(
    `INSERT INTO rules (attribute, match_type, pattern, transaction_id, value) VALUES ($1, $2, $3, $4, $5) RETURNING ${RULE_COLUMNS}`,
    [attribute, matchType, pattern || null, transactionId || null, value]
  );
  return rows[0];
}

async function updateRuleRow(id, { attribute, matchType, pattern, transactionId, value }) {
  const { rows } = await pool.query(
    `UPDATE rules SET attribute = $1, match_type = $2, pattern = $3, transaction_id = $4, value = $5 WHERE id = $6 RETURNING ${RULE_COLUMNS}`,
    [attribute, matchType, pattern || null, transactionId || null, value, id]
  );
  return rows[0] || null;
}

async function deleteRuleRow(id) {
  const { rowCount } = await pool.query('DELETE FROM rules WHERE id = $1', [id]);
  return rowCount > 0;
}

async function listCategories() {
  const { rows } = await pool.query(`SELECT ${CATEGORY_COLUMNS} FROM categories ORDER BY name ASC`);
  return rows;
}

async function insertCategory(name) {
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

// Renaming a category also has to repoint every rule that references the old
// name (both as the category a rule assigns, and as the merge-from pattern
// on a 'category'-matchType rule) — done in one transaction so a crash
// mid-way can't leave rules pointing at a name that no longer exists.
async function updateCategoryName(id, newName) {
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

async function categoryInUse(name) {
  const { rows } = await pool.query(
    `SELECT 1 FROM rules WHERE attribute = 'category' AND (value = $1 OR (match_type = 'category' AND pattern = $1)) LIMIT 1`,
    [name]
  );
  return rows.length > 0;
}

async function deleteCategoryRow(id) {
  const { rows: cat } = await pool.query('SELECT name FROM categories WHERE id = $1', [id]);
  if (!cat.length) return { status: 'not_found' };
  if (await categoryInUse(cat[0].name)) return { status: 'in_use' };
  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  return { status: 'ok' };
}

module.exports = {
  ensureCategory,
  ensureCategories,
  listRules,
  getRuleById,
  getTransactionDescription,
  deleteTransactionRule,
  insertRule,
  updateRuleRow,
  deleteRuleRow,
  listCategories,
  insertCategory,
  updateCategoryName,
  deleteCategoryRow,
};
