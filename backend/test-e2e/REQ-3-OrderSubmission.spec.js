const { test, expect } = require('@playwright/test');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.db');

// Helper to query DB
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

test.describe('REQ-3 Order Submission', () => {
  
  test.beforeEach(async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]'); // "立即登录"

    // 2FA Modal
    await expect(page.locator('.login-2fa-modal')).toBeVisible();
    await page.click('text=获取验证码');
    
    // Wait for code to be generated
    await page.waitForTimeout(2000); 
    const codeRecord = await queryDB("SELECT * FROM verification_codes ORDER BY expires_at DESC LIMIT 1");
    const code = codeRecord ? codeRecord.code : '123456';
    
    await page.fill('input[name="idLast4"]', '5678'); // Seeded ID: 110101199001015678
    await page.fill('input[name="code"]', code);
    await page.click('button.confirm-btn');

    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('User can search ticket, select passenger and submit order', async ({ page }) => {
    // 2. Go to Ticket Search (or navigate from Home)
    // Direct navigation for speed, but user flow is better.
    await page.goto('http://localhost:5173/ticket-search?from=北京南&to=上海&date=2026-02-01');
    
    // 3. Find a ticket and click Book
    // Wait for results
    await expect(page.locator('.ticket-table')).toBeVisible();
    // Click first "预订" button
    await page.locator('.book-btn').first().click();

    // 4. Verify Navigation to Order Page
    await expect(page).toHaveURL(/\/order/);
    
    // 5. Select Passenger
    // Wait for passengers to load
    await expect(page.locator('.passenger-item').first()).toBeVisible();
    // Click "孔诗语" (assuming seeded)
    await page.locator('.passenger-item', { hasText: '孔诗语' }).click();

    // Verify added to ticket pool
    await expect(page.locator('.ticket-pool table tbody tr')).toHaveCount(1);
    
    // 6. Submit Order
    await page.click('.submit-btn');

    // 7. Verify Navigation to Payment (Success)
    // Expect URL to contain /payment/
    await expect(page).toHaveURL(/\/payment\/\d+/);
    
    // Get Order ID from URL
    const url = page.url();
    const orderId = url.split('/').pop();

    // 8. Triple Verification: Check Database
    const order = await queryDB("SELECT * FROM orders WHERE id = ?", [orderId]);
    expect(order).not.toBeNull();
    expect(order.status).toBe('PENDING');
    
    const orderItem = await queryDB("SELECT * FROM order_items WHERE order_id = ?", [orderId]);
    expect(orderItem).not.toBeNull();
    expect(orderItem.passenger_id).toBeDefined(); // Should match passenger ID
    
    console.log(`Verified Order ${orderId} created in DB`);
  });
});
