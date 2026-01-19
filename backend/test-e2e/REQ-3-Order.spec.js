const { test, expect } = require('@playwright/test');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.db');

test.describe('REQ-3: Order Submission', () => {
   const testUser = 'order_test_user_unique';
   const testPwd = 'Password123';
   const testID = '110101199001017777';
   const testPhone = '13800137777';

   test.beforeAll(async () => {
      const db = new sqlite3.Database(dbPath);
      await new Promise((resolve, reject) => {
          db.serialize(() => {
              db.run('DELETE FROM users WHERE username = ? OR id_number = ? OR phone = ?', [testUser, testID, testPhone]);
              db.run('REPLACE INTO users (username, password, name, id_type, id_number, phone) VALUES (?, ?, ?, ?, ?, ?)', 
                  [testUser, testPwd, 'Order User', '1', testID, testPhone]);
             db.get('SELECT id FROM users WHERE username = ?', [testUser], (err, row) => {
                 if (row) {
                     db.run('INSERT INTO passengers (user_id, name, id_type, id_number, type) VALUES (?, ?, ?, ?, ?)',
                         [row.id, 'Order User', '1', testID, '成人']);
                     db.run('INSERT INTO passengers (user_id, name, id_type, id_number, type) VALUES (?, ?, ?, ?, ?)',
                         [row.id, 'Frequent Passenger', '1', '110101199001019999', '成人']);
                 }
                 resolve();
             });
         });
      });
      db.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login');
    await page.locator('input[placeholder*="用户名"]').fill(testUser);
    await page.locator('input[placeholder*="密码"]').fill(testPwd);
    await page.locator('button:has-text("立即登录")').click();
    
    // Modal
    const modal = page.locator('.login-modal');
    await expect(modal).toBeVisible();
    await modal.locator('input[placeholder*="证件号后4位"]').fill('7777');
    await modal.locator('button:has-text("获取验证码")').click();
    await modal.locator('input[placeholder*="验证码"]').fill('123456');
    await modal.locator('button:has-text("确定")').click();
    
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('Booking Flow', async ({ page }) => {
    // 1. Search Ticket
    await page.goto('http://localhost:5173/search?from=北京&to=上海&date=2025-12-20');
    
    // 2. Click Booking (Pre-condition: G27 exists)
    await page.locator('tr:has-text("G27") button:has-text("预订")').click();
    
    // 3. Verify Order Page
    await expect(page).toHaveURL(/.*order/);
    await expect(page.locator('text=列车信息')).toBeVisible();
    await expect(page.locator('text=G27')).toBeVisible();
    
    // 4. Select Passenger (Frequent Passenger)
    await page.check('text=Frequent Passenger');
    
    // 5. Submit Order
    await page.click('button:has-text("提交订单")');
    
    // 6. Verify Payment Page
    await expect(page).toHaveURL(/.*payment/);
  });
});
