const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

router.post('/register', (req, res) => {
  const { username, password, realName, idType, idNumber, phone, passengerType } = req.body;

  if (!username || !password || !idNumber || !phone) {
    return res.status(400).json({ code: 400, message: 'Missing required fields' });
  }

  // Check if user exists
  db.get("SELECT id FROM users WHERE username = ? OR id_number = ? OR phone = ?", [username, idNumber, phone], (err, row) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Database error' });
    }
    if (row) {
      return res.status(409).json({ code: 409, message: 'User already exists' });
    }

    // Insert new user
    const sql = `INSERT INTO users (username, password, real_name, id_type, id_number, phone, passenger_type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [username, password, realName, idType, idNumber, phone, passengerType], function(err) {
      if (err) {
        return res.status(500).json({ code: 500, message: 'Failed to register user' });
      }
      res.status(200).json({ code: 200, message: 'Registration successful', userId: this.lastID });
    });
  });
});

router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

module.exports = router;