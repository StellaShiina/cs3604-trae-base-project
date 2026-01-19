const { test, expect } = require('@playwright/test');

test.describe('REQ-2 Ticket Query', () => {
  test('User can query tickets from HomePage and see results', async ({ page }) => {
    const dateStr = '2026-02-01'; // Fixed date matching seed

    await page.goto('http://localhost:5173/');

    // 1. Fill Query Form
    // "出发地" input
    const fromInput = page.locator('.form-row', { hasText: '出发地' }).locator('input');
    await fromInput.clear();
    await fromInput.fill('北京南');

    // "到达地" input
    const toInput = page.locator('.form-row', { hasText: '到达地' }).locator('input');
    await toInput.clear();
    await toInput.fill('上海');

    // "出发日期" input
    const dateInput = page.locator('.form-row', { hasText: '出发日期' }).locator('input');
    await dateInput.clear();
    await dateInput.fill(dateStr);

    // 2. Click Query
    await page.getByRole('button', { name: '查 询' }).click();

    // 3. Verify Navigation
    // Expect URL to contain query params
    await expect(page).toHaveURL(/\/ticket-search/);
    const url = new URL(page.url());
    expect(url.searchParams.get('from')).toBe('北京南');
    expect(url.searchParams.get('to')).toBe('上海');

    // 4. Verify Result Page Content
    // Should show G27
    await expect(page.getByText('G27')).toBeVisible();
    // Should show times
    await expect(page.getByText('19:00')).toBeVisible(); // Start time
    await expect(page.getByText('23:35')).toBeVisible(); // End time
    
    // 5. Verify Database Interaction (Implicit via API response displayed)
    // The page must have fetched data from API.
  });
});
