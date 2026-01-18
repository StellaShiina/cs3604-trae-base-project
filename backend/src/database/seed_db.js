const db = require('./init_db');

/**
 * Guide model instructions:
 * 1. Must use INSERT OR IGNORE or INSERT OR REPLACE to prevent errors when running the script repeatedly.
 * 2. Must define UNIQUE constraints (in init_db.js) to support OR IGNORE logic.
 * 3. Insert data according to foreign key dependency order (parent table before child table).
 */
function seed() {
  db.serialize(() => {
    // [INSERT OR IGNORE statements added by the model as needed here]
    // Stations
    db.run(`INSERT OR IGNORE INTO stations (name, pinyin) VALUES ('北京', 'beijing')`);
    db.run(`INSERT OR IGNORE INTO stations (name, pinyin) VALUES ('上海', 'shanghai')`);
    db.run(`INSERT OR IGNORE INTO stations (name, pinyin) VALUES ('北京南', 'beijingnan')`);
    db.run(`INSERT OR IGNORE INTO stations (name, pinyin) VALUES ('上海虹桥', 'shanghaihongqiao')`);

    // Trains
    db.run(`INSERT OR IGNORE INTO trains (code, type) VALUES ('G27', 'G')`);
    db.run(`INSERT OR IGNORE INTO trains (code, type) VALUES ('D17', 'D')`);

    // Routes Helper
    const insertRoute = (trainCode, stationName, order, arr, dep) => {
       db.run(`INSERT INTO routes (train_id, station_id, station_name, arrival_time, departure_time, stop_order)
         SELECT t.id, s.id, s.name, ?, ?, ?
         FROM trains t, stations s
         WHERE t.code = ? AND s.name = ?
         AND NOT EXISTS (SELECT 1 FROM routes WHERE train_id=t.id AND station_id=s.id)
       `, [arr, dep, order, trainCode, stationName]);
    };

    insertRoute('G27', '北京南', 1, '19:00', '19:00', 1);
    insertRoute('G27', '上海', 2, '23:35', '23:35', 2);
    
    insertRoute('D17', '北京', 1, '19:13', '19:13', 1);
    insertRoute('D17', '上海', 2, '07:31', '07:31', 2);
  });
}

// Support running directly from the terminal: node src/database/seed_db.js
if (require.main === module) {
  seed();
}

module.exports = seed;