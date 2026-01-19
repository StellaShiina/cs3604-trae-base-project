const db = require('../database/init_db');
const bcrypt = require('bcrypt');

const createUser = async (userData) => {
  const { username, password, real_name, id_type, id_number, phone, email, user_type } = userData;
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO users (username, password, real_name, id_type, id_number, phone, email, user_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(username, hashedPassword, real_name, id_type, id_number, phone, email, user_type || 'normal', function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, username });
      }
    });
    stmt.finalize();
  });
};

const findUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const validateUser = async (username, password) => {
  const user = await findUserByUsername(username);
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

module.exports = {
  createUser,
  findUserByUsername,
  validateUser
};
