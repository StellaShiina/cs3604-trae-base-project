
const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

router.get('/me', (req, res) => {
  const userId = req.user.id;
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.get(sql, [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ code: 500, message: err.message });
    }
    if (!row) {
      return res.status(404).json({ code: 404, message: 'User not found' });
    }
    // Remove sensitive info
    const { password, ...user } = row;
    res.json({ code: 200, data: user });
  });
});

module.exports = router;
