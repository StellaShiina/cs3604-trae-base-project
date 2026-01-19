const { test, expect } = require('@playwright/test');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.db');

const queryDB = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.get(sql, params, (err, row) => {
      db.close();
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const runDB = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.run(sql, params, function(err) {
      db.close();
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

test.describe('REQ-4 Payment Flow', () => {
  let orderId;
  let userId;

  test.beforeEach(async ({ page }) => {
    // 1. Login (Reuse login logic or just use seeded user)
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // 2FA
    await page.click('text=获取验证码');
    await page.waitForTimeout(2000); 
    const codeRecord = await queryDB("SELECT * FROM verification_codes ORDER BY expires_at DESC LIMIT 1");
    const code = codeRecord ? codeRecord.code : '123456';
    await page.fill('input[name="idLast4"]', '5678');
    await page.fill('input[name="code"]', code);
    await page.click('button.confirm-btn');
    await expect(page).toHaveURL('http://localhost:5173/');

    // 2. Create a PENDING Order directly in DB
    const user = await queryDB("SELECT id FROM users WHERE username = 'testuser'");
    userId = user.id;
    
    // Insert Order
    orderId = await runDB(
      `INSERT INTO orders (user_id, status, total_amount) VALUES (?, 'PENDING', 298.0)`,
      [userId]
    );

    // Insert Order Item
    await runDB(
      `INSERT INTO order_items (order_id, passenger_id, train_no, seat_type, price, departure_date, from_station, to_station)
       VALUES (?, ?, 'G27', 'second_class', 298.0, '2026-02-01', '北京南', '上海')`,
      [orderId, 1] // Assuming passenger 1 exists
    );
  });

  test('Load Payment Page and Display Info', async ({ page }) => {
    await page.goto(`http://localhost:5173/payment/${orderId}`);
    
    // Verify Info
    await expect(page.locator('text=G27')).toBeVisible();
    await expect(page.locator('text=北京南')).toBeVisible();
    await expect(page.locator('text=上海')).toBeVisible();
    
    // Check for price in table and total
    await expect(page.locator('.passenger-table').getByText('¥298')).toBeVisible();
    await expect(page.locator('.total-price').getByText('¥298')).toBeVisible();
    
    // Verify Countdown
    await expect(page.locator('.countdown')).toBeVisible();
  });

  test('Cancel Order', async ({ page }) => {
    await page.goto(`http://localhost:5173/payment/${orderId}`);
    
    // Setup dialog handler
    page.on('dialog', dialog => dialog.accept());
    
    // Click Cancel
    await page.click('text=取消订单');
    
    // Verify Redirect (to search or order list, let's assume search for now per spec)
    await expect(page).toHaveURL(/ticket-search/);
    
    // Verify DB Status
    const order = await queryDB("SELECT status FROM orders WHERE id = ?", [orderId]);
    expect(order.status).toBe('CANCELLED');
  });

  test('Pay Order Success', async ({ page }) => {
    await page.goto(`http://localhost:5173/payment/${orderId}`);
    
    // Click Pay
    await page.click('text=确认支付');
    
    // Verify Redirect
    await expect(page).toHaveURL(new RegExp(`/purchase-success/${orderId}`));
    
    // Verify Success Page Content
    await expect(page.locator('text=支付成功')).toBeVisible();
    
    // Verify DB Status
    const order = await queryDB("SELECT status FROM orders WHERE id = ?", [orderId]);
    expect(order.status).toBe('PAID');
  });
});
