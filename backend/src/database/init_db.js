const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use __dirname to ensure consistent DB path regardless of where node is run from
// src/database/init_db.js -> ../../database.db
const dbPath = path.resolve(__dirname, '../../database.db');
console.log(`[DB] Using database at: ${dbPath}`);

const db = new sqlite3.Database(dbPath);

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
  `, (err) => {
    if (err) console.error('[DB] Error creating users table:', err);
  });

  // Passengers Table
  db.run(`
    CREATE TABLE IF NOT EXISTS passengers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      real_name TEXT NOT NULL,
      id_type TEXT NOT NULL,
      id_number TEXT NOT NULL,
      phone TEXT,
      passenger_type TEXT DEFAULT 'adult',
      is_self BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('[DB] Error creating passengers table:', err);
  });

  // Verification Codes Table
  db.run(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      phone TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL
    )
  `, (err) => {
    if (err) console.error('[DB] Error creating verification_codes table:', err);
  });
});

module.exports = db;
