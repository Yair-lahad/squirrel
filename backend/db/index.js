const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set (add it to .env)');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrateLegacyTables() {
  const { rows: categoryRulesExists } = await pool.query(`SELECT to_regclass('public.category_rules') AS reg`);
  if (categoryRulesExists[0].reg) {
    await pool.query(`
      INSERT INTO rules (attribute, match_type, pattern, value)
      SELECT 'category', match_type, pattern, category FROM category_rules
    `);
    await pool.query('DROP TABLE category_rules');
  }

  const { rows: titleOverridesExists } = await pool.query(`SELECT to_regclass('public.title_overrides') AS reg`);
  if (titleOverridesExists[0].reg) {
    await pool.query(`
      INSERT INTO rules (attribute, match_type, pattern, value)
      SELECT 'title', 'exact', description, title FROM title_overrides
    `);
    await pool.query('DROP TABLE title_overrides');
  }
}

// Every load (sample file, mock, vendor fetch, upload) creates one `uploads`
// row, and every transaction it produces is tagged with that upload's id —
// this is what lets the frontend pick "which file" to view, since real
// statement periods run mid-month to mid-month, not on calendar boundaries.
async function migrateUploadsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploads (
      id SERIAL PRIMARY KEY,
      label TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS upload_id INTEGER REFERENCES uploads(id)');

  // Rows stored before this column existed have no upload_id — bucket each
  // distinct source they came from into one legacy "upload" so they still
  // show up in the selector.
  const { rows: orphanSources } = await pool.query(
    'SELECT DISTINCT source FROM transactions WHERE upload_id IS NULL'
  );
  for (const { source } of orphanSources) {
    const { rows: [upload] } = await pool.query(
      'INSERT INTO uploads (label, source) VALUES ($1, $2) RETURNING id',
      [`Legacy: ${source}`, source]
    );
    await pool.query(
      'UPDATE transactions SET upload_id = $1 WHERE source = $2 AND upload_id IS NULL',
      [upload.id, source]
    );
  }
}

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      description TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      source TEXT NOT NULL,
      category TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await pool.query('ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category TEXT');

  // No content-based dedup: every load is a plain insert, and each row's
  // own `id` is what makes it unique — two transactions that happen to
  // share the same date/description/amount (e.g. two identical scooter
  // rides on the same day) are still two separate, valid rows.
  await pool.query('ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_date_description_amount_source_key');
  await pool.query('ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_date_description_amount_source_occurrence_key');
  await pool.query('ALTER TABLE transactions DROP COLUMN IF EXISTS occurrence');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rules (
      id SERIAL PRIMARY KEY,
      attribute TEXT NOT NULL,
      match_type TEXT NOT NULL,
      pattern TEXT,
      transaction_id INTEGER REFERENCES transactions(id),
      value TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await migrateLegacyTables();
  await migrateUploadsTable();
}

module.exports = { pool, init };
