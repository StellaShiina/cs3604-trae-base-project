const { test, expect } = require('@playwright/test');

test.describe('REQ-1-2 User Login', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/login');
  });

  test('Login Page UI Elements', async ({ page }) => {
    await expect(page.getByRole('tab', { name: '账号登录' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '扫码登录' })).toBeVisible();
    await expect(page.getByPlaceholder('用户名/邮箱/手机号')).toBeVisible();
    await expect(page.getByPlaceholder('密码')).toBeVisible();
    await expect(page.getByRole('button', { name: '立即登录' })).toBeVisible();
    await expect(page.getByText('注册12306账号')).toBeVisible();
    await expect(page.getByText('忘记密码')).toBeVisible();
  });

  test('2FA Popup Flow', async ({ page }) => {
    // 1. Fill Credentials
    await page.fill('input[placeholder*="用户名"]', 'admin_user');
    await page.fill('input[placeholder*="密码"]', '123456'); // Correct password

    // 2. Click Login -> Popup appears
    await page.click('button:has-text("立即登录")');
    const popup = page.locator('.login-2fa-modal');
    await expect(popup).toBeVisible();
    // await expect(popup.getByText('请输入证件号后四位')).toBeVisible(); // Changed to check placeholder
    await expect(popup.getByPlaceholder('请输入证件号后四位')).toBeVisible();

    // 3. Send SMS
    const sendBtn = popup.locator('.code-btn');
    await sendBtn.click();
    await expect(sendBtn).toHaveText(/秒后重发/); // Countdown

    // 4. Fill 2FA details
    // admin_user ID: 110101199001011235 -> Last 4: 1235
    await popup.locator('input[placeholder*="证件号后四位"]').fill('1235');
    await popup.locator('input[placeholder*="验证码"]').fill('123456');

    // 5. Submit
    await popup.locator('button:has-text("确定")').click();

    // Debug: Check if error appeared
    const errorMsg = popup.locator('.error-msg');
    try {
        await expect(errorMsg).toBeVisible({ timeout: 2000 });
        const text = await errorMsg.textContent();
        throw new Error(`Login failed with error: ${text}`);
    } catch (e) {
        // If errorMsg is not visible, it means no error (hopefully), so proceed to check URL
        if (e.message.includes('Login failed with error')) throw e;
    }

    // 6. Verify Success (Redirect to Home and show User)
    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.getByText('您好，admin_user')).toBeVisible();
    
    // 7. Verify LocalStorage
    const localStorage = await page.evaluate(() => window.localStorage);
    expect(localStorage.token).toBeTruthy();
    expect(localStorage.user).toBeTruthy();
  });

  test('Logout Flow', async ({ page }) => {
    // Login first (simplified, reusing previous logic or mocking state if possible, but let's just do full flow for robustness)
    await page.fill('input[placeholder*="用户名"]', 'admin_user');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button:has-text("立即登录")');
    
    const popup = page.locator('.login-2fa-modal');
    await popup.locator('input[placeholder*="证件号后四位"]').fill('1235');
    await popup.locator('input[placeholder*="验证码"]').fill('123456');
    await popup.locator('button:has-text("确定")').click();
    
    await expect(page).toHaveURL('http://localhost:5173/');
    
    // Check Header State
    await expect(page.getByText('您好，admin_user')).toBeVisible();
    await expect(page.getByText('退出')).toBeVisible();

    // Click Logout
    await page.click('text=退出');

    // Verify Logout
    await expect(page).toHaveURL('http://localhost:5173/login');
    const localStorage = await page.evaluate(() => window.localStorage);
    expect(localStorage.token).toBeFalsy();
    expect(localStorage.user).toBeFalsy();
    
    // Verify Header Reset (Go to home to check header if needed, but we are at login page which doesn't show same header usually? 
    // Actually Header is global. Let's check if we can see login link again.
    // But we are on /login page, so we won't see "Login" link in header if we hide it on login page? 
    // Header.jsx shows "Login" link if !user.
    // NOTE: LoginPage has its own header, not the global Header component. So we check for Login Page specific elements.
    await expect(page.getByRole('tab', { name: '账号登录' })).toBeVisible();
  });

  test('2FA Error Handling - Wrong Code', async ({ page }) => {
    await page.fill('input[placeholder*="用户名"]', 'admin_user');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button:has-text("立即登录")');
    
    const popup = page.locator('.login-2fa-modal');
    await popup.locator('input[placeholder*="证件号后四位"]').fill('1235');
    await popup.locator('input[placeholder*="验证码"]').fill('000000'); // Wrong
    await popup.locator('button:has-text("确定")').click();

    await expect(popup.getByText('验证码错误')).toBeVisible();
  });

  test('2FA Error Handling - Wrong Password', async ({ page }) => {
    await page.fill('input[placeholder*="用户名"]', 'admin_user');
    await page.fill('input[placeholder*="密码"]', 'wrong_password'); // Wrong
    await page.click('button:has-text("立即登录")');
    
    const popup = page.locator('.login-2fa-modal');
    await popup.locator('input[placeholder*="证件号后四位"]').fill('1235');
    await popup.locator('input[placeholder*="验证码"]').fill('123456'); // Correct
    await popup.locator('button:has-text("确定")').click();

    await expect(popup.getByText('用户名或密码错误')).toBeVisible();
  });

  test('Scan Code Tab', async ({ page }) => {
    await page.click('text=扫码登录');
    await expect(page.getByText('打开手机12306APP扫码登录')).toBeVisible();
  });

});
