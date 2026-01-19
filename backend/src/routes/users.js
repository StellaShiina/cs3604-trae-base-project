const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// GET /api/users/me
router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    }
    const user = await userService.getUserById(userId);
    if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;
