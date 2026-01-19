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
    await toInput.fill('上海虹桥');

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
    expect(url.searchParams.get('to')).toBe('上海虹桥');

    // 4. Verify Result Page Content
    // Should show G27
    await expect(page.getByText('G27')).toBeVisible();
    // Should show times
    await expect(page.getByText('19:00')).toBeVisible(); // Start time
    await expect(page.getByText('23:35')).toBeVisible(); // End time

    // 5. Verify Filter Functionality
    // Uncheck "GC-高铁/城际"
    await page.getByLabel('GC-高铁/城际').uncheck();
    // G27 should disappear
    await expect(page.getByText('G27')).toBeHidden();
    
    // Check "GC-高铁/城际"
    await page.getByLabel('GC-高铁/城际').check();
    // G27 should reappear
    await expect(page.getByText('G27')).toBeVisible();
  });

  test('Default search shows results for Beijing -> Shanghai (Today)', async ({ page }) => {
    // Navigate directly to Ticket Search Page without params (defaults to Beijing -> Shanghai, Today)
    await page.goto('http://localhost:5173/ticket-search');
    
    // Should show K101 (from our seed data update)
    await expect(page.getByText('K101')).toBeVisible();
    await expect(page.getByText('18:00').first()).toBeVisible();

    // Test Date Switching
    // Click "Next Day"
    await page.getByText('后一天').click();
    
    // Check URL date param
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    await expect(page).toHaveURL(new RegExp(`date=${tomorrowStr}`));
    
    // Check UI updates
    await expect(page.getByText(`${tomorrowStr} (查询日期)`)).toBeVisible();
    // Tomorrow also has tickets from seed
    await expect(page.getByText('K101')).toBeVisible();

    // Click "Prev Day" back to today
    await page.getByText('前一天').click();
    const todayStr = new Date().toISOString().split('T')[0];
    await expect(page.getByText(`${todayStr} (查询日期)`)).toBeVisible();
  });
});
