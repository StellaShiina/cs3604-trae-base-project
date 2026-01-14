const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use :memory: for tests to avoid contention and ensure clean state
const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : path.resolve(__dirname, '../../database.db');

let db;

if (process.env.NODE_ENV === 'test') {
  if (!global._testDbInstance) {
    global._testDbInstance = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database', err.message);
      } else {
        console.log(`Connected to the SQLite database (TEST MODE). ID: ${Math.random()}`);
        // initTables() moved out to ensure synchronous queuing
      }
    });
  }
  db = global._testDbInstance;
  // Queue initTables immediately if we just created it (or even if existing? No, only once)
  if (!global._testDbInitialized) {
      initTables();
      global._testDbInitialized = true;
  }
} else {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database', err.message);
    } else {
      console.log(`Connected to the SQLite database. ID: ${Math.random()}`);
    }
  });
  initTables();
}

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

  db.serialize(() => {
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

    // Legacy table, kept for compatibility if needed, but train_station_mapping is preferred
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

    db.run(`CREATE TABLE IF NOT EXISTS train_station_mapping (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_id INTEGER NOT NULL,
      station_id INTEGER NOT NULL,
      stop_order INTEGER NOT NULL,
      arrival_time TEXT,
      departure_time TEXT,
      duration INTEGER,
      FOREIGN KEY(train_id) REFERENCES trains(id),
      FOREIGN KEY(station_id) REFERENCES stations(id)
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

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      passenger_id INTEGER,
      seat_type TEXT,
      price REAL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(passenger_id) REFERENCES passengers(id)
    )`, () => {
        seedData();
    });
  });
}

function seedData() {
  db.get("SELECT count(*) as count FROM stations", (err, row) => {
    if (err) return console.error(err.message);
    if (row.count === 0) {
      console.log('Seeding data...');
      
      db.serialize(() => {
        // Seed Stations
        const stations = [
          ['北京南', 'VNP', '北京'],
          ['上海虹桥', 'AOH', '上海'],
          ['天津南', 'TIP', '天津'],
          ['济南西', 'JGK', '济南'],
          ['南京南', 'NKH', '南京']
        ];
        const stmtStation = db.prepare("INSERT INTO stations (name, code, city) VALUES (?, ?, ?)");
        stations.forEach(s => stmtStation.run(s));
        stmtStation.finalize();

        // Seed Trains
        const trains = [
          ['G1', 'G'],
          ['G2', 'G']
        ];
        const stmtTrain = db.prepare("INSERT INTO trains (train_number, type) VALUES (?, ?)");
        trains.forEach(t => stmtTrain.run(t));
        stmtTrain.finalize(() => {
           seedMappings();
        });
      });
    }
  });
}

function seedMappings() {
    // Get IDs
    db.all("SELECT id, name FROM stations", (err, stations) => {
        if(err) return console.error(err);
        const stationMap = {};
        stations.forEach(s => stationMap[s.name] = s.id);

        db.all("SELECT id, train_number FROM trains", (err, trains) => {
            if(err) return console.error(err);
            const trainMap = {};
            trains.forEach(t => trainMap[t.train_number] = t.id);

            const mappings = [
                // G1: Beijing Nan -> Shanghai Hongqiao
                [trainMap['G1'], stationMap['北京南'], 1, null, '09:00', 0],
                [trainMap['G1'], stationMap['天津南'], 2, '09:30', '09:32', 2],
                [trainMap['G1'], stationMap['济南西'], 3, '10:15', '10:17', 2],
                [trainMap['G1'], stationMap['南京南'], 4, '11:30', '11:32', 2],
                [trainMap['G1'], stationMap['上海虹桥'], 5, '12:30', null, 0],

                // G2: Shanghai Hongqiao -> Beijing Nan
                [trainMap['G2'], stationMap['上海虹桥'], 1, null, '14:00', 0],
                [trainMap['G2'], stationMap['南京南'], 2, '14:58', '15:00', 2],
                [trainMap['G2'], stationMap['济南西'], 3, '16:15', '16:17', 2],
                [trainMap['G2'], stationMap['天津南'], 4, '17:00', '17:02', 2],
                [trainMap['G2'], stationMap['北京南'], 5, '17:30', null, 0]
            ];

            const stmt = db.prepare("INSERT INTO train_station_mapping (train_id, station_id, stop_order, arrival_time, departure_time, duration) VALUES (?, ?, ?, ?, ?, ?)");
            mappings.forEach(m => stmt.run(m));
            stmt.finalize(() => console.log('Seeding completed.'));
        });
    });
}


module.exports = db;
