import request from 'supertest';
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../../src/index';
import db from '../../src/database/init_db';

describe('Ticket API', () => {
  beforeAll(async () => {
    // Wait for DB init
    await new Promise(resolve => setTimeout(resolve, 500));

    // Clear and Seed Data
    await new Promise(resolve => db.run('DELETE FROM schedules', resolve));
    await new Promise(resolve => db.run('DELETE FROM trains', resolve));
    await new Promise(resolve => db.run('DELETE FROM stations', resolve));

    // Seed Stations
    const stationIds = {};
    await new Promise(resolve => {
        db.run(`INSERT INTO stations (name, code, city) VALUES (?, ?, ?)`, ['北京南', 'VNP', 'Beijing'], function(err) {
            stationIds.bj = this.lastID;
            resolve();
        });
    });
    await new Promise(resolve => {
        db.run(`INSERT INTO stations (name, code, city) VALUES (?, ?, ?)`, ['上海虹桥', 'AOH', 'Shanghai'], function(err) {
            stationIds.sh = this.lastID;
            resolve();
        });
    });

    // Seed Train
    let trainId;
    await new Promise(resolve => {
        db.run(`INSERT INTO trains (train_number, type) VALUES (?, ?)`, ['G1', 'G'], function(err) {
            trainId = this.lastID;
            resolve();
        });
    });

    // Seed Schedule
    await new Promise(resolve => {
        db.run(`INSERT INTO schedules (train_id, from_station_id, to_station_id, departure_time, arrival_time, duration) VALUES (?, ?, ?, ?, ?, ?)`, 
        [trainId, stationIds.bj, stationIds.sh, '09:00', '13:00', '04:00'], resolve);
    });
  });

  it('should get all stations', async () => {
    const res = await request(app).get('/api/tickets/stations');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.find(s => s.name === '北京南')).toBeDefined();
  });

  it('should query tickets', async () => {
    const res = await request(app).get('/api/tickets/query').query({
        fromStation: '北京南',
        toStation: '上海虹桥',
        date: '2026-01-01' // Date logic might be mocked or ignored for MVP
    });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].trainNumber).toBe('G1');
  });

  it('should return empty for no match', async () => {
    const res = await request(app).get('/api/tickets/query').query({
        fromStation: '北京南',
        toStation: 'Unknown',
        date: '2026-01-01'
    });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});
