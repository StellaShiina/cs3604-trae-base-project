import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll } from 'vitest';
import orderRoutes from '../../src/routes/orders';
import db from '../../src/database/init_db';

const app = express();
app.use(express.json());

// Mock Auth Middleware
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    if (token === 'mock-jwt-token') {
      req.user = { id: 1, username: 'test_user' };
    }
  }
  next();
});

app.use('/api/orders', orderRoutes);

describe('Order Payment Integration Test', () => {
  let orderId;
  const authToken = 'mock-jwt-token';

  beforeAll(async () => {
    // 1. Clean up & Setup
    await new Promise((resolve) => {
      db.serialize(() => {
        db.run('DELETE FROM orders');
        // 2. Insert a pending order for User 1
        db.run(`
          INSERT INTO orders (user_id, train_id, from_station_id, to_station_id, departure_date, status, created_at)
          VALUES (1, 1, 1, 2, '2023-10-01', 'pending_payment', datetime('now'))
        `, function(err) {
          orderId = this.lastID;
          resolve();
        });
      });
    });
  });

  it('PUT /api/orders/:id/status should pay order', async () => {
    const res = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'paid' });
    
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('paid');

    // Verify DB
    await new Promise((resolve) => {
      db.get('SELECT status FROM orders WHERE id = ?', [orderId], (err, row) => {
        expect(row.status).toBe('paid');
        resolve();
      });
    });
  });
});
