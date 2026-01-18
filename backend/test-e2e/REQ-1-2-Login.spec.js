const { test, expect } = require('@playwright/test');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.db');

function runSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath);
    db.run(sql, params, function(err) {
      db.close();
      if (err) reject(err);
      else resolve(this);
    });
  });
}

test.describe('REQ-1-2: User Login', () => {
  const testUser = 'login_test_user';
  const testPwd = 'Password123';
  const testID = '110101199001018888';
  const testPhone = '13900139999';

  test.beforeAll(async () => {
    // Clean up
    await runSQL('DELETE FROM users WHERE username = ?', [testUser]);
    // Insert user
    await runSQL(`
      INSERT INTO users (username, password, name, id_type, id_number, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [testUser, testPwd, 'Login User', '1', testID, testPhone]);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
  });

  test('Login Flow Success', async ({ page }) => {
    // 1. Fill Login Form
    await page.locator('input[placeholder*="用户名"]').fill(testUser);
    await page.locator('input[placeholder*="密码"]').fill(testPwd);
    await page.locator('button:has-text("立即登录")').click();

    // 2. Modal appears
    const modal = page.locator('.login-modal'); // Assuming class
    await expect(modal).toBeVisible();

    // 3. Fill ID Last 4 and Get Code
    await modal.locator('input[placeholder*="证件号后4位"]').fill('8888');
    await modal.locator('button:has-text("获取验证码")').click();
    
    // Expect countdown
    await expect(modal.locator('button', { hasText: '秒' })).toBeVisible();

    // 4. Fill Code and Confirm
    await modal.locator('input[placeholder*="验证码"]').fill('123456');
    await modal.locator('button:has-text("确定")').click(); // Or Login confirm button

    // 5. Expect Home
    await expect(page).toHaveURL('http://localhost:5173/'); // or just /
    
    // 6. Expect Header Update
    await expect(page.locator('text=您好，login_test_user')).toBeVisible();
    
    // 7. Check LocalStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const username = await page.evaluate(() => localStorage.getItem('username'));
    expect(token).toBeTruthy();
    expect(username).toBe(testUser);
  });

  test('Login Failure - Wrong Password', async ({ page }) => {
    await page.locator('input[placeholder*="用户名"]').fill(testUser);
    await page.locator('input[placeholder*="密码"]').fill('WrongPass'); // Wrong
    await page.locator('button:has-text("立即登录")').click();

    const modal = page.locator('.login-modal');
    await expect(modal).toBeVisible();

    await modal.locator('input[placeholder*="证件号后4位"]').fill('8888');
    await modal.locator('button:has-text("获取验证码")').click();
    await modal.locator('input[placeholder*="验证码"]').fill('123456');
    
    // Handle Alert
    const dialogPromise = page.waitForEvent('dialog');
    await modal.locator('button:has-text("确定")').click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('密码错误'); // Or similar
    await dialog.dismiss();
  });
});
