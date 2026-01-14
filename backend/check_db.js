const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Users in DB:', rows);
    }
  });
});

db.close();