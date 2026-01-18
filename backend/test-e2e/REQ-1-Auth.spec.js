const { test, expect } = require('@playwright/test');

test.describe('REQ-1: User Authentication', () => {
  
  test('Login Page UI Elements', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    // Header
    await expect(page.locator('text=中国铁路12306')).toBeVisible();
    await expect(page.locator('text=欢迎登录12306')).toBeVisible();
    
    // Login Card
    await expect(page.locator('text=账号登录')).toBeVisible();
    await expect(page.locator('text=扫码登录')).toBeVisible();
    await expect(page.locator('input[placeholder*="用户名"]')).toBeVisible();
    await expect(page.locator('input[placeholder="密码"]')).toBeVisible();
    await expect(page.locator('button:has-text("立即登录")')).toBeVisible();
    
    // Links
    await expect(page.locator('text=注册12306账号')).toBeVisible();
    await expect(page.locator('text=忘记密码')).toBeVisible();
  });

  test('Register Page UI Elements', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    // Header
    await expect(page.locator('text=中国铁路12306')).toBeVisible();
    
    // Form Elements (Sample)
    await expect(page.locator('text=账户信息')).toBeVisible();
    await expect(page.locator('text=用户名')).toBeVisible();
    await expect(page.locator('text=登录密码')).toBeVisible();
    await expect(page.locator('text=证件类型')).toBeVisible();
    await expect(page.locator('text=姓名')).toBeVisible();
    await expect(page.locator('text=证件号码')).toBeVisible();
    await expect(page.locator('text=手机号码')).toBeVisible();
    
    // Button
    await expect(page.locator('button:has-text("下一步")')).toBeVisible();
  });

  test('Forgot Password Page UI Elements', async ({ page }) => {
    await page.goto('http://localhost:5173/forgot-password');
    
    // Tabs
    await expect(page.locator('text=人脸找回')).toBeVisible();
    await expect(page.locator('text=手机找回')).toBeVisible();
    await expect(page.locator('text=邮箱找回')).toBeVisible();
    
    // Form
    await expect(page.locator('text=证件类型')).toBeVisible();
    await expect(page.locator('text=证件号码')).toBeVisible();
  });

});
