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

module.exports = {
  listPassengers
};
