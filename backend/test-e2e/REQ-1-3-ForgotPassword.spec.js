const { test, expect } = require('@playwright/test');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, '../database.db');

const getDbUser = (username) => {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
            db.close();
            if (err) reject(err);
            else resolve(row);
        });
    });
};

test.describe('REQ-1-3 Forgot Password', () => {
    const testUser = 'forgot_pwd_user';
    const oldPassword = 'OldPass123';
    const newPassword = 'NewPass456';
    const phone = '13900139000';
    const idNumber = '110101199001015678';

    test.beforeAll(async () => {
        // Ensure test user exists with known state
        const db = new sqlite3.Database(dbPath);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(oldPassword, salt);
        
        await new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO users (username, password, real_name, id_type, id_number, phone, email, user_type) 
                    VALUES (?, ?, 'Test User', '中国居民身份证', ?, ?, 'test@example.com', 'normal')`,
                [testUser, hash, idNumber, phone],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
        db.close();
    });

    test('Forgot Password Flow', async ({ page }) => {
        await page.goto('http://localhost:5173/forgot-password');

        // 1. Check UI Elements
        await expect(page.getByText('找回密码')).toBeVisible();
        await expect(page.getByRole('tab', { name: '手机找回' })).toBeVisible();
        await expect(page.getByRole('tab', { name: '人脸找回' })).toBeVisible();
        await expect(page.getByRole('tab', { name: '邮箱找回' })).toBeVisible();

        // 2. Check "Not Available" tabs
        await page.click('text=人脸找回');
        await expect(page.getByText('功能暂未开放')).toBeVisible();
        await page.click('text=手机找回');

        // 3. Step 1: Verify User
        await page.fill('input[name="phone"]', phone);
        await page.selectOption('select[name="idType"]', '中国居民身份证');
        await page.fill('input[name="idNumber"]', idNumber);
        await page.click('button:has-text("下一步")');

        // 4. Step 2: Verify Code
        await expect(page.getByText('短信验证码')).toBeVisible();
        await page.click('button:has-text("获取验证码")');
        // Mock entering code (assuming 123456 for dev/test)
        await page.fill('input[name="code"]', '123456');
        await page.click('button:has-text("下一步")');

        // 5. Step 3: Set New Password
        await expect(page.getByText('设置新密码')).toBeVisible();
        await page.fill('input[name="newPassword"]', newPassword);
        await page.fill('input[name="confirmPassword"]', newPassword);
        await page.click('button:has-text("确定")');

        // 6. Verify Success
        await expect(page.getByText('重置成功')).toBeVisible();
        
        // 7. Verify Database Update
        const user = await getDbUser(testUser);
        const match = await bcrypt.compare(newPassword, user.password);
        expect(match).toBe(true);
    });
});
