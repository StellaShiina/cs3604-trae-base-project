const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    
    const order = await orderService.createOrder(userId, req.body);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
