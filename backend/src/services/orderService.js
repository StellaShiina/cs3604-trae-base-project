const db = require('../database/init_db');

const getPrice = (seatType) => {
  const prices = {
    'business_seat': 500,
    'first_class': 300,
    'second_class': 100,
    'hard_sleeper': 200,
    'hard_seat': 100,
    'no_seat': 50
  };
  return prices[seatType] || 100;
};

const createOrder = async (userId, orderData) => {
  const { trainNo, seatType, passengers, fromStation, toStation, departureDate } = orderData;
  
  if (!passengers || passengers.length === 0) {
    throw new Error('Please select at least one passenger');
  }

  const unitPrice = getPrice(seatType);
  const totalAmount = unitPrice * passengers.length;

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // 1. Create Order
      db.run(
        `INSERT INTO orders (user_id, status, total_amount) VALUES (?, 'PENDING', ?)`,
        [userId, totalAmount],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            return reject(err);
          }
          const orderId = this.lastID;

          // 2. Create Order Items
          const stmt = db.prepare(`
            INSERT INTO order_items (order_id, passenger_id, train_no, seat_type, price, departure_date, from_station, to_station)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          let completed = 0;
          let hasError = false;

          passengers.forEach(p => {
            stmt.run(orderId, p.id, trainNo, seatType, unitPrice, departureDate, fromStation, toStation, (err) => {
              if (hasError) return;
              if (err) {
                hasError = true;
                db.run('ROLLBACK');
                return reject(err);
              }
              completed++;
              if (completed === passengers.length) {
                stmt.finalize();
                
                // 3. Update Seat Availability (Simplified: just decrement count)
                // In real app, check availability first. Here assume available.
                const seatCol = seatType; // e.g. 'second_class'
                db.run(
                  `UPDATE daily_train_tickets SET ${seatCol} = ${seatCol} - ? WHERE train_no = ? AND date = ?`,
                  [passengers.length, trainNo, departureDate],
                  (err) => {
                     if (err) {
                         db.run('ROLLBACK');
                         return reject(err);
                     }
                     db.run('COMMIT');
                     resolve({ id: orderId, status: 'PENDING', totalAmount });
                  }
                );
              }
            });
          });
        }
      );
    });
  });
};

module.exports = {
  createOrder
};
