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
        INSERT INTO order_items (order_id, passenger_id, seat_type, price)
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

// Get Orders List
router.get('/', (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }

  const status = req.query.status;
  let sql = `
    SELECT 
        o.id, o.train_id, o.from_station_id, o.to_station_id, o.departure_date, o.status, o.created_at,
        t.train_number,
        fs.name as from_station_name,
        ts.name as to_station_name
    FROM orders o
    LEFT JOIN trains t ON o.train_id = t.id
    LEFT JOIN stations fs ON o.from_station_id = fs.id
    LEFT JOIN stations ts ON o.to_station_id = ts.id
    WHERE o.user_id = ?
  `;
  
  const params = [userId];

  if (status !== undefined) {
    sql += ' AND o.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY o.created_at DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Database error', error: err.message });
    }

    // Optionally fetch items for each order? 
    // For now, let's just return the order details. 
    // If frontend needs ticket details in the list, we can add it.
    // Let's add a simple loop to fetch items if needed, but for MVP list, maybe not.
    // However, the "Unfinished Order" tab usually shows payment amount which comes from tickets.
    // Let's just return orders for now.

    res.json({
      code: 200,
      message: 'Success',
      data: rows
    });
  });
});

// Update Order Status (Cancel, Pay)
router.put('/:id/status', (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!['cancelled', 'paid'].includes(status)) {
    return res.status(400).json({ code: 400, message: 'Invalid status' });
  }

  // Check if order exists and belongs to user
  const checkSql = 'SELECT id, status FROM orders WHERE id = ? AND user_id = ?';
  db.get(checkSql, [id, userId], (err, order) => {
    if (err) return res.status(500).json({ code: 500, message: 'Database error' });
    if (!order) return res.status(404).json({ code: 404, message: 'Order not found' });

    // State machine check
    if (status === 'cancelled' && order.status !== 'pending_payment') {
      return res.status(400).json({ code: 400, message: 'Cannot cancel order in current status' });
    }
    // if (status === 'paid' && order.status !== 'pending_payment') ...

    const updateSql = 'UPDATE orders SET status = ? WHERE id = ?';
    db.run(updateSql, [status, id], function(err) {
      if (err) return res.status(500).json({ code: 500, message: 'Update failed' });
      
      res.json({
        code: 200,
        message: 'Order status updated',
        data: { id, status }
      });
    });
  });
});

module.exports = router;
