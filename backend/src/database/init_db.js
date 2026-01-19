const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file stored in the root directory
const dbPath = path.resolve(process.cwd(), 'database.db');
const db = new sqlite3.Database(dbPath);

/**
 * Guide model instructions:
 * 1. Use CREATE TABLE IF NOT EXISTS to create new tables.
 * 2. When adding fields, use ALTER TABLE ... ADD COLUMN ... and wrap it in try/catch logic, or check if the field exists via PRAGMA table_info.
 * 3. Always execute within db.serialize to ensure DDL order.
 */
db.serialize(() => {
  // Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT NOT NULL,
      real_name TEXT,
      id_type TEXT,
      id_number TEXT UNIQUE,
      phone TEXT UNIQUE,
      email TEXT,
      user_type TEXT DEFAULT 'normal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
