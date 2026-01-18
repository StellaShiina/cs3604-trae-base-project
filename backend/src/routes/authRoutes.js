const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// GET /api/v1/auth/check-username
router.get('/check-username', async (req, res) => {
  try {
    const { username } = req.query;
    const result = await authService.checkUsername(username);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// POST /api/v1/auth/send-sms-code
router.post('/send-sms-code', async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await authService.sendSmsCode(phone);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// POST /api/v1/auth/send-login-sms
router.post('/send-login-sms', async (req, res) => {
  try {
    const { username, idLast4 } = req.body;
    const result = await authService.sendLoginSms(username, idLast4);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password, idLast4, smsCode } = req.body;
    const result = await authService.login(username, password, idLast4, smsCode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// POST /api/v1/auth/verify-user
router.post('/verify-user', async (req, res) => {
  try {
    const { phone, idType, idNumber } = req.body;
    const result = await authService.verifyUser(phone, idType, idNumber);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// POST /api/v1/auth/send-forgot-sms
router.post('/send-forgot-sms', async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await authService.sendForgotSms(phone);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, smsCode, newPassword } = req.body;
    const result = await authService.resetPassword(phone, smsCode, newPassword);
    res.json(result);
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;
