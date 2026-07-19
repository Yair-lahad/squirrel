const { pool } = require('../../db');

// Upserts each transaction and attaches its real DB id. Reloading identical
// data (same date+description+amount+source) is a no-op for existing rows —
// the ON CONFLICT branch reassigns the same date rather than doing nothing,
// only so RETURNING still fires and hands back the existing row's id.
async function storeAndGetIds(transactions, source) {
  const stored = [];
  for (const t of transactions) {
    const { rows } = await pool.query(
      `INSERT INTO transactions (date, description, amount, source)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (date, description, amount, source) DO UPDATE SET date = EXCLUDED.date
       RETURNING id`,
      [t.date, t.description, t.amount, source]
    );
    stored.push({ ...t, id: rows[0].id });
  }
  return stored;
}

module.exports = { storeAndGetIds };
