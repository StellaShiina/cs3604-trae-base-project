const { test, expect } = require('@playwright/test');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.db');

// Helper to run SQL
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

test.describe('REQ-1-1: User Registration', () => {
  const existingUser = 'existing_user';
  const existingID = '11010119900101123X';
  const existingPhone = '13800138000';

  test.beforeAll(async () => {
    // Clean up
    await runSQL('DELETE FROM users WHERE username = ? OR id_number = ?', [existingUser, existingID]);
    // Insert existing user
    await runSQL(`
      INSERT INTO users (username, password, name, id_type, id_number, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [existingUser, 'password123', 'Existing User', '1', existingID, existingPhone]);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/register');
  });

  test('Username validation scenarios', async ({ page }) => {
    const input = page.locator('input[placeholder*="用户名"]');
    
    // 1. Real-time input (no change)
    await input.focus();
    await page.keyboard.type('abc');
    await expect(page.locator('text=用户名已被占用')).not.toBeVisible();
    
    // 2. Used username
    await input.fill(existingUser);
    await input.blur();
    await expect(page.locator('text=用户名已被占用')).toBeVisible();

    // 3. Length error
    await input.fill('abc');
    await input.blur();
    await expect(page.locator('text=6-30位')).toBeVisible();

    // 4. Format error (start with number)
    await input.fill('1abcdef');
    await input.blur();
    await expect(page.locator('text=字母开头')).toBeVisible();

    // 5. Valid
    await input.fill('valid_user_new');
    await input.blur();
    await expect(page.locator('text=用户名已被占用')).not.toBeVisible();
    await expect(page.locator('text=6-30位')).not.toBeVisible();
  });

  test('Password validation scenarios', async ({ page }) => {
    const pwd = page.locator('input[placeholder="6-20位字母、数字或符号"]');
    
    // 1. Length error
    await pwd.fill('123');
    await pwd.blur();
    await expect(page.locator('text=6-20位')).toBeVisible();

    // 2. Type error (only numbers)
    await pwd.fill('123456');
    await pwd.blur();
    await expect(page.locator('text=字母、数字或符号')).toBeVisible(); // Assuming text "必须包含至少两种..."

    // 3. Valid (Medium strength)
    await pwd.fill('abc123456');
    await pwd.blur();
    await expect(page.locator('text=中')).toBeVisible(); // Strength indicator
  });

  test('Confirm Password validation', async ({ page }) => {
    const pwd = page.locator('input[placeholder="6-20位字母、数字或符号"]');
    const confirm = page.locator('input[placeholder="再次输入您的登录密码"]');

    await pwd.fill('Password123');
    await confirm.fill('Password124');
    await confirm.blur();
    await expect(page.locator('text=密码不一致')).toBeVisible();

    await confirm.fill('Password123');
    await confirm.blur();
    await expect(page.locator('text=密码不一致')).not.toBeVisible();
  });

  test('ID Card validation', async ({ page }) => {
    const input = page.locator('input[placeholder="请输入您的证件号码"]');
    
    // Format error
    await input.fill('123');
    await input.blur();
    await expect(page.locator('text=格式错误')).toBeVisible();

    // Valid
    await input.fill('110101199001015555');
    await input.blur();
    await expect(page.locator('text=格式错误')).not.toBeVisible();
  });

  test('Phone and SMS Code', async ({ page }) => {
    const phone = page.locator('input[placeholder="手机号码"]');
    const getCodeBtn = page.locator('button:has-text("获取验证码")');

    // Phone format error
    await phone.fill('123');
    await phone.blur();
    await expect(page.locator('text=格式错误')).toBeVisible();

    // Valid phone
    await phone.fill('13900139000');
    await phone.blur();
    await expect(page.locator('text=格式错误')).not.toBeVisible();

    // Get Code
    await getCodeBtn.click();
    await expect(getCodeBtn).toBeDisabled(); // Check countdown state
    // Note: Can't easily check backend console output in E2E, but we verify button state
  });

  test('Submit with used ID number', async ({ page }) => {
    // Fill all valid data but used ID
    await page.locator('input[placeholder*="用户名"]').fill('user_test_unique_1');
    await page.locator('input[placeholder="6-20位字母、数字或符号"]').fill('Password123');
    await page.locator('input[placeholder="再次输入您的登录密码"]').fill('Password123');
    await page.locator('input[placeholder="请输入姓名"]').fill('测试用户');
    await page.locator('input[placeholder="请输入您的证件号码"]').fill(existingID); // Used ID
    await page.locator('input[placeholder="手机号码"]').fill('13900139001');
    await page.locator('input[placeholder="输入验证码"]').fill('123456'); // Correct code mock
    await page.locator('input[type="checkbox"]').check();

    // Mock API to return "ID used" error if not handled by real backend yet (but E2E expects real backend)
    // Since backend is empty, this will likely fail or do nothing.
    // We expect the alert/dialog "该证件号码已被注册"
    
    // Listen for dialog
    const dialogPromise = page.waitForEvent('dialog');
    await page.locator('button:has-text("下一步")').click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toContain('该证件号码已被注册');
    await dialog.dismiss();
  });

  test('Successful Registration', async ({ page }) => {
    const newUser = 'new_success_user';
    const newID = '110101199001016666';
    const newPhone = '13900139002';

    // Clean up first
    await runSQL('DELETE FROM users WHERE username = ?', [newUser]);

    await page.locator('input[placeholder*="用户名"]').fill(newUser);
    await page.locator('input[placeholder="6-20位字母、数字或符号"]').fill('Password123');
    await page.locator('input[placeholder="再次输入您的登录密码"]').fill('Password123');
    await page.locator('input[placeholder="请输入姓名"]').fill('新用户');
    await page.locator('input[placeholder="请输入您的证件号码"]').fill(newID);
    await page.locator('input[placeholder="手机号码"]').fill(newPhone);
    
    // Get Code (to trigger backend session/mock)
    await page.locator('button:has-text("获取验证码")').click();
    await page.locator('input[placeholder="输入验证码"]').fill('123456'); // Assume 123456 is universal test code
    
    await page.locator('input[type="checkbox"]').check();

    await page.locator('button:has-text("下一步")').click();

    // Expect navigation to login
    await expect(page).toHaveURL(/.*login/);

    // Verify DB
    // Need to wait a bit for DB write
    await page.waitForTimeout(1000);
    
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath);
      db.get('SELECT * FROM users WHERE username = ?', [newUser], (err, row) => {
        db.close();
        if (err) reject(err);
        try {
          expect(row).toBeTruthy();
          expect(row.id_number).toBe(newID);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });
});
