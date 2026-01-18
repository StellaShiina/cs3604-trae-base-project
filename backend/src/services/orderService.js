const db = require('../database/init_db');

const orderService = {
  createOrder: (userId, orderData) => {
    return new Promise((resolve, reject) => {
      const { trainCode, fromStation, toStation, date, passengers, totalPrice } = orderData;
      
      // Transaction-like wrapper (SQLite serialize ensures sequential execution)
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const insertOrderSql = `INSERT INTO orders (user_id, status, total_price) VALUES (?, 'PENDING', ?)`;
        db.run(insertOrderSql, [userId, totalPrice], function(err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          const orderId = this.lastID;
          
          const insertItemSql = `INSERT INTO order_items 
            (order_id, passenger_id, train_code, departure_station, arrival_station, departure_date, seat_type, ticket_type, price) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          
          const stmt = db.prepare(insertItemSql);
          let errorOccurred = false;

          passengers.forEach(p => {
            stmt.run([orderId, p.passengerId, trainCode, fromStation, toStation, date, p.seatType, p.ticketType, p.price], (err) => {
              if (err) errorOccurred = true;
            });
          });
          
          stmt.finalize(() => {
            if (errorOccurred) {
              db.run('ROLLBACK');
              reject(new Error('Failed to insert order items'));
            } else {
              db.run('COMMIT');
              resolve({ code: 0, data: { orderId } });
            }
          });
        });
      });
    });
  },

  getPassengers: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM passengers WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return reject(err);
        resolve({ code: 0, data: rows });
      });
    });
  }
};

module.exports = orderService;
