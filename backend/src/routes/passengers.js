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

module.exports = router;
