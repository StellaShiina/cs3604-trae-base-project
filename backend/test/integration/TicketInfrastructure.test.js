import sqlite3 from 'sqlite3';
import path from 'path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Direct DB connection for verification
// Note: In ESM, __dirname is not available directly, but we can assume relative path or use process.cwd()
const dbPath = path.resolve(process.cwd(), 'database.db');
const verboseSqlite = sqlite3.verbose();

describe('REQ-2: Ticket Infrastructure & Seeding', () => {
  let db;

  beforeAll(async () => {
    return new Promise((resolve, reject) => {
      db = new verboseSqlite.Database(dbPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterAll(() => {
    db.close();
  });

  it('should have stations table with seed data', async () => {
    const row = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM stations WHERE name = '北京南'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    expect(row).toBeDefined();
    expect(row.code).toBe('VNP');
  });

  it('should have trains table with seed data', async () => {
    const row = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM trains WHERE train_number = 'G1'", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    expect(row).toBeDefined();
    expect(row.type).toBe('G');
  });

  it('should have train_station_mapping table with data', async () => {
    // Check if table exists
    const tableCheck = await new Promise((resolve, reject) => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='train_station_mapping'", (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    expect(tableCheck).toBeDefined();

    // Check data for G1
    const rows = await new Promise((resolve, reject) => {
      db.all(`
        SELECT tsm.*, s.name as station_name, t.train_number 
        FROM train_station_mapping tsm
        JOIN trains t ON tsm.train_id = t.id
        JOIN stations s ON tsm.station_id = s.id
        WHERE t.train_number = 'G1'
        ORDER BY tsm.stop_order
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].station_name).toBe('北京南');
    expect(rows[rows.length - 1].station_name).toBe('上海虹桥');
  });
});
