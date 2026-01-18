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

test.describe('REQ-1-3: Forgot Password', () => {
  const testUser = 'forgot_test_user';
  const oldPwd = 'OldPassword123';
  const newPwd = 'NewPassword123';
  const testID = '110101199001017777';
  const testPhone = '13900137777';

  test.beforeAll(async () => {
    await runSQL('DELETE FROM users WHERE username = ?', [testUser]);
    await runSQL(`
      INSERT INTO users (username, password, name, id_type, id_number, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [testUser, oldPwd, 'Forgot User', '1', testID, testPhone]);
  });

  test('Reset Password Flow', async ({ page }) => {
    await page.goto('http://localhost:5173/forgot-password');

    // Step 1: Verify User
    await page.locator('input[placeholder*="手机号码"]').fill(testPhone);
    await page.locator('input[placeholder*="证件号码"]').fill(testID);
    // ID Type defaults to 1
    // Assume there is a "Verify" or "Next" button
    // Scenario says "提交校验后进入..."
    // Let's assume a "Next" button.
    const nextBtn = page.locator('button', { hasText: '下一步' });
    await nextBtn.click();

    // Step 2: SMS Code
    // Expect SMS input to be visible now (or step changed)
    const smsInput = page.locator('input[placeholder*="验证码"]');
    await expect(smsInput).toBeVisible();
    
    // Get Code
    await page.locator('button:has-text("获取验证码")').click();
    // Wait for countdown
    await expect(page.locator('button', { hasText: '秒' })).toBeVisible();

    await smsInput.fill('123456');
    await nextBtn.click(); // Next again

    // Step 3: New Password
    const pwdInput = page.locator('input[placeholder*="新密码"]');
    await expect(pwdInput).toBeVisible();
    await pwdInput.fill(newPwd);
    await page.locator('input[placeholder*="确认"]').fill(newPwd);
    
    await page.locator('button:has-text("确定")').click(); // Submit

    // Expect Success (Alert or Redirect)
    // "提示重置成功并展示完成页" -> Maybe just redirect to login or show success message.
    // Let's assume redirect to login or check for success text.
    // I'll check for URL or Text.
    // Ideally redirects to login after a delay or manual click.
    // Let's expect "成功" text.
    await expect(page.locator('h3', { hasText: '重置成功' })).toBeVisible();

    // Verify Login with New Password
    await page.goto('http://localhost:5173/login');
    await page.locator('input[placeholder*="用户名"]').fill(testUser);
    await page.locator('input[placeholder*="密码"]').fill(newPwd);
    await page.locator('button:has-text("立即登录")').click();
    
    // 2FA Modal
    const modal = page.locator('.login-modal');
    await expect(modal).toBeVisible();
    await modal.locator('input[placeholder*="证件号后4位"]').fill(testID.slice(-4));
    await modal.locator('button:has-text("获取验证码")').click();
    await modal.locator('input[placeholder*="验证码"]').fill('123456');
    await modal.locator('button:has-text("确定")').click();

    await expect(page).toHaveURL('http://localhost:5173/');
  });
});
