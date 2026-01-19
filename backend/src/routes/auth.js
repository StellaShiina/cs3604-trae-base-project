const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// GET /api/auth/check-availability
router.get('/check-availability', async (req, res) => {
  try {
    const { field, value } = req.query;
    if (!['username', 'phone', 'id_number'].includes(field)) {
      return res.status(400).json({ success: false, error: 'Invalid field' });
    }
    const exists = await userService.checkAvailability(field, value);
    res.json({ success: true, exists });
  } catch (error) {
    console.error('[API] check-availability error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/send-sms
router.post('/send-sms', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'Phone required' });
    
    const code = await userService.createVerificationCode(phone);
    console.log(`[Mock SMS] Code for ${phone}: ${code}`);
    res.json({ success: true, message: 'Code sent' });
  } catch (error) {
    console.error('[API] send-sms error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/send-login-sms
router.post('/send-login-sms', async (req, res) => {
  try {
    const { loginId } = req.body;
    const user = await userService.findUserByLoginId(loginId);
    
    if (!user) {
        return res.status(404).json({ success: false, error: '用户不存在' });
    }

    const code = await userService.createVerificationCode(user.phone);
    console.log(`[Mock SMS] Login Code for ${user.username} (${user.phone}): ${code}`);
    res.json({ success: true, message: 'Code sent' });
  } catch (error) {
    console.error('[API] send-login-sms error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login-verify
router.post('/login-verify', async (req, res) => {
    try {
        const { loginId, password, idLast4, code } = req.body;
        const user = await userService.verifyLogin2FA(loginId, password, idLast4, code);
        
        // Mock JWT
        res.json({ success: true, data: { user, token: 'mock-jwt-token-2fa' } });
    } catch (error) {
        console.error('[API] login-verify error:', error);
        res.status(401).json({ success: false, error: { message: error.message } });
    }
});

// POST /api/auth/forgot-password/verify-user
router.post('/forgot-password/verify-user', async (req, res) => {
    try {
        const { phone, idType, idNumber } = req.body;
        const exists = await userService.verifyUserForReset(phone, idType, idNumber);
        if (exists) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: { message: '用户信息不匹配' } });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
});

// POST /api/auth/forgot-password/send-sms
router.post('/forgot-password/send-sms', async (req, res) => {
    try {
        const { phone } = req.body;
        const code = await userService.createVerificationCode(phone);
        console.log(`[Mock SMS] Forgot Password Code for ${phone}: ${code}`);
        res.json({ success: true, message: 'Code sent' });
    } catch (error) {
        res.status(500).json({ success: false, error: { message: error.message } });
    }
});

// POST /api/auth/forgot-password/reset
router.post('/forgot-password/reset', async (req, res) => {
    try {
        const { phone, code, newPassword } = req.body;
        await userService.resetPassword(phone, code, newPassword);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ success: false, error: { message: error.message } });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Register Error:', error);
    const message = error.message.includes('UNIQUE constraint') 
      ? 'Duplicate entry' 
      : error.message;
    res.status(400).json({ 
      success: false, 
      error: { code: 'REGISTER_FAILED', message } 
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
