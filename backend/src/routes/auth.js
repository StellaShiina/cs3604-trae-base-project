const express = require('express');
const router = express.Router();
const db = require('../database/init_db');

router.post('/register', (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

router.post('/login', (req, res) => {
  res.status(501).json({ message: 'Not Implemented' });
});

module.exports = router;