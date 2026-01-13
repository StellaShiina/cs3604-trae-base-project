import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import authRouter from '../../src/routes/auth';
import db from '../../src/database/init_db';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes Integration Test', () => {
  const TEST_USER = {
    username: 'testuser_integ',
    password: 'password123',
    realName: 'Test User',
    idType: '1',
    idNumber: '110101199001019999',
    phone: '13800139999',
    passengerType: '1'
  };

  const cleanup = async () => {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM users WHERE username = ?", [TEST_USER.username], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  beforeEach(async () => {
    await cleanup();
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(TEST_USER);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(200);
      expect(res.body.message).toBe('Registration successful');
    });

    it('should return 409 if user already exists', async () => {
      // Register once
      await request(app).post('/auth/register').send(TEST_USER);
      
      // Register again
      const res = await request(app)
        .post('/auth/register')
        .send(TEST_USER);

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('User already exists');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: TEST_USER.username
          // Missing other fields
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with correct credentials', async () => {
       // Register first
       await request(app).post('/auth/register').send(TEST_USER);

       const res = await request(app)
        .post('/auth/login')
        .send({
          username: TEST_USER.username,
          password: TEST_USER.password,
          idLast4: TEST_USER.idNumber.slice(-4),
          smsCode: '123456'
        });
       
       expect(res.status).toBe(200);
       expect(res.body.code).toBe(200);
       expect(res.body.data).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
       // Register first
       await request(app).post('/auth/register').send(TEST_USER);

       const res = await request(app)
        .post('/auth/login')
        .send({
          username: TEST_USER.username,
          password: 'wrongpassword',
          idLast4: TEST_USER.idNumber.slice(-4),
          smsCode: '123456'
        });

      expect(res.status).toBe(401);
    });
  });
});
