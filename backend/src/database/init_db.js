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

  // Trains Table
  db.run(`
    CREATE TABLE IF NOT EXISTS trains (
      train_no TEXT PRIMARY KEY,
      train_type TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('[DB] Error creating trains table:', err);
  });

  // Train Stations Table
  db.run(`
    CREATE TABLE IF NOT EXISTS train_stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_no TEXT NOT NULL,
      station_name TEXT NOT NULL,
      arrival_time TEXT,
      departure_time TEXT,
      sequence_no INTEGER NOT NULL,
      FOREIGN KEY(train_no) REFERENCES trains(train_no)
    )
  `, (err) => {
    if (err) console.error('[DB] Error creating train_stations table:', err);
  });

  // Daily Train Tickets Table
  db.run(`
    CREATE TABLE IF NOT EXISTS daily_train_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_no TEXT NOT NULL,
      date TEXT NOT NULL,
      business_seat INTEGER DEFAULT 0,
      first_class INTEGER DEFAULT 0,
      second_class INTEGER DEFAULT 0,
      hard_sleeper INTEGER DEFAULT 0,
      hard_seat INTEGER DEFAULT 0,
      no_seat INTEGER DEFAULT 0,
      FOREIGN KEY(train_no) REFERENCES trains(train_no)
    )
  `, (err) => {
    if (err) console.error('[DB] Error creating daily_train_tickets table:', err);
  });

  // Orders Table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'PENDING',
      total_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('[DB] Error creating orders table:', err);
  });

  // Order Items Table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      passenger_id INTEGER NOT NULL,
      train_no TEXT NOT NULL,
      seat_type TEXT NOT NULL,
      price REAL NOT NULL,
      departure_date TEXT NOT NULL,
      from_station TEXT NOT NULL,
      to_station TEXT NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(passenger_id) REFERENCES passengers(id)
    )
  `, (err) => {
    if (err) console.error('[DB] Error creating order_items table:', err);
  });
});

module.exports = db;
