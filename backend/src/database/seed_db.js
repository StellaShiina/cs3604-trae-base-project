const db = require('./init_db');
// Note: In a real app, use bcrypt.hash. For simplicity/speed in seed, we might use plain text or simple hash if bcrypt issue arises, 
// but assuming bcrypt is available as per package.json.
const bcrypt = require('bcrypt'); 

const seed = async () => {
  console.log('Seeding database...');
  
  const passwordHash = await bcrypt.hash('123456', 10);

  db.serialize(() => {
    // Seed Admin/Test User
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO users (username, password, real_name, id_type, id_number, phone, email, user_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run('admin', passwordHash, 'Admin User', '1', '110101199001011234', '13800138000', 'admin@12306.com', 'admin');
    stmt.run('testuser', passwordHash, 'Test User', '1', '110101199001015678', '13900139000', 'test@12306.com', 'normal');

    stmt.finalize();
    
    console.log('Seeding complete.');
  });
};

seed();
