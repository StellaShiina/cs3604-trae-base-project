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

router.get('/check-username', (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ code: 400, message: 'Username is required' });
  }

  db.get("SELECT id FROM users WHERE username = ?", [username], (err, row) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Database error' });
    }
    if (row) {
      return res.status(200).json({ code: 200, available: false, message: 'Username already exists' });
    }
    res.status(200).json({ code: 200, available: true, message: 'Username available' });
  });
});

router.post('/login', (req, res) => {
  const { username, password, idLast4, smsCode } = req.body;

  if (!username || !password || !idLast4 || !smsCode) {
    return res.status(400).json({ code: 400, message: 'Missing required fields' });
  }

  // 1. Verify SMS Code (Mock)
  if (smsCode !== '123456') {
    return res.status(401).json({ code: 401, message: 'Invalid SMS code' });
  }

  // 2. Find User
  db.get("SELECT * FROM users WHERE username = ? OR phone = ? OR email = ?", [username, username, username], (err, user) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ code: 401, message: 'Invalid credentials' });
    }

    // 3. Verify Password
    if (user.password !== password) {
      return res.status(401).json({ code: 401, message: 'Invalid credentials' });
    }

    // 4. Verify ID Last 4 Digits
    const actualIdLast4 = user.id_number.slice(-4);
    if (actualIdLast4 !== idLast4) {
      return res.status(401).json({ code: 401, message: 'Invalid ID verification' });
    }

    // Success
    res.status(200).json({ 
      code: 200, 
      message: 'Login successful',
      data: {
        userId: user.id,
        username: user.username,
        token: `mock-jwt-token-${user.id}`
      }
    });
  });
});

router.post('/send-sms', (req, res) => {
  // Mock SMS sending
  res.status(200).json({ code: 200, message: 'SMS sent successfully' });
});

router.post('/forgot-password/verify-user', (req, res) => {
  const { phone, idNumber } = req.body;
  if (!phone || !idNumber) {
    return res.status(400).json({ code: 400, message: 'Missing required fields' });
  }

  db.get("SELECT id FROM users WHERE phone = ? AND id_number = ?", [phone, idNumber], (err, row) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ code: 404, message: 'User not found or information mismatch' });
    }
    res.status(200).json({ code: 200, message: 'User verified' });
  });
});

router.post('/forgot-password/verify-sms', (req, res) => {
  const { phone, smsCode } = req.body;
  // Mock SMS verification
  if (smsCode === '123456') {
    res.status(200).json({ code: 200, message: 'Verification successful' });
  } else {
    res.status(400).json({ code: 400, message: 'Invalid verification code' });
  }
});

router.post('/forgot-password/reset', (req, res) => {
  const { phone, newPassword } = req.body;
  if (!phone || !newPassword) {
    return res.status(400).json({ code: 400, message: 'Missing required fields' });
  }

  const sql = "UPDATE users SET password = ? WHERE phone = ?";
  db.run(sql, [newPassword, phone], function(err) {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ code: 404, message: 'User not found' });
    }
    res.status(200).json({ code: 200, message: 'Password reset successful' });
  });
});

module.exports = router;