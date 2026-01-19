const express = require('express');
const router = express.Router();
const ticketService = require('../services/ticketService');
const { successResponse, errorResponse } = require('../utils/responseWrapper');

// GET /api/tickets/query
router.get('/query', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    if (!from || !to || !date) {
      return res.status(400).json(errorResponse('Missing required parameters: from, to, date', 'INVALID_PARAMS'));
    }

    const tickets = await ticketService.searchTickets(from, to, date);
    res.json(successResponse(tickets));
  } catch (error) {
    console.error('Ticket search error:', error);
    res.status(500).json(errorResponse('Internal Server Error'));
  }
});

module.exports = router;
