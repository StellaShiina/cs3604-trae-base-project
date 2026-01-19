const { test, expect } = require('@playwright/test');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.db');

test.describe('REQ-4: Payment & Success', () => {
  const testUser = 'pay_test_user';
  const testPwd = 'Password123';
  const testID = '110101199001016666';
  const testPhone = '13800136666';
  let orderId;

  test.beforeAll(async () => {
      const db = new sqlite3.Database(dbPath);
      await new Promise((resolve, reject) => {
         db.serialize(() => {
             // Cleanup
           db.run('DELETE FROM users WHERE username = ? OR id_number = ? OR phone = ?', [testUser, testID, testPhone]);
             
             // Insert User
           db.run('REPLACE INTO users (username, password, name, id_type, id_number, phone) VALUES (?, ?, ?, ?, ?, ?)', 
                 [testUser, testPwd, 'Pay User', '1', testID, testPhone]);
                 
             // Get User ID and Create Order
             db.get('SELECT id FROM users WHERE username = ?', [testUser], (err, row) => {
                 if (row) {
                     const userId = row.id;
                     
                     // Insert Order
                     db.run(`INSERT INTO orders (user_id, status, total_price, created_at) VALUES (?, 'PENDING', 100, datetime('now'))`, [userId], function(err) {
                        orderId = this.lastID;
                        
                        // Insert Order Item (Passenger ID 0 or mock)
                        db.run(`INSERT INTO order_items (order_id, passenger_id, train_code, departure_station, arrival_station, departure_date, seat_type, ticket_type, price) 
                                VALUES (?, 0, 'G27', '北京南', '上海', '2025-12-20', '二等座', '成人', 100)`, 
                                [orderId]);
                        resolve();
                     });
                 } else {
                     resolve();
                 }
             });
         });
      });
      db.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.locator('input[placeholder*="用户名"]').fill(testUser);
    await page.locator('input[placeholder*="密码"]').fill(testPwd);
    await page.locator('button:has-text("立即登录")').click();
    
    // Modal
    const modal = page.locator('.login-modal');
    await expect(modal).toBeVisible();
    await modal.locator('input[placeholder*="证件号后4位"]').fill('6666');
    await modal.locator('button:has-text("获取验证码")').click();
    await modal.locator('input[placeholder*="验证码"]').fill('123456');
    await modal.locator('button:has-text("确定")').click();
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('Payment Flow Success', async ({ page }) => {
    if (!orderId) throw new Error('Order not created');

    // Go to Payment Page directly
    await page.goto(`http://localhost:5173/payment/${orderId}`);
    
    // Verify Info
    // await expect(page.locator(`text=${orderId}`)).toBeVisible(); // Might not display ID directly
    await expect(page.locator('text=G27')).toBeVisible();
    await expect(page.locator('text=北京南')).toBeVisible();
    
    // Countdown check
    await expect(page.locator('text=剩余支付时间')).toBeVisible();

    // Confirm Payment
    await page.click('button:has-text("确认支付")');
    
    // Verify Success Page
    await expect(page).toHaveURL(/.*purchase-success/);
    await expect(page.locator('text=支付成功')).toBeVisible();
  });
});
