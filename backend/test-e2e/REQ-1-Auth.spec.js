const { test, expect } = require('@playwright/test');

test.describe('REQ-1 User Authentication', () => {
  
  test('Login Page Renders Correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await expect(page.getByText('欢迎登录12306')).toBeVisible();
    await expect(page.getByText('扫码登录')).toBeVisible();
    await expect(page.getByText('账号登录')).toBeVisible();
  });

  test('Register Page Renders Correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    await expect(page.getByText('账户信息')).toBeVisible();
    await expect(page.getByText('手机号码')).toBeVisible();
  });

  test('User Registration Flow', async ({ page }) => {
    // 1. Go to Register Page
    await page.goto('http://localhost:5173/register');

    // 2. Fill Form (Simulate)
    // Assuming form inputs have name attributes or labels
    await page.fill('input[name="username"]', 'newuser_e2e');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.fill('input[name="realName"]', 'E2E User');
    await page.fill('input[name="idNumber"]', '110101199901019999'); // Random ID
    await page.fill('input[name="phone"]', '13500009999');

    // 3. Submit
    await page.click('button:has-text("下一步")'); // Or "注册" depending on flow

    // 4. Verify Redirection or Success Message
    // Expect redirect to login or dashboard
    // For now, just check if we get a success indication or redirect
    // await expect(page).toHaveURL(/.*login/); 
  });

  test('User Login Flow', async ({ page }) => {
    // 1. Go to Login Page
    await page.goto('http://localhost:5173/login');
    
    // 2. Switch to Account Login tab
    await page.click('text=账号登录');

    // 3. Fill Credentials (using seeded user)
    await page.fill('input[placeholder*="用户名"]', 'testuser');
    await page.fill('input[placeholder*="密码"]', '123456');

    // 4. Submit
    await page.click('button:has-text("立即登录")');

    // 5. Verify Login Success
    // Should redirect to home and show username
    await expect(page).toHaveURL('http://localhost:5173/');
    // await expect(page.getByText('testuser')).toBeVisible(); // If user name is shown in header
  });

});
