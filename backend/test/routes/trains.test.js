const request = require('supertest');
const express = require('express');
const trainRoutes = require('../../src/routes/trains');
const db = require('../../src/database/init_db');

const app = express();
app.use(express.json());
app.use('/api/trains', trainRoutes);

describe('Train Routes Unit Test', () => {
  it('GET /api/trains/:id should return 404 for non-existent train', async () => {
    // Mock db.get to return null
    const originalGet = db.get;
    db.get = (sql, params, callback) => {
      callback(null, null);
    };

    const res = await request(app).get('/api/trains/999');
    expect(res.status).toBe(404);

    // Restore
    db.get = originalGet;
  });
});
