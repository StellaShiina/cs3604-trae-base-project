import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import app from '../../src/index';
import db from '../../src/database/init_db';

describe('Order Booking Integration', () => {
  let authToken;
  let userId;
  let passengerId;
  let trainId;
  let fromStationId;
  let toStationId;

  beforeAll(async () => {
    // Setup User and Token
    await new Promise((resolve) => {
      db.serialize(() => {
        db.run('DELETE FROM users');
        db.run('DELETE FROM orders');
        db.run('DELETE FROM order_items');
        db.run('DELETE FROM passengers');
        
        db.run(`INSERT INTO users (username, password, phone, id_number, passenger_type) VALUES ('booking_user', 'pass123', '13800138000', '110101199001011234', '成人')`, function(err) {
            userId = this.lastID;
             resolve();
        });
      });
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'booking_user', password: 'pass123', idLast4: '1234', smsCode: '123456' });
    authToken = loginRes.body.data.token;

    // Get Train and Station IDs from seeded data (or seed if missing, but init_db seeds them)
    // We assume init_db has run.
    await new Promise((resolve) => {
        db.get("SELECT id FROM trains WHERE train_number = 'G1'", (err, row) => {
            trainId = row ? row.id : 1;
            db.get("SELECT id FROM stations WHERE name = '北京南'", (err, row) => {
                fromStationId = row ? row.id : 1;
                db.get("SELECT id FROM stations WHERE name = '上海虹桥'", (err, row) => {
                    toStationId = row ? row.id : 2;
                    resolve();
                });
            });
        });
    });

    // Create a passenger for the user
    await new Promise((resolve) => {
        db.run(`INSERT INTO passengers (user_id, name, id_type, id_number, type) VALUES (?, 'Passenger1', '身份证', '110101199001011234', '成人')`, [userId], function(err) {
            passengerId = this.lastID;
            resolve();
        });
    });
  });

  it('POST /api/orders should create a new order', async () => {
    const orderData = {
      trainId: trainId,
      fromStationId: fromStationId,
      toStationId: toStationId,
      departureDate: '2023-10-01',
      passengers: [
        { passengerId: passengerId, seatType: '二等座', price: 553.0 }
      ]
    };

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send(orderData);

    expect(res.status).toBe(201);
    expect(res.body.code).toBe(201);
    expect(res.body.data).toHaveProperty('orderId');

    // Verify DB
    const orderId = res.body.data.orderId;
    await new Promise((resolve, reject) => {
        db.get("SELECT * FROM orders WHERE id = ?", [orderId], (err, row) => {
            if (err) reject(err);
            expect(row).toBeTruthy();
            expect(row.status).toBe('pending_payment');
            resolve();
        });
    });

    await new Promise((resolve, reject) => {
        db.get("SELECT * FROM order_items WHERE order_id = ?", [orderId], (err, row) => {
            if (err) reject(err);
            expect(row).toBeTruthy();
            expect(row.passenger_id).toBe(passengerId);
            expect(row.seat_type).toBe('二等座');
            resolve();
        });
    });
  });

  it('POST /api/orders should fail with missing fields', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ trainId: trainId }); // Missing other fields

    expect(res.status).toBe(400);
  });
});
