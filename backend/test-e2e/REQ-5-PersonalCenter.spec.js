const { test, expect } = require('@playwright/test');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.db');

test.describe('REQ-5: Personal Center', () => {
  const testUser = 'personal_test_user';
  const testPwd = 'Password123';
  const testID = '110101199001015555';
  const testPhone = '13800135555';
  let orderId;

  test.beforeAll(async () => {
      const db = new sqlite3.Database(dbPath);
      await new Promise((resolve, reject) => {
         db.serialize(() => {
             // Cleanup
             db.run('DELETE FROM users WHERE username = ? OR id_number = ?', [testUser, testID]);
             
             // Insert User
             db.run('INSERT INTO users (username, password, name, id_type, id_number, phone) VALUES (?, ?, ?, ?, ?, ?)', 
                 [testUser, testPwd, 'Personal User', '1', testID, testPhone]);
                 
             // Get User ID and Create Order
             db.get('SELECT id FROM users WHERE username = ?', [testUser], (err, row) => {
                 if (row) {
                     const userId = row.id;
                     
                     // Insert Order (PAID)
                     db.run(`INSERT INTO orders (user_id, status, total_price, created_at) VALUES (?, 'PAID', 100, datetime('now'))`, [userId], function(err) {
                        orderId = this.lastID;
                        
                        // Insert Order Item
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
    await modal.locator('input[placeholder*="证件号后4位"]').fill('5555');
    await modal.locator('button:has-text("获取验证码")').click();
    await modal.locator('input[placeholder*="验证码"]').fill('123456');
    await modal.locator('button:has-text("确定")').click();
    await expect(page).toHaveURL('http://localhost:5173/');
  });

  test('Personal Center Dashboard', async ({ page }) => {
    // Navigate to Personal Center
    await page.goto('http://localhost:5173/personal-center');
    
    // Check Sidebar (use specific selector or first)
    await expect(page.locator('div').filter({ hasText: '个人中心' }).first()).toBeVisible();
    await expect(page.locator('div').filter({ hasText: '订单中心' }).first()).toBeVisible();
    
    // Check Welcome
    await expect(page.locator('text=Personal User')).toBeVisible(); // Name check
    await expect(page.locator('text=欢迎您登录中国铁路客户服务中心网站')).toBeVisible();
  });

  test('Order List', async ({ page }) => {
    await page.goto('http://localhost:5173/personal-center?tab=orders');
    
    // Check Order presence (Use specific container or text pattern)
    // Order ID might be part of a larger string "订单号: 10"
    await expect(page.locator(`text=订单号: ${orderId}`)).toBeVisible();
    await expect(page.locator('text=G27').first()).toBeVisible();
    await expect(page.locator('text=PAID').first()).toBeVisible(); // Status
  });

  test('Passenger Management', async ({ page }) => {
    await page.goto('http://localhost:5173/personal-center?tab=passengers');

    // Handle alerts
    page.on('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });

    // 1. Add Passenger
    await page.click('button:has-text("添加乘车人")');
    await page.locator('text=姓名').locator('..').locator('input').fill('Test Pass');
    await page.locator('text=证件号码').locator('..').locator('input').fill('110101199001011234');
    await page.click('button:has-text("保存")');

    // 2. Verify existence
    await expect(page.locator('text=Test Pass')).toBeVisible();
    await expect(page.locator('text=110101199001011234')).toBeVisible();

    // 3. Delete Passenger
    await page.locator('tr:has-text("Test Pass")').locator('button:has-text("删除")').click();

    // 4. Verify removal
    await expect(page.locator('text=Test Pass')).not.toBeVisible();
  });
});
