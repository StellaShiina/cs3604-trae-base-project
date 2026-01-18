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
  // [CREATE TABLE statements added by the model as needed here]
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    id_type TEXT NOT NULL,
    id_number TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    id_type TEXT NOT NULL,
    id_number TEXT NOT NULL,
    type TEXT DEFAULT '成人',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    pinyin TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS trains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL,
    station_name TEXT NOT NULL,
    arrival_time TEXT,
    departure_time TEXT,
    stop_order INTEGER NOT NULL,
    FOREIGN KEY(train_id) REFERENCES trains(id),
    FOREIGN KEY(station_id) REFERENCES stations(id)
  )`);

  // [ALTER TABLE statements for incremental evolution added by the model as needed here]
});

module.exports = db;