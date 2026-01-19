const express = require('express');
const router = express.Router();
const passengerService = require('../services/passengerService');

// GET /api/passengers
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const passengers = await passengerService.listPassengers(userId);
    res.json({ success: true, data: passengers });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// POST /api/passengers
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const passenger = await passengerService.addPassenger(userId, req.body);
    res.json({ success: true, data: passenger });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// DELETE /api/passengers/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    await passengerService.deletePassenger(userId, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
