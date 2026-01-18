const { test, expect } = require('@playwright/test');

test.describe('REQ-2: Ticket Search', () => {
  test('Search from Home Page', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // Fill Search
    await page.locator('text=出发地').locator('..').locator('input').fill('北京');
    await page.locator('text=到达地').locator('..').locator('input').fill('上海');
    await page.locator('text=出发日期').locator('..').locator('input').fill('2025-12-20');
    
    await page.locator('button:has-text("查询")').click();
    
    await expect(page).toHaveURL(/.*search/);
    
    // Expect Results
    // This will fail until backend is implemented
    await expect(page.locator('text=G27')).toBeVisible();
    await expect(page.locator('text=D17')).toBeVisible();
  });
});
