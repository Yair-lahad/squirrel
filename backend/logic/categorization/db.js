const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '..', '..', '..', 'data', 'categories.db'));

// matchType is validated at the route layer (backend/routes/categories.js) —
// no CHECK constraint here, so adding a new match type never needs a schema
// migration. Rebuild once for any table created before this change, which did
// have a CHECK baking in the old ('contains', 'exact') set.
const existing = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'category_rules'").get();
if (existing && existing.sql.includes('CHECK')) {
  db.exec(`
    ALTER TABLE category_rules RENAME TO category_rules_old;
    CREATE TABLE category_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern TEXT NOT NULL,
      matchType TEXT NOT NULL,
      category TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT INTO category_rules (id, pattern, matchType, category, createdAt)
      SELECT id, pattern, matchType, category, createdAt FROM category_rules_old;
    DROP TABLE category_rules_old;
  `);
} else {
  db.exec(`
    CREATE TABLE IF NOT EXISTS category_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern TEXT NOT NULL,
      matchType TEXT NOT NULL,
      category TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

module.exports = db;
