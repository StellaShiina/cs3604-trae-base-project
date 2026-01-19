const { test, expect } = require('@playwright/test');

test.describe('REQ-1-1 User Registration Details', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/register');
  });

  test('Username Validation Scenarios', async ({ page }) => {
    const usernameInput = page.locator('input[name="username"]');
    
    // 1. Taken username (admin_user from seed)
    await usernameInput.fill('admin_user');
    await usernameInput.blur();
    await expect(page.getByText('用户名已被占用')).toBeVisible();

    // 2. Format error (not starting with letter)
    await usernameInput.fill('1user_name');
    await usernameInput.blur();
    await expect(page.getByText('用户名格式错误')).toBeVisible(); 

    // 3. Valid username
    await usernameInput.fill('valid_user_123');
    await usernameInput.blur();
    await expect(page.getByText('用户名已被占用')).not.toBeVisible();
    await expect(page.getByText('用户名格式错误')).not.toBeVisible();
  });

  test('Password Strength and Match Validation', async ({ page }) => {
    const pwdInput = page.locator('input[name="password"]');
    const confirmInput = page.locator('input[name="confirmPassword"]');

    // 1. Length error
    await pwdInput.fill('123');
    await pwdInput.blur();
    await expect(page.getByText('密码长度不能少于6位')).toBeVisible();

    // 2. Type error (only numbers)
    await pwdInput.fill('123456');
    await pwdInput.blur();
    await expect(page.getByText('密码必须包含字母、数字或下划线中的至少两种')).toBeVisible();

    // 3. Valid and Strong
    await pwdInput.fill('Pass123_');
    await pwdInput.blur();
    // Check strength meter (class based check)
    await expect(page.locator('.strength-meter .high')).toBeVisible();

    // 4. Mismatch
    await confirmInput.fill('Pass1234');
    await confirmInput.blur();
    await expect(page.getByText('两次密码输入不一致')).toBeVisible();
  });

  test('ID Number Validation', async ({ page }) => {
    const idInput = page.locator('input[name="idNumber"]');
    
    // 1. Format error
    await idInput.fill('123');
    await idInput.blur();
    await expect(page.getByText('身份证号码格式错误')).toBeVisible();

    // 2. Valid format (mock check logic)
    await idInput.fill('11010119900101123X');
    await idInput.blur();
    await expect(page.getByText('身份证号码格式错误')).not.toBeVisible();
  });

  test('SMS Code Flow', async ({ page }) => {
    const phoneInput = page.locator('input[name="phone"]');
    // Use class locator to avoid name change issue during assertion
    const sendBtn = page.locator('.code-btn'); 

    // 1. Enter phone
    await phoneInput.fill('13812345678');
    await phoneInput.blur(); 
    
    // 2. Click send
    await sendBtn.click();
    
    // 3. Check countdown
    // Expect text to contain "重发" or match regex
    await expect(sendBtn).toHaveText(/秒后重发/);
    await expect(sendBtn).toBeDisabled();
  });

  test('Full Registration Success', async ({ page }) => {
    const randomSuffix = Date.now();
    const username = `reg_user_${randomSuffix}`;
    const phone = `139${String(randomSuffix).slice(-8)}`;
    const idNum = `1101011990${String(randomSuffix).slice(-8)}`;

    // Fill all correctly
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', 'Pass123_');
    await page.fill('input[name="confirmPassword"]', 'Pass123_');
    await page.fill('input[name="realName"]', 'Reg User');
    await page.fill('input[name="idNumber"]', idNum);
    await page.fill('input[name="phone"]', phone);
    
    // Terms
    await page.check('input[type="checkbox"]');

    // SMS Code 
    await page.locator('.code-btn').click();
    
    // Wait for code to be "sent" (record created)
    await page.waitForTimeout(1000); 

    await page.fill('input[name="verificationCode"]', '123456');

    // Submit
    await page.getByRole('button', { name: '下一步' }).click();

    // Expect Redirect
    await expect(page).toHaveURL(/.*login/);
  });

  test('Duplicate ID Number Check', async ({ page }) => {
    // Fill valid form but with existing ID (admin_user's ID: 110101199001011235)
    await page.fill('input[name="username"]', `unique_user_${Date.now()}`);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.fill('input[name="realName"]', 'Test User');
    await page.fill('input[name="idNumber"]', '110101199001011235'); // Duplicate
    await page.fill('input[name="phone"]', `137${Date.now().toString().slice(-8)}`);
    
    // Send Code (Mock)
    const sendBtn = page.locator('.code-btn');
    await sendBtn.click();
    await expect(sendBtn).toHaveText(/秒后重发/);
    await page.fill('input[name="verificationCode"]', '123456');

    // Agree
    await page.check('input[type="checkbox"]');

    // Submit
    await page.click('button[type="submit"]');

    // Expect Error
    await expect(page.getByText('该证件号码已被注册')).toBeVisible();
  });

});
