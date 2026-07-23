const { pool } = require('../../db');

// Every read below selects these exact columns rather than `SELECT *`:
// - date is cast to a plain 'YYYY-MM-DD' string — the driver otherwise parses
//   the DATE column into a JS Date object using a UTC/local conversion that
//   shifts the calendar day, breaking both display and month-grouping.
// - amount is cast to float8 — NUMERIC otherwise comes back as a string,
//   silently turning `total += amount` into string concatenation (NaN).
// - category falls back to 'Uncategorized' for rows stored before that
//   column existed, or from a source that never set one.
const SELECT_COLUMNS = `
  id,
  to_char(date, 'YYYY-MM-DD') AS date,
  description,
  amount::float8 AS amount,
  source,
  COALESCE(category, 'Uncategorized') AS category,
  upload_id
`;

// Plain insert, no content-based dedup — every call adds fresh rows, and
// each row's own `id` (returned here) is what identifies it. Re-storing the
// same data (e.g. re-uploading a file) creates new rows rather than
// matching existing ones. Every call is also its own "upload" — statement
// periods run mid-month to mid-month, not on calendar boundaries, so this
// (not the calendar month) is what the frontend selector groups by.
async function storeAndGetIds(transactions, source, label) {
  const { rows: [upload] } = await pool.query(
    'INSERT INTO uploads (label, source) VALUES ($1, $2) RETURNING id',
    [label || source, source]
  );

  const stored = [];
  for (const t of transactions) {
    const { rows } = await pool.query(
      `INSERT INTO transactions (date, description, amount, source, category, upload_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [t.date, t.description, t.amount, source, t.category, upload.id]
    );
    stored.push({ ...t, id: rows[0].id, uploadId: upload.id });
  }
  return stored;
}

async function getAll() {
  const { rows } = await pool.query(`SELECT ${SELECT_COLUMNS} FROM transactions ORDER BY date`);
  return rows;
}

// General query entry point. With no uploadId, defaults to the most
// recently created upload.
async function getTransactions({ uploadId } = {}) {
  if (uploadId) {
    const { rows } = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM transactions WHERE upload_id = $1 ORDER BY date`,
      [uploadId]
    );
    return rows;
  }
  const { rows } = await pool.query(`
    SELECT ${SELECT_COLUMNS} FROM transactions
    WHERE upload_id = (SELECT id FROM uploads ORDER BY id DESC LIMIT 1)
    ORDER BY date
  `);
  return rows;
}

// Lightweight list of what's been loaded, for populating the file/upload
// selector without pulling every transaction row just to find that out.
// end_date uses the 90th percentile of dates rather than a literal MAX, so
// a single stray old row (e.g. an ongoing installment charge from months
// earlier) doesn't distort it — the transactions themselves are untouched,
// only this label.
async function getUploads() {
  const { rows } = await pool.query(`
    SELECT
      u.id,
      u.label,
      u.source,
      COUNT(t.id)::int AS count,
      to_char(DATE '1970-01-01' + ROUND(percentile_cont(0.9) WITHIN GROUP (ORDER BY (t.date - DATE '1970-01-01')))::int, 'YYYY-MM-DD') AS end_date
    FROM uploads u
    LEFT JOIN transactions t ON t.upload_id = u.id
    GROUP BY u.id
    ORDER BY u.id DESC
  `);
  return rows;
}

module.exports = { storeAndGetIds, getAll, getTransactions, getUploads };
