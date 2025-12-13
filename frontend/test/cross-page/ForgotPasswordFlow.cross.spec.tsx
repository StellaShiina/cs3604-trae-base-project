/**
 * 密码找回流程跨页测试
 * 
 * 测试场景：
 * 1. 登录页 → 密码找回页 → 完整的4步密码重置流程
 * 2. 账户信息验证（手机号+证件类型+证件号码）
 * 3. 短信验证码发送和验证（120秒倒计时）
 * 4. 新密码设置和确认
 * 5. 完成后返回登录页使用新密码登录
 * 6. 各种错误场景的处理
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoginPage from '../../src/pages/LoginPage';
import ForgotPasswordPage from '../../src/pages/ForgotPasswordPage';
import { renderWithRouter, setupLocalStorageMock, cleanupTest } from './test-utils';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import axios from 'axios';

// 辅助函数：通过label查找输入框
const getInputByLabel = (labelText: string | RegExp): HTMLInputElement => {
  const label = screen.getByText(labelText);
  const input = label.closest('.form-row')?.querySelector('input[type="text"]') as HTMLInputElement;
  if (!input) {
    throw new Error(`找不到标签为 "${labelText}" 的输入框`);
  }
  return input;
};

describe('密码找回流程跨页测试', () => {
  beforeEach(() => {
    cleanupTest();
    setupLocalStorageMock();
    vi.clearAllMocks();
  });

  describe('从登录页进入密码找回', () => {
    it('应该能够从登录页点击"忘记密码？"进入密码找回页面', async () => {
      const user = userEvent.setup();

      const { navigate } = await renderWithRouter({
        initialEntries: ['/login'],
        routes: [
          { path: '/login', element: <LoginPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      });

      // 验证在登录页 - 使用更精确的查询，避免匹配多个元素
      await waitFor(() => {
        // 验证tab按钮"账号登录"存在
        expect(screen.getByRole('button', { name: /账号登录/ })).toBeInTheDocument();
        // 验证提交按钮"立即登录"存在
        expect(screen.getByRole('button', { name: /立即登录/ })).toBeInTheDocument();
      });

      // 查找并点击"忘记密码？"链接
      const forgotPasswordLink = screen.getByText(/忘记密码/);
      await act(async () => {
        await user.click(forgotPasswordLink);
      });

      // 验证跳转到密码找回页面 - 使用更精确的查询，验证tab按钮存在
      await waitFor(() => {
        // 验证三个tab按钮都存在
        expect(screen.getByRole('button', { name: /人脸找回/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /手机找回/ })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /邮箱找回/ })).toBeInTheDocument();
      });
    });
  });

  describe('步骤1：填写账户信息', () => {
    it('应该显示手机号、证件类型、证件号码三个输入框', async () => {
      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      });

      await waitFor(() => {
        // 使用包含冒号的完整文本匹配label，避免匹配到hint-text
        expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
        expect(screen.getByText(/证件类型：/)).toBeInTheDocument();
        expect(screen.getByText(/证件号码：/)).toBeInTheDocument();
      });

      // 验证右侧提示文字
      expect(screen.getByText(/已通过核验的手机号码/)).toBeInTheDocument();
      expect(screen.getByText(/请选择证件类型/)).toBeInTheDocument();
      expect(screen.getByText(/请输入证件号码/)).toBeInTheDocument();
    });

    it('应该验证证件号码格式（18位限制）', async () => {
      const user = userEvent.setup();

      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      });

      // 等待页面加载
      await waitFor(() => {
        expect(screen.getByText(/证件号码：/)).toBeInTheDocument();
      });

      const idCardInput = getInputByLabel(/证件号码：/);

      // 输入超过18位
      await act(async () => {
        await user.click(idCardInput);
        await user.clear(idCardInput);
        await user.type(idCardInput, '12345678901234567890');
      });

      // 验证只保留18位
      await waitFor(() => {
        expect(idCardInput).toHaveValue('123456789012345678');
      });
    });

    it('应该在账户信息不匹配时显示错误提示', async () => {
      const user = userEvent.setup();

      // Mock API返回错误
      (axios.post as any).mockRejectedValue({
        response: {
          data: {
            success: false,
            error: '手机号码或证件号码不正确！',
          },
        },
      });

      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      });

      // 等待页面完全加载
      await waitFor(() => {
        expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
      });

      // 使用更精确的方式查找输入框：通过label找到对应的输入框
      const phoneLabel = screen.getByText(/手机号码：/);
      const phoneInput = phoneLabel.closest('.form-row')?.querySelector('input[type="text"]') as HTMLInputElement;
      expect(phoneInput).toBeInTheDocument();

      const idCardLabel = screen.getByText(/证件号码：/);
      const idCardInput = idCardLabel.closest('.form-row')?.querySelector('input[type="text"]') as HTMLInputElement;
      expect(idCardInput).toBeInTheDocument();

      // 使用校验码正确的身份证号，这样本地验证会通过，然后API会返回错误
      // 110101199001011237（最后一位是7，校验码正确）
      await act(async () => {
        // 先点击输入框聚焦
        await user.click(phoneInput);
        await user.clear(phoneInput);
        await user.type(phoneInput, '13800138000');
      });

      await act(async () => {
        await user.click(idCardInput);
        await user.clear(idCardInput);
        await user.type(idCardInput, '110101199001011237');
      });

      // 等待输入完成
      await waitFor(() => {
        expect(phoneInput).toHaveValue('13800138000');
        expect(idCardInput).toHaveValue('110101199001011237');
      });

      // 点击提交
      const submitButton = screen.getByRole('button', { name: /提交/ });
      await act(async () => {
        await user.click(submitButton);
      });

      // 验证错误提示显示在输入框下方
      await waitFor(() => {
        expect(screen.getByText(/手机号码或证件号码不正确/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('应该在验证成功后进入步骤2', async () => {
      const user = userEvent.setup();

      // Mock成功的API响应
      (axios.post as any).mockResolvedValue({
        data: {
          success: true,
          sessionId: 'test-session-123',
          phone: '19805819256',
        },
      });

      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      });

      // 等待页面完全加载
      await waitFor(() => {
        expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
      });

      // 使用更精确的方式查找输入框：通过label找到对应的输入框
      const phoneLabel = screen.getByText(/手机号码：/);
      const phoneInput = phoneLabel.closest('.form-row')?.querySelector('input[type="text"]') as HTMLInputElement;
      expect(phoneInput).toBeInTheDocument();

      const idCardLabel = screen.getByText(/证件号码：/);
      const idCardInput = idCardLabel.closest('.form-row')?.querySelector('input[type="text"]') as HTMLInputElement;
      expect(idCardInput).toBeInTheDocument();

      // 使用校验码正确的身份证号：330106200503104028（最后一位是8，校验码正确）
      await act(async () => {
        await user.click(phoneInput);
        await user.clear(phoneInput);
        await user.type(phoneInput, '19805819256');
      });

      await act(async () => {
        await user.click(idCardInput);
        await user.clear(idCardInput);
        await user.type(idCardInput, '330106200503104028');
      });

      // 等待输入完成
      await waitFor(() => {
        expect(phoneInput).toHaveValue('19805819256');
        expect(idCardInput).toHaveValue('330106200503104028');
      });

      // 点击提交
      const submitButton = screen.getByRole('button', { name: /提交/ });
      await act(async () => {
        await user.click(submitButton);
      });

      // 验证进入步骤2（获取验证码）- 使用更精确的查询
      await waitFor(() => {
        // 验证label文本存在（包含冒号）
        expect(screen.getByText(/请填写手机验证码：/)).toBeInTheDocument();
        // 验证发送验证码按钮存在
        expect(screen.getByRole('button', { name: /获取.*验证码/ })).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('步骤2：获取验证码', () => {
    beforeEach(() => {
      // Mock步骤1成功
      (axios.post as any).mockImplementation((url: string) => {
        if (url === '/api/password-reset/verify-account') {
          return Promise.resolve({
            data: {
              success: true,
              sessionId: 'test-session-123',
              phone: '19805819256',
            },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('应该显示手机号并支持发送验证码', async () => {
      const user = userEvent.setup();

      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      });

      // 等待页面加载
      await waitFor(() => {
        expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
      });

      // 完成步骤1
      const phoneInput = getInputByLabel(/手机号码：/);
      const idCardInput = getInputByLabel(/证件号码：/);
      await act(async () => {
        await user.click(phoneInput);
        await user.clear(phoneInput);
        await user.type(phoneInput, '19805819256');
      });
      await act(async () => {
        await user.click(idCardInput);
        await user.clear(idCardInput);
        await user.type(idCardInput, '330106200503104028');
      });

      const submitButton = screen.getByRole('button', { name: /提交/ });
      await act(async () => {
        await user.click(submitButton);
      });

      // 等待进入步骤2
      await waitFor(() => {
        expect(screen.getByText(/\+86.*198/)).toBeInTheDocument();
      });

      // 验证有"获取手机验证码"按钮
      expect(screen.getByRole('button', { name: /获取.*验证码/ })).toBeInTheDocument();
    });

    it('应该在发送验证码后显示120秒倒计时', async () => {
      const user = userEvent.setup();

      // Mock发送验证码API
      (axios.post as any).mockImplementation((url: string) => {
        if (url === '/api/password-reset/verify-account') {
          return Promise.resolve({
            data: { success: true, sessionId: 'test-session-123', phone: '19805819256' },
          });
        }
        if (url === '/api/password-reset/send-code') {
          return Promise.resolve({
            data: { success: true, verificationCode: '123456', phone: '19805819256' },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      });

      // 等待页面加载
      await waitFor(() => {
        expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
      });

      // 完成步骤1
      const phoneInput = getInputByLabel(/手机号码：/);
      const idCardInput = getInputByLabel(/证件号码：/);
      await act(async () => {
        await user.click(phoneInput);
        await user.clear(phoneInput);
        await user.type(phoneInput, '19805819256');
      });
      await act(async () => {
        await user.click(idCardInput);
        await user.clear(idCardInput);
        await user.type(idCardInput, '330106200503104028');
      });
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      // 等待进入步骤2
      await waitFor(() => {
        expect(screen.getByText(/\+86.*198/)).toBeInTheDocument();
      });

      // 点击"获取手机验证码"
      const sendCodeButton = screen.getByRole('button', { name: /获取.*验证码/ });
      await act(async () => {
        await user.click(sendCodeButton);
      });

      // 验证倒计时文字出现
      await waitFor(() => {
        expect(screen.getByText(/验证码已发出.*\d+秒/)).toBeInTheDocument();
      });
    });

    it('应该在输入正确验证码后进入步骤3', async () => {
      const user = userEvent.setup();

      // Mock所有API
      (axios.post as any).mockImplementation((url: string) => {
        if (url === '/api/password-reset/verify-account') {
          return Promise.resolve({
            data: { success: true, sessionId: 'test-session-123', phone: '19805819256' },
          });
        }
        if (url === '/api/password-reset/send-code') {
          return Promise.resolve({
            data: { success: true, verificationCode: '123456', phone: '19805819256' },
          });
        }
        if (url === '/api/password-reset/verify-code') {
          return Promise.resolve({
            data: { success: true, resetToken: 'reset-token-456' },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      });

      // 等待页面加载
      await waitFor(() => {
        expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
      });

      // 完成步骤1
      const phoneInput = getInputByLabel(/手机号码：/);
      const idCardInput = getInputByLabel(/证件号码：/);
      await act(async () => {
        await user.click(phoneInput);
        await user.clear(phoneInput);
        await user.type(phoneInput, '19805819256');
      });
      await act(async () => {
        await user.click(idCardInput);
        await user.clear(idCardInput);
        await user.type(idCardInput, '330106200503104028');
      });
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      // 等待进入步骤2
      await waitFor(() => {
        expect(screen.getByText(/\+86.*198/)).toBeInTheDocument();
      });

      // 输入验证码
      const codeInput = screen.getAllByRole('textbox').find(
        (input) => input.getAttribute('maxLength') === '6'
      );
      await act(async () => {
        await user.click(codeInput!);
        await user.clear(codeInput!);
        await user.type(codeInput!, '123456');
      });

      // 提交验证码
      const submitButton = screen.getByRole('button', { name: /提交/ });
      await act(async () => {
        await user.click(submitButton);
      });

      // 验证进入步骤3（设置新密码）- 使用更精确的查询（包含冒号）
      await waitFor(() => {
        expect(screen.getByText(/新密码：/)).toBeInTheDocument();
        expect(screen.getByText(/密码确认：/)).toBeInTheDocument();
      });
    });
  });

  describe('步骤3：设置新密码', () => {
    beforeEach(() => {
      // Mock前面所有步骤成功
      (axios.post as any).mockImplementation((url: string) => {
        if (url === '/api/password-reset/verify-account') {
          return Promise.resolve({
            data: { success: true, sessionId: 'test-session-123', phone: '19805819256' },
          });
        }
        if (url === '/api/password-reset/send-code') {
          return Promise.resolve({
            data: { success: true, verificationCode: '123456', phone: '19805819256' },
          });
        }
        if (url === '/api/password-reset/verify-code') {
          return Promise.resolve({
            data: { success: true, resetToken: 'reset-token-456' },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
    });

    it('应该显示新密码和密码确认输入框及右侧提示', async () => {
      const user = userEvent.setup();

      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      });

      // 等待页面加载
      await waitFor(() => {
        expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
      });

      // 快速完成前两步
      const phoneInput = getInputByLabel(/手机号码：/);
      const idCardInput = getInputByLabel(/证件号码：/);
      await act(async () => {
        await user.click(phoneInput);
        await user.clear(phoneInput);
        await user.type(phoneInput, '19805819256');
      });
      await act(async () => {
        await user.click(idCardInput);
        await user.clear(idCardInput);
        await user.type(idCardInput, '330106200503104028');
      });
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      await waitFor(() => {
        expect(screen.getByText(/\+86.*198/)).toBeInTheDocument();
      });

      const codeInput = screen.getAllByRole('textbox').find(
        (input) => input.getAttribute('maxLength') === '6'
      );
      await act(async () => {
        await user.click(codeInput!);
        await user.clear(codeInput!);
        await user.type(codeInput!, '123456');
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      // 验证步骤3的UI - 使用更精确的查询（包含冒号）
      await waitFor(() => {
        expect(screen.getByText(/新密码：/)).toBeInTheDocument();
        expect(screen.getByText(/密码确认：/)).toBeInTheDocument();
        // 使用完整的hint-text文本匹配，避免匹配到error-text
        expect(screen.getByText(/需包含字母、数字、下划线中不少于两种且长度不少于6/)).toBeInTheDocument();
        expect(screen.getByText(/请再次输入密码/)).toBeInTheDocument();
      });
    });

    it('应该在密码重置成功后进入完成步骤', async () => {
      const user = userEvent.setup();

      // Mock密码重置成功
      (axios.post as any).mockImplementation((url: string, data: any) => {
        if (url === '/api/password-reset/verify-account') {
          return Promise.resolve({
            data: { success: true, sessionId: 'test-session-123', phone: '19805819256' },
          });
        }
        if (url === '/api/password-reset/send-code') {
          return Promise.resolve({
            data: { success: true, verificationCode: '123456', phone: '19805819256' },
          });
        }
        if (url === '/api/password-reset/verify-code') {
          return Promise.resolve({
            data: { success: true, resetToken: 'reset-token-456' },
          });
        }
        if (url === '/api/password-reset/reset-password') {
          return Promise.resolve({
            data: { success: true, message: '密码重置成功' },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      });

      // 等待页面加载
      await waitFor(() => {
        expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
      });

      // 完成前两步
      const phoneInput = getInputByLabel(/手机号码：/);
      const idCardInput = getInputByLabel(/证件号码：/);
      await act(async () => {
        await user.click(phoneInput);
        await user.clear(phoneInput);
        await user.type(phoneInput, '19805819256');
      });
      await act(async () => {
        await user.click(idCardInput);
        await user.clear(idCardInput);
        await user.type(idCardInput, '330106200503104028');
      });
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      await waitFor(() => expect(screen.getByText(/\+86.*198/)).toBeInTheDocument());

      const codeInput = screen.getAllByRole('textbox').find(
        (input) => input.getAttribute('maxLength') === '6'
      );
      await act(async () => {
        await user.click(codeInput!);
        await user.clear(codeInput!);
        await user.type(codeInput!, '123456');
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      // 等待进入步骤3 - 使用更精确的查询（包含冒号）
      await waitFor(() => expect(screen.getByText(/新密码：/)).toBeInTheDocument());

      // 输入新密码
      const passwordInputs = screen.getAllByDisplayValue('');
      const newPasswordInput = passwordInputs.find((input) => input.getAttribute('type') === 'password');
      const confirmPasswordInput = passwordInputs.filter((input) => input.getAttribute('type') === 'password')[1];

      await act(async () => {
        await user.type(newPasswordInput!, 'newPass123');
        await user.type(confirmPasswordInput!, 'newPass123');
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      // 验证进入完成步骤
      await waitFor(() => {
        expect(screen.getByText(/新密码设置成功/)).toBeInTheDocument();
        expect(screen.getByText(/登录系统/)).toBeInTheDocument();
      });
    });
  });

  describe('步骤4：完成', () => {
    it('应该能够从完成页面跳转回登录页', async () => {
      const user = userEvent.setup();

      // Mock所有步骤成功
      (axios.post as any).mockImplementation((url: string) => {
        if (url === '/api/password-reset/verify-account') {
          return Promise.resolve({
            data: { success: true, sessionId: 'test-session-123', phone: '19805819256' },
          });
        }
        if (url === '/api/password-reset/send-code') {
          return Promise.resolve({
            data: { success: true, verificationCode: '123456', phone: '19805819256' },
          });
        }
        if (url === '/api/password-reset/verify-code') {
          return Promise.resolve({
            data: { success: true, resetToken: 'reset-token-456' },
          });
        }
        if (url === '/api/password-reset/reset-password') {
          return Promise.resolve({
            data: { success: true, message: '密码重置成功' },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/login', element: <LoginPage /> },
        ],
      });

      // 等待页面加载
      await waitFor(() => {
        expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
      });

      // 完成所有步骤（简化版）
      const phoneInput = getInputByLabel(/手机号码：/);
      const idCardInput = getInputByLabel(/证件号码：/);
      await act(async () => {
        await user.click(phoneInput);
        await user.clear(phoneInput);
        await user.type(phoneInput, '19805819256');
      });
      await act(async () => {
        await user.click(idCardInput);
        await user.clear(idCardInput);
        await user.type(idCardInput, '330106200503104028');
      });
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      await waitFor(() => expect(screen.getByText(/\+86.*198/)).toBeInTheDocument());

      const codeInput = screen.getAllByRole('textbox').find(
        (input) => input.getAttribute('maxLength') === '6'
      );
      await act(async () => {
        await user.click(codeInput!);
        await user.clear(codeInput!);
        await user.type(codeInput!, '123456');
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      // 等待进入步骤3 - 使用更精确的查询（包含冒号）
      await waitFor(() => expect(screen.getByText(/新密码：/)).toBeInTheDocument());

      const passwordInputs = screen.getAllByDisplayValue('');
      const newPasswordInput = passwordInputs.find((input) => input.getAttribute('type') === 'password');
      const confirmPasswordInput = passwordInputs.filter((input) => input.getAttribute('type') === 'password')[1];

      await act(async () => {
        await user.type(newPasswordInput!, 'newPass123');
        await user.type(confirmPasswordInput!, 'newPass123');
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      // 等待完成页面
      await waitFor(() => {
        expect(screen.getByText(/新密码设置成功/)).toBeInTheDocument();
      });

      // 点击"登录系统"链接
      const loginLink = screen.getByText(/登录系统/);
      await act(async () => {
        await user.click(loginLink);
      });

      // 验证跳转到登录页 - 使用更精确的查询，避免匹配多个元素
      await waitFor(() => {
        // 验证tab按钮"账号登录"存在
        expect(screen.getByRole('button', { name: /账号登录/ })).toBeInTheDocument();
        // 验证提交按钮"立即登录"存在
        expect(screen.getByRole('button', { name: /立即登录/ })).toBeInTheDocument();
      });
    });
  });

  describe('进度条显示测试', () => {
    it('应该在各步骤正确显示进度', async () => {
      const user = userEvent.setup();

      (axios.post as any).mockImplementation((url: string) => {
        if (url === '/api/password-reset/verify-account') {
          return Promise.resolve({
            data: { success: true, sessionId: 'test-session-123', phone: '19805819256' },
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      await renderWithRouter({
        initialEntries: ['/forgot-password'],
        routes: [{ path: '/forgot-password', element: <ForgotPasswordPage /> }],
      });

      // 步骤1：验证进度条显示"填写账户信息"
      await waitFor(() => {
        expect(screen.getByText(/填写账户信息/)).toBeInTheDocument();
        expect(screen.getByText(/获取验证码/)).toBeInTheDocument();
        expect(screen.getByText(/设置新密码/)).toBeInTheDocument();
        expect(screen.getByText(/完成/)).toBeInTheDocument();
      });

      // 等待页面加载
      await waitFor(() => {
        expect(screen.getByText(/手机号码：/)).toBeInTheDocument();
      });

      // 完成步骤1进入步骤2
      const phoneInput = getInputByLabel(/手机号码：/);
      const idCardInput = getInputByLabel(/证件号码：/);
      await act(async () => {
        await user.click(phoneInput);
        await user.clear(phoneInput);
        await user.type(phoneInput, '19805819256');
      });
      await act(async () => {
        await user.click(idCardInput);
        await user.clear(idCardInput);
        await user.type(idCardInput, '330106200503104028');
      });
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /提交/ }));
      });

      // 验证进度条更新
      await waitFor(() => {
        const progressBar = document.querySelector('.password-reset-progress-bar');
        expect(progressBar).toBeInTheDocument();
      });
    });
  });
});

