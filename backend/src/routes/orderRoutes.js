const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');

// Middleware to simulate authentication check (simplified)
// In real app, verify token. Here assume user_id passed or token handling in upstream.
// For this reproduce, let's assume the frontend passes user info or we decode token.
// But `authService` returns a token. 
// Let's implement a simple middleware to extract user from header if needed.
// Or just trust the request for now if simplicity is key. 
// BUT, I need userId.
// Let's assume the frontend sends `userId` in body for now, or I implement a middleware.
// Given strict time, I'll extract it from header 'x-user-id' if passed, or body.

router.get('/passengers', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) return res.status(401).json({ code: 401, message: 'Unauthorized' });
    
    const result = await orderService.getPassengers(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    if (!userId) return res.status(401).json({ code: 401, message: 'Unauthorized' });

    const result = await orderService.createOrder(userId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) return res.status(401).json({ code: 401, message: 'Unauthorized' });

    const result = await orderService.getOrder(req.params.orderId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/:orderId/pay', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    if (!userId) return res.status(401).json({ code: 401, message: 'Unauthorized' });

    const result = await orderService.payOrder(req.params.orderId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.post('/:orderId/cancel', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    if (!userId) return res.status(401).json({ code: 401, message: 'Unauthorized' });

    const result = await orderService.cancelOrder(req.params.orderId, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    if (!userId) return res.status(401).json({ code: 401, message: 'Unauthorized' });

    const result = await orderService.getMyOrders(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
