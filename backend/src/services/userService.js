const db = require('../database/init_db');
const bcrypt = require('bcrypt');

const checkAvailability = (field, value) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id FROM users WHERE ${field} = ?`, [value], (err, row) => {
      if (err) reject(err);
      else resolve(!!row);
    });
  });
};

const createVerificationCode = (phone) => {
  const code = '123456'; // Mock code
  const expiresAt = Date.now() + 60000; // 1 min (timestamp)

  return new Promise((resolve, reject) => {
    db.run(`INSERT OR REPLACE INTO verification_codes (phone, code, expires_at) VALUES (?, ?, ?)`, 
      [phone, code, expiresAt], 
      function(err) {
        if (err) reject(err);
        else resolve(code);
      }
    );
  });
};

const verifyCode = (phone, code) => {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM verification_codes WHERE phone = ?`, [phone], (err, row) => {
      if (err) reject(err);
      else if (!row) resolve(false);
      else {
        if (new Date(row.expires_at) < new Date()) resolve(false);
        else if (row.code !== code) resolve(false);
        else resolve(true);
      }
    });
  });
};

const createUser = async (userData) => {
  const { username, password, real_name, id_type, id_number, phone, email, user_type, verificationCode } = userData;

  // Verify code first
  if (verificationCode) {
      const isValid = await verifyCode(phone, verificationCode);
      if (!isValid) throw new Error('验证码错误或已失效');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      const stmt = db.prepare(`
        INSERT INTO users (username, password, real_name, id_type, id_number, phone, email, user_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(username, hashedPassword, real_name, id_type, id_number, phone, email, user_type || 'normal', function(err) {
        if (err) {
          db.run('ROLLBACK');
          return reject(err);
        }
        
        const userId = this.lastID;

        // Create Passenger
        const passengerStmt = db.prepare(`
          INSERT INTO passengers (user_id, real_name, id_type, id_number, phone, passenger_type, is_self)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        passengerStmt.run(userId, real_name, id_type, id_number, phone, 'adult', 1, function(err) {
          if (err) {
             db.run('ROLLBACK');
             return reject(err);
          }
          
          db.run('COMMIT');
          resolve({ id: userId, username });
        });
        passengerStmt.finalize();
      });
      stmt.finalize();
    });
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

const findUserByLoginId = (loginId) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?', 
      [loginId, loginId, loginId], 
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
};

const validateUser = async (username, password) => {
  const user = await findUserByLoginId(username);
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

const verifyLogin2FA = async (loginId, password, idLast4, code) => {
    const user = await findUserByLoginId(loginId);
    if (!user) throw new Error('用户名或密码错误');

    // 1. Check Code
    const isCodeValid = await verifyCode(user.phone, code);
    if (!isCodeValid) throw new Error('验证码错误');

    // 2. Check Password
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('用户名或密码错误');

    // 3. Check ID Last 4
    if (!user.id_number.endsWith(idLast4)) throw new Error('证件号码后四位错误');

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

module.exports = {
  createUser,
  findUserByUsername,
  findUserByLoginId,
  validateUser,
  verifyLogin2FA,
  checkAvailability,
  createVerificationCode,
  verifyCode
};
