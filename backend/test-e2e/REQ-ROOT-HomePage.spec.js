import { test, expect } from '@playwright/test';

test('HomePage UI Verification', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // 1. Verify Header
  await expect(page.locator('text=中国铁路12306')).toBeVisible();
  await expect(page.locator('nav').locator('text=首页')).toBeVisible();

  // 2. Verify Booking Card
  await expect(page.locator('.booking-card')).toBeVisible();
  await expect(page.locator('text=出发地')).toBeVisible();
  await expect(page.locator('text=到达地')).toBeVisible();
  await expect(page.locator('text=查 询')).toBeVisible();

  // 3. Verify Hero Illustration Content
  await expect(page.locator('text=直刷乘车、出行乐无忧')).toBeVisible();
  await expect(page.locator('.hero-illustration')).toBeVisible();

  // 4. Verify Quick Access Bar
  await expect(page.locator('text=重点旅客预约')).toBeVisible();
  await expect(page.locator('text=遗失物品查找')).toBeVisible();

  // 5. Verify Promo Grid
  await expect(page.locator('.promo-card').locator('text=会员服务')).toBeVisible();
  await expect(page.locator('text=铁路畅行 尊享体验')).toBeVisible();

  // 6. Test Search Navigation
  await page.locator('button:has-text("查 询")').click();
  await expect(page).toHaveURL(/.*search/);
});
