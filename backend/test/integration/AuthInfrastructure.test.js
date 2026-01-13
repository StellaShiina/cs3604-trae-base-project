import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../src/index';
import db from '../../src/database/init_db';

describe('Auth Infrastructure', () => {
  it('should have /api/auth/register endpoint returning 501', async () => {
    const res = await request(app).post('/api/auth/register');
    expect(res.status).toBe(501);
  });

  it('should have /api/auth/login endpoint returning 501', async () => {
    const res = await request(app).post('/api/auth/login');
    expect(res.status).toBe(501);
  });

  it('should have users table in database', async () => {
    return new Promise((resolve, reject) => {
      // Give it a moment for init_db to run
      setTimeout(() => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
          if (err) reject(err);
          try {
            expect(row).toBeDefined();
            expect(row.name).toBe('users');
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      }, 100); 
    });
  });
});