const express = require('express');
const router = express.Router();
const ticketService = require('../services/ticketService');

// GET /api/v1/tickets
router.get('/', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const result = await ticketService.search(from, to, date);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
