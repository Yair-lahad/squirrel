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
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (date, description, amount, source)
    )
  `);

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
}

module.exports = { pool, init };
