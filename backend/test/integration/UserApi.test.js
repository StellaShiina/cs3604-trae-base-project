
const request = require('supertest');
const app = require('../../src/index');
const db = require('../../src/database/init_db');
import { describe, it, expect, beforeAll } from 'vitest';

describe('REQ-3-1: User Profile API', () => {
  beforeAll(() => {
    // Seed a user
    return new Promise((resolve, reject) => {
        const sql = `INSERT OR REPLACE INTO users (id, username, password, real_name, id_number, phone, email, passenger_type) 
                     VALUES (1, 'testuser', 'password123', 'Test User', '123456789012345678', '13800138000', 'test@example.com', 'ADULT')`;
        db.run(sql, [], (err) => {
          if (err) reject(err);
          else resolve();
        });
    });
  });

  it('GET /api/users/me should return 401 without token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/users/me should return user info with valid token', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer mock-jwt-token-1');
    
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.username).toBe('testuser');
    expect(res.body.data.real_name).toBe('Test User');
    expect(res.body.data.email).toBe('test@example.com');
    // Should not return password
    expect(res.body.data.password).toBeUndefined();
  });
});
