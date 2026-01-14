const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

// Middleware to ensure user is logged in is assumed to be running before this router or mounted globally
// req.user should be available.

// Get passengers for current user
router.get('/', (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }

  const sql = 'SELECT * FROM passengers WHERE user_id = ?';
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Database error', error: err.message });
    }
    res.json({
      code: 200,
      message: 'Success',
      data: rows
    });
  });
});

// Add new passenger
router.post('/', (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }

  const { name, idType, idNumber, phone, type } = req.body;
  if (!name || !idType || !idNumber || !type) {
    return res.status(400).json({ code: 400, message: 'Missing required fields' });
  }

  // Check for duplicate passenger for this user (name + idNumber check)
  // Assuming a user cannot have two passengers with same ID number.
  db.get('SELECT id FROM passengers WHERE user_id = ? AND (id_number = ? OR name = ?)', [userId, idNumber, name], (err, row) => {
    if (err) return res.status(500).json({ code: 500, message: 'Database error', error: err.message });
    if (row) {
        return res.status(400).json({ code: 400, message: '该联系人已存在，请使用不同的姓名和证件' });
    }

    const sql = `INSERT INTO passengers (user_id, name, id_type, id_number, phone, type) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  
    db.run(sql, [userId, name, idType, idNumber, phone, type], function(err) {
      if (err) {
        return res.status(500).json({ code: 500, message: 'Database error', error: err.message });
      }
      res.status(201).json({
        code: 201,
        message: 'Passenger added successfully',
        data: {
          id: this.lastID,
          userId,
          name,
          idType,
          idNumber,
          phone,
          type
        }
      });
    });
  });
});

// Delete passenger
router.delete('/:id', (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'Unauthorized' });
  }

  const passengerId = req.params.id;
  
  // Ensure the passenger belongs to the user
  const sql = 'DELETE FROM passengers WHERE id = ? AND user_id = ?';
  db.run(sql, [passengerId, userId], function(err) {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Database error', error: err.message });
    }
    if (this.changes === 0) {
        return res.status(404).json({ code: 404, message: 'Passenger not found or not authorized' });
    }
    res.json({
      code: 200,
      message: 'Passenger deleted successfully'
    });
  });
});

module.exports = router;
