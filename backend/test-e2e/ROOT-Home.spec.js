const { test, expect } = require('@playwright/test');

test.describe('ROOT: Home Page', () => {
  test('should load home page with correct elements', async ({ page }) => {
    // 1. Visit Home
    await page.goto('http://localhost:5173/');

    // 2. Check Header
    await expect(page.locator('text=中国铁路12306')).toBeVisible();
    await expect(page.locator('text=12306 CHINA RAILWAY')).toBeVisible();
    
    // 3. Check Nav
    const navItems = ["首页", "车票", "团购服务", "会员服务", "站车服务", "商旅服务", "出行指南", "信息查询"];
    for (const item of navItems) {
        await expect(page.locator(`nav >> text=${item}`)).toBeVisible();
    }

    // 4. Check Search/Booking Card
    await expect(page.locator('text=出发地')).toBeVisible();
    await expect(page.locator('text=到达地')).toBeVisible();
    await expect(page.locator('button:has-text("查 询")')).toBeVisible();

    // 5. Check Footer/Promo (Sample)
    // Use first() to avoid strict mode violation if multiple elements exist (e.g. in Nav and Body)
    // Or target specific element
    await expect(page.locator('h3:has-text("会员服务")')).toBeVisible();
    await expect(page.locator('text=铁路畅行 尊享体验')).toBeVisible();
  });
});
