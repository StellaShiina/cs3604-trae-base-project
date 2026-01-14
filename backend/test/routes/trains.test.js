import request from 'supertest';
import express from 'express';
import trainRoutes from '../../src/routes/trains';
import db from '../../src/database/init_db';
import { describe, it, expect } from 'vitest';

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
