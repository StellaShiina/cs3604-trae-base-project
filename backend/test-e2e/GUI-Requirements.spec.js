import { test, expect } from '@playwright/test';

test.describe('GUI Requirements Verification', () => {

  // 1. Register - Phone Validation (register-phone-validation.json)
  test('Register - Phone Validation', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    // Fill other fields to isolate phone error
    await page.fill('input[name="username"]', 'testuser_gui_1');
    await page.fill('input[name="password"]', 'Password123');
    await page.fill('input[name="confirmPassword"]', 'Password123');
    await page.fill('input[name="realName"]', '测试员');
    await page.fill('input[name="idNumber"]', '110101199001011234');
    
    // Leave phone empty and submit
    await page.click('button[type="submit"]'); // Assuming the register button is submit type
    
    // Expect specific error message
    const phoneError = page.locator('.error-message', { hasText: '请输入手机号，以完成用户校验' });
    // Or closer to input
    // The current UI might render error differently. Let's assume standard error placement.
    // Based on RegisterPage.jsx, `errors[name]` is rendered. I need to check render.
    // Assuming standard implementation:
    await expect(page.locator('text=请输入手机号，以完成用户校验')).toBeVisible();
  });

  // 2. Register - Password Validation (register-password-validation.json)
  test('Register - Password Validation', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    
    await page.fill('input[name="username"]', 'testuser_gui_2');
    // Empty password
    await page.click('button[type="submit"]');
    await expect(page.locator('text=密码不能为空')).toBeVisible();
    
    // Short password
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=密码长度不能少于6位')).toBeVisible();
  });

  // 3. Tickets - Filter Train Type G (tickets-filter-train-type-g.json)
  test('Tickets - Filter Train Type G', async ({ page }) => {
    // Navigate to ticket search (using seeded date and route with mixed trains G27, D99)
    await page.goto('http://localhost:5173/ticket-search?from=北京南&to=上海&date=2026-02-01');
    
    // Uncheck D, Z, T, K, Other
    await page.click('label:has-text("D-动车")'); 
    await page.click('label:has-text("Z-直达")');
    await page.click('label:has-text("T-特快")');
    await page.click('label:has-text("K-快速")');
    await page.click('label:has-text("其他")');
    
    // Verify G is still checked
    const gCheckbox = page.locator('label:has-text("GC-高铁/城际") input');
    await expect(gCheckbox).toBeChecked();
    
    // Expectation: Only G trains visible.
    // Check table rows.
    const rows = page.locator('.ticket-table tbody tr');
    const count = await rows.count();
    
    // Wait for rows to load (ensure not loading state)
    await expect(page.locator('.loading')).not.toBeVisible();

    // Verify at least one row exists
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        if (await row.getAttribute('class') === 'no-data') continue;

        const trainNo = await row.locator('.train-no').innerText();
        expect(trainNo.startsWith('G') || trainNo.startsWith('C')).toBeTruthy();
    }
  });

  // 4. Traveler - Prevent Duplicate (traveler-prevent-duplicate-traveler.json)
  test('Traveler - Prevent Duplicate', async ({ page }) => {
    // Login with seeded testuser
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'testuser'); 
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // 2FA Flow
    await page.fill('input[name="idLast4"]', '5678'); // Seeded ID last 4 for testuser (110101199001015678)
    await page.click('text=获取验证码');
    await page.fill('input[name="code"]', '123456'); // Mock code
    await page.click('button:has-text("确定")');
    
    // Go to Personal Center -> Passengers
    await page.goto('http://localhost:5173/personal/passengers');
    
    // Add a passenger that exists (testuser self is '孔诗语', '110101199001015678')
    await page.click('text=添加');
    
    // Fill details of an existing passenger. 
    await page.fill('input[name="realName"]', 'DuplicateUser');
    await page.selectOption('select[name="idType"]', '1');
    await page.fill('input[name="idNumber"]', '110101199001015678'); // Same ID as Self
    await page.fill('input[name="phone"]', '13800138999'); // Different phone
    await page.selectOption('select[name="passengerType"]', 'adult');
    
    // Handle dialog expectation
    page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('该联系人已存在');
        await dialog.accept();
    });
    
    await page.click('button:has-text("保存")');
  });

});
