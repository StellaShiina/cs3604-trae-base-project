import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/index';
import db from '../../src/database/init_db';

describe('Auth API - Forgot Password', () => {
  beforeAll(async () => {
    await new Promise(resolve => db.run('DELETE FROM users', resolve));
    await new Promise(resolve => {
        db.run(`INSERT INTO users (username, password, id_number, phone, id_type) VALUES (?, ?, ?, ?, ?)`, 
            ['forgot_api_user', 'oldpass', '110101199001018888', '13600136000', '中国居民身份证'], resolve);
    });
  });

  it('should verify user exists', async () => {
    const res = await request(app).post('/api/auth/forgot-password/verify-user').send({
      phone: '13600136000',
      idNumber: '110101199001018888',
      idType: '中国居民身份证'
    });
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
  });

  it('should verify sms code', async () => {
    const res = await request(app).post('/api/auth/forgot-password/verify-sms').send({
      phone: '13600136000',
      smsCode: '123456'
    });
    expect(res.status).toBe(200);
  });

  it('should reset password', async () => {
    const res = await request(app).post('/api/auth/forgot-password/reset').send({
      phone: '13600136000',
      newPassword: 'newpassapi'
    });
    expect(res.status).toBe(200);
    
    // Verify in DB
    const user = await new Promise(resolve => {
        db.get("SELECT password FROM users WHERE phone = ?", ['13600136000'], (err, row) => resolve(row));
    });
    expect(user.password).toBe('newpassapi');
  });
});
