
import sqlite3 from 'sqlite3';
import path from 'path';
import { describe, it, expect, beforeAll } from 'vitest';

const dbPath = path.resolve(process.cwd(), 'database.db');
const verboseSqlite = sqlite3.verbose();

describe('REQ-4: Order Infrastructure', () => {
  let db;

  beforeAll(async () => {
    return new Promise((resolve, reject) => {
      db = new verboseSqlite.Database(dbPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  it('should have orders table', async () => {
    const tableCheck = await new Promise((resolve, reject) => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'", (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    expect(tableCheck).toBeDefined();
  });

  it('should have order_items table', async () => {
    const tableCheck = await new Promise((resolve, reject) => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='order_items'", (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
    expect(tableCheck).toBeDefined();
  });
});
