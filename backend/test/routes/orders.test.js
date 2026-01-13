import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import express from 'express';
import bodyParser from 'body-parser';
import orderRoutes from '../../src/routes/orders';
import db from '../../src/database/init_db';

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  req.user = { id: 1 }; // Mock logged in user
  next();
});
app.use('/api/orders', orderRoutes);

describe('Order Routes', () => {
  beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  beforeEach(async () => {
    await new Promise((resolve) => {
        db.run('DELETE FROM orders', () => {
             db.run('DELETE FROM order_tickets', resolve);
        });
    });
    // Ensure User 1 exists
    await new Promise((resolve) => db.run("INSERT OR IGNORE INTO users (id, username, password) VALUES (1, 'testuser', 'pwd')", resolve));
    // Ensure Train/Stations exist for FK
    await new Promise((resolve) => db.run("INSERT OR IGNORE INTO trains (id, train_number, type) VALUES (1, 'G123', 'HighSpeed')", resolve));
  });

  it('should create an order with passengers', async () => {
    const orderData = {
      trainId: 1,
      fromStationId: 101, // Assuming these exist or FK checks skipped if not strictly enforced in test setup
      toStationId: 102,
      departureDate: '2023-10-01',
      passengers: [
        { passengerId: 10, seatType: '二等座', price: 100.0 },
        { passengerId: 11, seatType: '二等座', price: 100.0 }
      ]
    };

    const res = await request(app).post('/api/orders').send(orderData);
    expect(res.status).toBe(201);
    expect(res.body.data.orderId).toBeDefined();

    // Check DB
    const order = await new Promise(resolve => {
      db.get('SELECT * FROM orders WHERE id = ?', [res.body.data.orderId], (err, row) => resolve(row));
    });
    expect(order).toBeDefined();
    expect(order.status).toBe('pending_payment');

    const tickets = await new Promise(resolve => {
        db.all('SELECT * FROM order_tickets WHERE order_id = ?', [res.body.data.orderId], (err, rows) => resolve(rows));
    });
    expect(tickets).toHaveLength(2);
  });
});
