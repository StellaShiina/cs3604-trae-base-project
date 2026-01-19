const db = require('../database/init_db');

const listPassengers = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM passengers WHERE user_id = ?`;
    db.all(query, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const addPassenger = (userId, passengerData) => {
  const { realName, idType, idNumber, phone, passengerType } = passengerData;
  return new Promise((resolve, reject) => {
    // Check for duplicates first
    const checkQuery = `SELECT id FROM passengers WHERE user_id = ? AND (id_number = ? OR phone = ?)`;
    db.get(checkQuery, [userId, idNumber, phone], (err, row) => {
        if (err) return reject(err);
        if (row) {
            return reject(new Error('该联系人已存在，请使用不同的姓名和证件'));
        }

        const query = `INSERT INTO passengers (user_id, real_name, id_type, id_number, phone, passenger_type) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(query, [userId, realName, idType, idNumber, phone, passengerType || 'adult'], function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, ...passengerData });
        });
    });
  });
};

const deletePassenger = (userId, passengerId) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM passengers WHERE id = ? AND user_id = ?`;
    db.run(query, [passengerId, userId], function(err) {
      if (err) reject(err);
      else if (this.changes === 0) reject(new Error('Passenger not found or not authorized'));
      else resolve({ success: true });
    });
  });
};

module.exports = {
  listPassengers,
  addPassenger,
  deletePassenger
};
