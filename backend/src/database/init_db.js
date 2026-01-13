const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initTables();
  }
});

function initTables() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    real_name TEXT,
    id_type TEXT,
    id_number TEXT UNIQUE,
    phone TEXT UNIQUE,
    email TEXT,
    passenger_type TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating users table', err.message);
    } else {
      console.log('Users table initialized.');
    }
  });
}

module.exports = db;
