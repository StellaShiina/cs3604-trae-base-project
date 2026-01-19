const db = require('./init_db');
// Note: In a real app, use bcrypt.hash. For simplicity/speed in seed, we might use plain text or simple hash if bcrypt issue arises, 
// but assuming bcrypt is available as per package.json.
const bcrypt = require('bcrypt'); 

const seed = async () => {
  console.log('Seeding database...');
  
  const passwordHash = await bcrypt.hash('123456', 10);
  
  db.serialize(() => {
    // Seed Users
    const stmt = db.prepare(`INSERT OR REPLACE INTO users (username, password, real_name, id_type, id_number, phone, email, user_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run('admin_user', passwordHash, 'Admin User', '1', '110101199001011235', '13800138999', 'admin_new@12306.com', 'admin');
    stmt.run('testuser', passwordHash, '孔诗语', '1', '110101199001015678', '13900139000', 'test@12306.com', 'normal');
    stmt.finalize();

    // Seed Passengers for testuser
    // We need to get testuser ID. Since we just inserted/replaced, we can query it.
    db.get("SELECT id FROM users WHERE username = 'testuser'", (err, row) => {
        if (err || !row) {
            console.error('Failed to find testuser for passenger seeding');
            return;
        }
        const userId = row.id;
        const psgStmt = db.prepare(`INSERT OR REPLACE INTO passengers (user_id, real_name, id_type, id_number, phone, passenger_type, is_self) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        
        // Self
        psgStmt.run(userId, '孔诗语', '1', '110101199001015678', '13900139000', 'adult', 1);
        
        // Others
        psgStmt.run(userId, '杨璐', '1', '110101199502021234', '13912345678', 'adult', 0);
        psgStmt.run(userId, '张育宁', '1', '110101199803035678', '13987654321', 'student', 0);
        
        psgStmt.finalize();
    });

    // Seed Trains
    const trainStmt = db.prepare(`INSERT OR REPLACE INTO trains (train_no, train_type) VALUES (?, ?)`);
    trainStmt.run('G27', 'G');
    trainStmt.run('D17', 'D');
    trainStmt.finalize();

    // Seed Train Stations (G27: Beijing South -> Shanghai)
    // Clean existing stations for these trains to avoid duplicates on re-seed
    db.run("DELETE FROM train_stations WHERE train_no IN ('G27', 'D17')");
    
    const stationStmt = db.prepare(`INSERT INTO train_stations (train_no, station_name, arrival_time, departure_time, sequence_no) VALUES (?, ?, ?, ?, ?)`);
    // G27
    stationStmt.run('G27', '北京南', '19:00', '19:00', 1);
    stationStmt.run('G27', '济南西', '20:30', '20:32', 2);
    stationStmt.run('G27', '南京南', '22:30', '22:32', 3);
    stationStmt.run('G27', '上海', '23:35', '23:35', 4);
    
    // D17
    stationStmt.run('D17', '北京', '19:13', '19:13', 1);
    stationStmt.run('D17', '天津西', '20:00', '20:02', 2);
    stationStmt.run('D17', '南京', '06:00', '06:05', 3);
    stationStmt.run('D17', '上海松江', '07:31', '07:31', 4);
    stationStmt.finalize();

    // Seed Daily Tickets (Fixed Dates for Testing)
     const testDate = '2026-02-01';
     
     // Clean existing tickets for these dates/trains
     db.run(`DELETE FROM daily_train_tickets WHERE train_no IN ('G27', 'D17') AND date = ?`, [testDate]);
 
     const ticketStmt = db.prepare(`INSERT INTO daily_train_tickets (train_no, date, business_seat, first_class, second_class, hard_sleeper, hard_seat, no_seat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
     
     // G27
     ticketStmt.run('G27', testDate, 15, 12, 100, 0, 0, 0);
     
     // D17
     ticketStmt.run('D17', testDate, 0, 0, 200, 50, 0, 20);
     
     ticketStmt.finalize();

    console.log('Database seeded successfully.');
  });
};

seed();
