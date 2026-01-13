import request from 'supertest';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import express from 'express';
import bodyParser from 'body-parser';
import passengerRoutes from '../../src/routes/passengers';
import db from '../../src/database/init_db';

const app = express();
app.use(bodyParser.json());
// Mock auth middleware - in real app we'd have it, here we assume it passes user info
app.use((req, res, next) => {
  req.user = { id: 1, username: 'testuser' }; // Mock logged in user
  next();
});
app.use('/api/passengers', passengerRoutes);

describe('Passenger Routes', () => {
  beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for DB
  });

  beforeEach(async () => {
    await new Promise((resolve, reject) => {
        db.run('DELETE FROM passengers', (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
    // Seed user if needed (foreign key constraint) - Assuming user 1 exists or constraints ignored in sqlite default?
    // SQLite enforces FK if enabled. Let's ensure user 1 exists.
    await new Promise((resolve) => {
        db.run("INSERT OR IGNORE INTO users (id, username, password) VALUES (1, 'testuser', 'password')", resolve);
    });
  });

  it('should list passengers for the user', async () => {
    // Seed a passenger
    await new Promise((resolve) => {
      db.run(`INSERT INTO passengers (user_id, name, id_type, id_number, phone, type) 
              VALUES (1, '张三', '身份证', '123456789012345678', '13800138000', 'adult')`, resolve);
    });

    const res = await request(app).get('/api/passengers');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('张三');
  });

  it('should add a new passenger', async () => {
    const newPassenger = {
      name: '李四',
      idType: '身份证',
      idNumber: '987654321098765432',
      phone: '13900139000',
      type: 'adult'
    };

    const res = await request(app).post('/api/passengers').send(newPassenger);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();

    // Verify DB
    const dbRow = await new Promise((resolve) => {
      db.get('SELECT * FROM passengers WHERE name = ?', ['李四'], (err, row) => resolve(row));
    });
    expect(dbRow).toBeDefined();
    expect(dbRow.user_id).toBe(1);
  });
});
