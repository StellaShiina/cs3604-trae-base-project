
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import app from '../../src/index';
import db from '../../src/database/init_db';

describe('Order API Integration', () => {
  let server;
  let authToken;
  let userId;

  beforeAll(async () => {
    server = await new Promise(resolve => {
      const s = app.listen(0, () => resolve(s));
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(async () => {
    // Clean up
    await new Promise(resolve => db.run('DELETE FROM order_items', resolve));
    await new Promise(resolve => db.run('DELETE FROM orders', resolve));
    await new Promise(resolve => db.run('DELETE FROM passengers', resolve));
    await new Promise(resolve => db.run('DELETE FROM users', resolve));

    // Create user
    await new Promise(resolve => {
      db.run(`INSERT INTO users (username, password, real_name, id_type, id_number, phone, passenger_type) 
              VALUES ('testuser', 'password123', 'Test User', 'ID_CARD', '111111111111111111', '13800138000', 'ADULT')`, 
              function(err) {
        if (err) console.error('Insert User Error:', err);
        userId = this.lastID;
        console.log('Created User ID:', userId);
        resolve();
      });
    });
    
    // Mock token
    authToken = 'mock-jwt-token-' + userId;
    console.log('Auth Token:', authToken);

    // Seed orders
    // Order 1: Unfinished
    await new Promise(resolve => {
        db.run(`INSERT INTO orders (user_id, train_id, from_station_id, to_station_id, departure_date, status, created_at)
                VALUES (?, 1, 1, 2, '2023-10-01', '0', datetime('now'))`, [userId], function() {
            const orderId = this.lastID;
            db.run(`INSERT INTO order_items (order_id, passenger_id, seat_type, price) VALUES (?, 1, '二等座', 100.0)`, [orderId], resolve);
        });
    });

    // Order 2: Finished (Paid)
    await new Promise(resolve => {
        db.run(`INSERT INTO orders (user_id, train_id, from_station_id, to_station_id, departure_date, status, created_at)
                VALUES (?, 1, 1, 2, '2023-10-02', '1', datetime('now'))`, [userId], function() {
             const orderId = this.lastID;
             db.run(`INSERT INTO order_items (order_id, passenger_id, seat_type, price) VALUES (?, 1, '二等座', 100.0)`, [orderId], resolve);
        });
    });
  });

  it('GET /api/orders should return all orders for user', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('GET /api/orders?status=0 should return only unfinished orders', async () => {
    const res = await request(app)
      .get('/api/orders?status=0')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.code).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('0');
  });
});
