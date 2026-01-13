import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('API Root', () => {
  it('should return 200 OK for GET /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ code: 200, message: 'Backend Ready' });
  });
});