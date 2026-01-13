import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/index';
import db from '../../src/database/init_db';

describe('Auth API - Login', () => {
  beforeAll(async () => {
    // Seed user
    await new Promise(resolve => db.run('DELETE FROM users', resolve));
    await new Promise(resolve => {
        db.run(`INSERT INTO users (username, password, id_number, phone) VALUES (?, ?, ?, ?)`, 
            ['api_user', 'pass123', '110101199001015678', '13900139000'], resolve);
    });
  });

  it('should return 200 for valid credentials and verification', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'api_user',
      password: 'pass123',
      idLast4: '5678',
      smsCode: '123456'
    });
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'api_user',
      password: 'wrongpassword',
      idLast4: '5678',
      smsCode: '123456'
    });
    expect(res.status).toBe(401);
  });

  it('should return 401 for wrong ID last 4 digits', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'api_user',
      password: 'pass123',
      idLast4: '0000',
      smsCode: '123456'
    });
    expect(res.status).toBe(401);
  });

  it('should return 401 for wrong SMS code', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'api_user',
      password: 'pass123',
      idLast4: '5678',
      smsCode: '999999'
    });
    expect(res.status).toBe(401);
  });
});
