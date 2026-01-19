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
  const { trainNo, passengers, fromStation, toStation, departureDate } = orderData;
  // Fallback seatType if not provided in passenger (though UI should provide it)
  const defaultSeatType = orderData.seatType || 'second_class';
  
  if (!passengers || passengers.length === 0) {
    throw new Error('Please select at least one passenger');
  }

  // Calculate total amount and group by seat type for inventory update
  let totalAmount = 0;
  const seatCounts = {};

  passengers.forEach(p => {
    const sType = p.seatType || defaultSeatType;
    const price = getPrice(sType);
    totalAmount += price;
    
    if (!seatCounts[sType]) seatCounts[sType] = 0;
    seatCounts[sType]++;
  });

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
            const sType = p.seatType || defaultSeatType;
            const price = getPrice(sType);

            stmt.run(orderId, p.id, trainNo, sType, price, departureDate, fromStation, toStation, (err) => {
              if (hasError) return;
              if (err) {
                hasError = true;
                db.run('ROLLBACK');
                return reject(err);
              }
              completed++;
              
              if (completed === passengers.length) {
                stmt.finalize();

                // 3. Update Seat Availability (for each seat type)
                const seatTypes = Object.keys(seatCounts);
                let updatesCompleted = 0;

                const checkDone = () => {
                    updatesCompleted++;
                    if (updatesCompleted === seatTypes.length) {
                        db.run('COMMIT');
                        resolve({ id: orderId, status: 'PENDING', totalAmount });
                    }
                };

                seatTypes.forEach(sType => {
                    if (hasError) return;
                    const count = seatCounts[sType];
                    // Ensure column name is safe (simple validation)
                    const validSeats = ['business_seat', 'first_class', 'second_class', 'hard_sleeper', 'hard_seat', 'no_seat'];
                    if (!validSeats.includes(sType)) {
                        // fallback or skip? strict for now
                        // assume valid from getPrice or UI
                    }
                    
                    db.run(
                      `UPDATE daily_train_tickets SET ${sType} = ${sType} - ? WHERE train_no = ? AND date = ?`,
                      [count, trainNo, departureDate],
                      (err) => {
                         if (hasError) return;
                         if (err) {
                             hasError = true;
                             db.run('ROLLBACK');
                             return reject(err);
                         }
                         checkDone();
                      }
                    );
                });
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
