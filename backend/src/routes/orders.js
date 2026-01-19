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

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const order = await orderService.getOrderById(req.params.id, userId);
    if (!order) {
        return res.status(404).json({ success: false, error: { message: 'Order not found' } });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// POST /api/orders/:id/pay
router.post('/:id/pay', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    await orderService.payOrder(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// POST /api/orders/:id/cancel
router.post('/:id/cancel', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    await orderService.cancelOrder(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
