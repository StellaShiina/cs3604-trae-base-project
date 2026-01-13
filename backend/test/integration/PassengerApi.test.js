
const request = require('supertest');
const app = require('../../src/index');
const db = require('../../src/database/init_db');
import { describe, it, expect, beforeAll } from 'vitest';

describe('REQ-3-2: Passenger API', () => {
  beforeAll(() => {
    // Seed user and passengers
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("DELETE FROM passengers");
            db.run(`INSERT OR REPLACE INTO users (id, username, password, real_name, id_number, phone, email, passenger_type) 
                    VALUES (1, 'testuser', 'password123', 'Test User', '123456789012345678', '13800138000', 'test@example.com', 'ADULT')`);
            db.run(`INSERT INTO passengers (user_id, name, id_type, id_number, phone, type) 
                    VALUES (1, 'Passenger A', 'ID_CARD', '111111111111111111', '13900139000', 'ADULT')`);
            db.run(`INSERT INTO passengers (user_id, name, id_type, id_number, phone, type) 
                    VALUES (1, 'Passenger B', 'ID_CARD', '222222222222222222', '13900139001', 'CHILD')`, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
  });

  it('GET /api/passengers should return list', async () => {
    const res = await request(app)
      .get('/api/passengers')
      .set('Authorization', 'Bearer mock-jwt-token-1');
    
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Passenger A');
    expect(res.body.data[1].name).toBe('Passenger B');
  });
});
