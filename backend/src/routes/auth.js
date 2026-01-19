const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(400).json({ 
      success: false, 
      error: { code: 'REGISTER_FAILED', message: error.message } 
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userService.validateUser(username, password);
    
    if (user) {
      // In a real app, generate JWT here
      res.json({ success: true, data: { user, token: 'mock-jwt-token' } });
    } else {
      res.status(401).json({ 
        success: false, 
        error: { code: 'AUTH_FAILED', message: 'Invalid username or password' } 
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'SERVER_ERROR', message: error.message } 
    });
  }
});

module.exports = router;
