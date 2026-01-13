const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use __dirname to ensure db file is always in backend directory, regardless of CWD
const dbPath = path.resolve(__dirname, '../../database.db');
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

  db.run(`CREATE TABLE IF NOT EXISTS stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS trains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id INTEGER,
    from_station_id INTEGER,
    to_station_id INTEGER,
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration TEXT,
    FOREIGN KEY(train_id) REFERENCES trains(id),
    FOREIGN KEY(from_station_id) REFERENCES stations(id),
    FOREIGN KEY(to_station_id) REFERENCES stations(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    id_type TEXT NOT NULL,
    id_number TEXT NOT NULL,
    phone TEXT,
    type TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    train_id INTEGER,
    from_station_id INTEGER,
    to_station_id INTEGER,
    departure_date TEXT,
    status TEXT,
    created_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(train_id) REFERENCES trains(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS order_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    passenger_id INTEGER,
    seat_type TEXT,
    price REAL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(passenger_id) REFERENCES passengers(id)
  )`);
}

module.exports = db;
