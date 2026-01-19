const { test, expect } = require('@playwright/test');

test('Home Page Renders Correctly', async ({ page }) => {
  // 1. Visit Home Page
  await page.goto('http://localhost:5173/');

  // 2. Check Header (Logo & Utility)
  // Using more specific locators where possible, or checking for text presence
  await expect(page.getByText('中国铁路12306').first()).toBeVisible();
  await expect(page.getByText('12306 CHINA RAILWAY').first()).toBeVisible();
  
  // Search Bar
  await expect(page.getByPlaceholder('搜索车票、餐饮、旅游产品、相关规章')).toBeVisible();
  
  // Utility Links
  await expect(page.getByText('登录')).toBeVisible();
  await expect(page.getByText('注册')).toBeVisible();
  const my12306 = page.getByText('我的12306');
  await expect(my12306).toBeVisible();
  
  // Verify My 12306 Link Navigation
  await my12306.click();
  await expect(page).toHaveURL(/.*\/personal/);
  await page.goBack(); // Go back to continue other checks

  // 3. Check Nav Bar
  // Assuming a nav element or checking text in the header area
  const navItems = ['首页', '车票', '团购服务', '会员服务', '站车服务', '商旅服务', '出行指南', '信息查询'];
  for (const item of navItems) {
    await expect(page.getByRole('link', { name: item }).first()).toBeVisible();
  }

  // Verify Ticket Link Navigation
  await page.getByRole('link', { name: '车票' }).first().click();
  await expect(page).toHaveURL(/.*\/ticket-search/);
  await page.goBack();


  // 4. Check Hero Section (Booking Panel)
  await expect(page.getByText('出发地')).toBeVisible();
  await expect(page.getByText('到达地')).toBeVisible();
  await expect(page.getByText('出发日期')).toBeVisible();
  await expect(page.getByRole('button', { name: '查 询' })).toBeVisible();
  
  // Tabs
  await expect(page.getByText('单程')).toBeVisible();
  await expect(page.getByText('往返')).toBeVisible();

  // 5. Check Hero Headline
  // Use more specific locator to avoid ambiguity with Promo Card
  await expect(page.locator('.hero-visual').getByText('计次·定期票')).toBeVisible();
  await expect(page.getByText('直刷乘车、出行乐无忧')).toBeVisible();

  // 6. Check Quick Access
  await expect(page.getByText('重点旅客预约')).toBeVisible();
  await expect(page.getByText('遗失物品查找')).toBeVisible();

  // 7. Check Promo Cards
  await expect(page.getByText('餐饮·特产')).toBeVisible();
  await expect(page.getByText('铁路保险')).toBeVisible();
});
