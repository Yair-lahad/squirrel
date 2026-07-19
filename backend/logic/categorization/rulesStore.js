const { pool } = require('./db');

const COLUMNS = `id, pattern, match_type AS "matchType", category, created_at AS "createdAt"`;

async function listRules() {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM category_rules ORDER BY id ASC`);
  return rows;
}

async function createRule({ pattern, matchType, category }) {
  const { rows } = await pool.query(
    `INSERT INTO category_rules (pattern, match_type, category) VALUES ($1, $2, $3) RETURNING ${COLUMNS}`,
    [pattern, matchType, category]
  );
  return rows[0];
}

async function updateRule(id, { pattern, matchType, category }) {
  const { rows } = await pool.query(
    `UPDATE category_rules SET pattern = $1, match_type = $2, category = $3 WHERE id = $4 RETURNING ${COLUMNS}`,
    [pattern, matchType, category, id]
  );
  return rows[0] || null;
}

async function deleteRule(id) {
  const { rowCount } = await pool.query('DELETE FROM category_rules WHERE id = $1', [id]);
  return rowCount > 0;
}

module.exports = { listRules, createRule, updateRule, deleteRule };
