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

const getOrderById = (orderId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        o.id as order_id, o.status, o.total_amount, o.created_at,
        oi.id as item_id, oi.train_no, oi.seat_type, oi.price, oi.departure_date, oi.from_station, oi.to_station,
        p.real_name, p.id_number, p.passenger_type
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN passengers p ON oi.passenger_id = p.id
      WHERE o.id = ? AND o.user_id = ?
    `;
    
    db.all(sql, [orderId, userId], (err, rows) => {
      if (err) return reject(err);
      if (!rows || rows.length === 0) return resolve(null);
      
      // Group items
      const order = {
        id: rows[0].order_id,
        status: rows[0].status,
        totalAmount: rows[0].total_amount,
        createdAt: rows[0].created_at,
        items: rows.map(r => ({
          id: r.item_id,
          trainNo: r.train_no,
          seatType: r.seat_type,
          price: r.price,
          departureDate: r.departure_date,
          fromStation: r.from_station,
          toStation: r.to_station,
          passengerName: r.real_name,
          idNumber: r.id_number,
          passengerType: r.passenger_type
        }))
      };
      resolve(order);
    });
  });
};

const payOrder = (orderId, userId) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE orders SET status = 'PAID' WHERE id = ? AND user_id = ? AND status = 'PENDING'`,
      [orderId, userId],
      function(err) {
        if (err) return reject(err);
        if (this.changes === 0) return reject(new Error('Order not found or not pending'));
        resolve({ success: true });
      }
    );
  });
};

const cancelOrder = (orderId, userId) => {
  return new Promise((resolve, reject) => {
    // 1. Get Order Items to restore inventory
    db.all(
      `SELECT oi.train_no, oi.seat_type, oi.departure_date 
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.id = ? AND o.user_id = ? AND o.status = 'PENDING'`,
      [orderId, userId],
      (err, rows) => {
        if (err) return reject(err);
        if (!rows || rows.length === 0) return reject(new Error('Order not found or not pending'));
        
        // Aggregate
        const seatCounts = {}; // Key: "trainNo|date|seatType" -> count
        rows.forEach(r => {
            const key = `${r.train_no}|${r.departure_date}|${r.seat_type}`;
            if (!seatCounts[key]) seatCounts[key] = 0;
            seatCounts[key]++;
        });

        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          
          // 2. Update Status
          db.run(`UPDATE orders SET status = 'CANCELLED' WHERE id = ?`, [orderId], (err) => {
              if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
              }
              
              // 3. Restore Inventory
              const keys = Object.keys(seatCounts);
              let completed = 0;
              let hasError = false;
              
              if (keys.length === 0) { // Should not happen
                  db.run('COMMIT');
                  return resolve({ success: true });
              }

              const checkDone = () => {
                  completed++;
                  if (completed === keys.length) {
                      db.run('COMMIT');
                      resolve({ success: true });
                  }
              };

              keys.forEach(key => {
                  if (hasError) return;
                  const [trainNo, date, seatType] = key.split('|');
                  const count = seatCounts[key];
                  
                  // Validate seatType column
                  const validSeats = ['business_seat', 'first_class', 'second_class', 'hard_sleeper', 'hard_seat', 'no_seat'];
                  if (!validSeats.includes(seatType)) {
                       checkDone(); // Skip invalid?
                       return;
                  }

                  db.run(
                      `UPDATE daily_train_tickets SET ${seatType} = ${seatType} + ? WHERE train_no = ? AND date = ?`,
                      [count, trainNo, date],
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
          });
        });
      }
    );
  });
};

module.exports = {
  createOrder,
  getOrderById,
  payOrder,
  cancelOrder
};
