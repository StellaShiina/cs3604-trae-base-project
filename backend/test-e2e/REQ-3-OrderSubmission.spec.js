const { test, expect } = require('@playwright/test');

test.describe('REQ-3 Order Submission', () => {
  test('User can book a ticket and submit order', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'testuser');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("立即登录")'); // Should match button text "立即登录"

    // 1.1 2FA Modal
    await expect(page.locator('.login-2fa-modal')).toBeVisible();
    await page.click('button:has-text("获取验证码")');
    // Wait for code sent message or assume immediate (mock)
    // Mock code is 123456
    await page.fill('input[name="code"]', '123456');
    // Mock ID Last 4 is 5678 (from seed: 110101199001015678)
    await page.fill('input[name="idLast4"]', '5678');
    await page.click('button:has-text("确定")');
    
    await expect(page).toHaveURL('http://localhost:5173/');

    // 2. Search for tickets
    // Fill search form
    const dateStr = '2026-02-01'; // Matches seed
    await page.locator('.form-row', { hasText: '出发地' }).locator('input').fill('北京南');
    await page.locator('.form-row', { hasText: '到达地' }).locator('input').fill('上海');
    await page.locator('.form-row', { hasText: '出发日期' }).locator('input').fill(dateStr);
    await page.getByRole('button', { name: '查 询' }).click();

    // 3. Select a train (G27) and click Book
    // Find the row with G27 and click '预订'
    const trainRow = page.locator('tr', { hasText: 'G27' });
    await trainRow.locator('.book-btn').click();

    // 4. Verify Order Page
    await expect(page).toHaveURL(/\/order/);
    
    // Check Train Info Card
    await expect(page.getByText('G27')).toBeVisible();
    await expect(page.getByText('北京南')).toBeVisible();
    await expect(page.getByText('上海')).toBeVisible();

    // 5. Select Passenger
    // Should see "孔诗语" in the list
    const passengerCheckbox = page.locator('input[type="checkbox"]').first(); // Assuming first one is "孔诗语" or explicitly find by text
    // Better: find by text
    const passengerLabel = page.locator('label', { hasText: '孔诗语' });
    await passengerLabel.locator('input[type="checkbox"]').check();

    // 6. Verify Passenger Added to Table
    // Should see a row in the table with "孔诗语"
    const tableRow = page.locator('.passenger-table tbody tr', { hasText: '孔诗语' });
    await expect(tableRow).toBeVisible();

    // 7. Select Seat Type (if needed, default might be selected)
    // Verify default is '二等座'
    // await expect(tableRow.locator('select').nth(1)).toHaveValue('Second Class'); // Value depends on implementation

    // 8. Submit Order
    await page.click('button:has-text("提交订单")');

    // 9. Verify Success/Payment Page
    await expect(page).toHaveURL(/\/payment\/\d+/);
    await expect(page.getByText('订单提交成功')).toBeVisible();
  });
});
