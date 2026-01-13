import request from 'supertest';
import { describe, it, expect } from 'vitest';
import express from 'express';
import authRouter from '../../src/routes/auth';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes Unit Test', () => {
  it('should return 501 for POST /auth/register', async () => {
    const res = await request(app).post('/auth/register');
    expect(res.status).toBe(501);
  });

  it('should return 501 for POST /auth/login', async () => {
    const res = await request(app).post('/auth/login');
    expect(res.status).toBe(501);
  });
});