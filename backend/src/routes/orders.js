const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// Create Order
router.post('/', (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }

  const { trainId, fromStationId, toStationId, departureDate, passengers } = req.body;

  if (!trainId || !fromStationId || !toStationId || !passengers || passengers.length === 0) {
    return res.status(400).json({ code: 400, message: 'Missing required fields' });
  }

  // Start Transaction (Serialized mode in SQLite is default for single connection, but for safety we chain)
  db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    const insertOrderSql = `
      INSERT INTO orders (user_id, train_id, from_station_id, to_station_id, departure_date, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending_payment', datetime('now'))
    `;

    db.run(insertOrderSql, [userId, trainId, fromStationId, toStationId, departureDate], function(err) {
      if (err) {
        db.run("ROLLBACK");
        return res.status(500).json({ code: 500, message: 'Failed to create order', error: err.message });
      }

      const orderId = this.lastID;
      const insertTicketSql = `
        INSERT INTO order_tickets (order_id, passenger_id, seat_type, price)
        VALUES (?, ?, ?, ?)
      `;

      const stmt = db.prepare(insertTicketSql);
      let errorOccurred = false;

      passengers.forEach(p => {
        stmt.run([orderId, p.passengerId, p.seatType, p.price], (err) => {
          if (err) errorOccurred = true;
        });
      });

      stmt.finalize(() => {
        if (errorOccurred) {
          db.run("ROLLBACK");
          return res.status(500).json({ code: 500, message: 'Failed to create order tickets' });
        }

        db.run("COMMIT", (err) => {
          if (err) {
            return res.status(500).json({ code: 500, message: 'Commit failed' });
          }
          res.status(201).json({
            code: 201,
            message: 'Order created successfully',
            data: {
              orderId: orderId
            }
          });
        });
      });
    });
  });
});

module.exports = router;
