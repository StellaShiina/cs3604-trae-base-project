// 手机核验流程跨页测试
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import App from '../../src/App';
import {
  setupLocalStorageMock,
  cleanupTest,
  mockUnauthenticatedUser,
  mockAuthenticatedUser,
  renderWithRouter,
  mockFetch,
} from './test-utils';

describe('手机核验流程跨页测试', () => {
  
  beforeEach(() => {
    cleanupTest();
    setupLocalStorageMock();
    mockAuthenticatedUser('valid-test-token', 'testuser');
    mockFetch();
    
    // 默认mock
    (globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
      if (url === '/api/user/info') {
        // 检查是否有认证token
        const authHeader = options?.headers?.Authorization;
        if (!authHeader || !authHeader.includes('Bearer')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: async () => ({ error: '未授权' })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            username: 'testuser',
            name: '张三',
            phone: '(+86)158****9968',
            email: 'test@example.com'
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });
  });

  describe('[P0] 进入手机核验页流程', () => {
    
    it('应该能够从个人信息页进入手机核验页', async () => {
      const user = userEvent.setup();
      
      // Given: 用户在个人信息页
      await renderWithRouter({
        initialEntries: ['/personal-info'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.personal-info-page')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 点击联系方式模块的"编辑"按钮（使用更精确的选择器）
      const contactSection = document.querySelector('.contact-info-section');
      const editButton = contactSection?.querySelector('button.edit-button') as HTMLButtonElement;
      expect(editButton).toBeTruthy();
      await act(async () => {
        await user.click(editButton!);
      });
      
      // Then: 应该显示"去手机核验修改"链接
      await waitFor(() => {
        const phoneVerificationLink = contactSection?.querySelector('.phone-verification-link');
        expect(phoneVerificationLink).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 点击"去手机核验修改"链接
      const phoneVerificationLink = contactSection?.querySelector('.phone-verification-link') as HTMLElement;
      await act(async () => {
        await user.click(phoneVerificationLink!);
      });
      
      // Then: 应该跳转到手机核验页
      await waitFor(() => {
        const phoneVerificationPage = document.querySelector('.phone-verification-page');
        const personalInfoPage = document.querySelector('.personal-info-page');
        expect(phoneVerificationPage).toBeTruthy();
        expect(personalInfoPage).toBeFalsy();
      }, { timeout: 3000 });
    });

    it('手机核验页应该显示原手机号（脱敏）', async () => {
      // When: 访问手机核验页
      await renderWithRouter({
        initialEntries: ['/phone-verification'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      // Then: 应该显示原手机号（脱敏）
      await waitFor(() => {
        const phoneVerificationPage = document.querySelector('.phone-verification-page');
        expect(phoneVerificationPage).toBeTruthy();
        
        // 验证显示原手机号（脱敏）
        const oldPhoneText = screen.queryByText(/158.*9968|158\*\*\*\*9968/i);
        expect(oldPhoneText).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('[P0] 完成手机核验流程', () => {
    
    it.skip('应该能够完成完整的手机核验流程', async () => {
      const user = userEvent.setup();
      let sessionId = '';
      
      // Mock API
      (globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
        const body = options?.body ? JSON.parse(options.body) : {};
        
        if (url === '/api/user/info') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              phone: '(+86)158****9968'
            })
          });
        }
        
        if (url === '/api/user/update-phone/request' && options?.method === 'POST') {
          sessionId = 'test-session-id';
          return Promise.resolve({
            ok: true,
            json: async () => ({
              sessionId: sessionId,
              message: '验证码已发送'
            })
          });
        }
        
        if (url === '/api/user/update-phone/confirm' && options?.method === 'POST') {
          expect(body.sessionId).toBe(sessionId);
          expect(body.code).toBe('123456');
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              message: '手机号更新成功'
            })
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      // Given: 用户在手机核验页
      await renderWithRouter({
        initialEntries: ['/phone-verification'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.phone-verification-page')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 输入新手机号（使用类名选择器）
      const newPhoneInput = document.querySelector('.phone-input') as HTMLInputElement;
      expect(newPhoneInput).toBeTruthy();
      await act(async () => {
        await user.clear(newPhoneInput);
        await user.type(newPhoneInput, '13800138000');
      });
      
      // And: 输入密码（使用类名选择器）
      const passwordInput = document.querySelector('.password-input') as HTMLInputElement;
      expect(passwordInput).toBeTruthy();
      await act(async () => {
        await user.clear(passwordInput);
        await user.type(passwordInput, 'Test@123');
      });
      
      // And: 点击确认按钮
      const confirmButton = screen.getByRole('button', { name: /确认/i });
      await act(async () => {
        await user.click(confirmButton);
      });
      
      // 等待 API 调用完成（验证码请求）
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled();
        const fetchCalls = (globalThis.fetch as any).mock.calls;
        const requestCall = fetchCalls.find((call: any[]) => 
          call[0] && typeof call[0] === 'string' && call[0].includes('/api/user/update-phone/request')
        );
        expect(requestCall).toBeTruthy();
      }, { timeout: 5000 });
      
      // Then: 应该显示验证码弹窗（等待弹窗显示）
      await waitFor(() => {
        const modal = document.querySelector('.phone-verification-modal, .verification-modal');
        expect(modal).toBeTruthy();
      }, { timeout: 5000 });
      
      // When: 输入验证码（使用 placeholder 或类名选择器）
      const codeInput = screen.getByPlaceholderText(/请输入6位验证码/i) || 
                        document.querySelector('.verification-input') as HTMLInputElement;
      expect(codeInput).toBeTruthy();
      await act(async () => {
        await user.clear(codeInput);
        await user.type(codeInput, '123456');
      });
      
      // And: 点击完成按钮
      const completeButton = screen.getByRole('button', { name: /完成/i });
      await act(async () => {
        await user.click(completeButton);
      });
      
      // Then: 验证弹窗中显示新手机号
      await waitFor(() => {
        const modal = document.querySelector('.phone-verification-modal');
        expect(modal).toBeTruthy();
        // 验证弹窗中显示新手机号
        const phoneText = screen.queryByText(/13800138000/i);
        expect(phoneText).toBeTruthy();
      }, { timeout: 3000 });
      
      // Note: 由于 alert 的存在和复杂的异步流程，完整的 API 调用验证可能需要更复杂的处理
      // 这里我们主要验证弹窗显示和基本交互
    });

    it('应该验证新手机号格式', async () => {
      const user = userEvent.setup();
      
      // Given: 用户在手机核验页
      await renderWithRouter({
        initialEntries: ['/phone-verification'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.phone-verification-page')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 输入无效的手机号（使用类名选择器）
      const newPhoneInput = document.querySelector('.phone-input') as HTMLInputElement;
      expect(newPhoneInput).toBeTruthy();
      await act(async () => {
        await user.type(newPhoneInput, '123');
        await user.tab(); // 触发 blur 事件
      });
      
      // Then: 应该显示错误提示
      await waitFor(() => {
        const errorMessage = document.querySelector('.phone-panel-error-message');
        const errorText = errorMessage?.textContent || '';
        expect(
          errorText.includes('手机号') && 
          (errorText.includes('无效') || errorText.includes('格式') || errorText.includes('11位') || errorText.includes('有效'))
        ).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('[P0] 取消手机核验流程', () => {
    
    it('应该能够取消手机核验并返回个人信息页', async () => {
      const user = userEvent.setup();
      
      // Given: 用户在手机核验页
      await renderWithRouter({
        initialEntries: ['/phone-verification'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.phone-verification-page')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 点击取消按钮
      const cancelButton = screen.getByRole('button', { name: /取消|返回/i });
      await act(async () => {
        await user.click(cancelButton);
      });
      
      // Then: 应该返回个人信息页
      await waitFor(() => {
        const personalInfoPage = document.querySelector('.personal-info-page');
        const phoneVerificationPage = document.querySelector('.phone-verification-page');
        expect(personalInfoPage).toBeTruthy();
        expect(phoneVerificationPage).toBeFalsy();
      }, { timeout: 3000 });
      
      // And: 不应该调用更新API
      const fetchCalls = (globalThis.fetch as any).mock.calls;
      const updatePhoneCalls = fetchCalls.filter((call: any[]) => 
        call[0] && typeof call[0] === 'string' && call[0].includes('/api/user/update-phone')
      );
      expect(updatePhoneCalls.length).toBe(0);
    });

    it('应该能够从验证码弹窗返回修改', async () => {
      const user = userEvent.setup();
      
      // Mock API
      (globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url === '/api/user/info') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ phone: '(+86)158****9968' })
          });
        }
        if (url === '/api/user/update-phone/request' && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              sessionId: 'test-session-id',
              message: '验证码已发送'
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      // Given: 用户已经打开验证码弹窗
      await renderWithRouter({
        initialEntries: ['/phone-verification'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.phone-verification-page')).toBeTruthy();
      }, { timeout: 3000 });
      
      // 触发验证码弹窗
      const newPhoneInput = document.querySelector('.phone-input') as HTMLInputElement;
      const passwordInput = document.querySelector('.password-input') as HTMLInputElement;
      const confirmButton = screen.getByRole('button', { name: /确认/i });
      
      expect(newPhoneInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(confirmButton).toBeTruthy();
      
      await act(async () => {
        await user.type(newPhoneInput, '13800138000');
        await user.type(passwordInput, 'Test@123');
        await user.click(confirmButton);
      });
      
      await waitFor(() => {
        expect(document.querySelector('.phone-verification-modal')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 点击"返回修改"或"取消"按钮
      const returnButton = screen.getByRole('button', { name: /返回修改/i });
      await act(async () => {
        await user.click(returnButton);
      });
      
      // Then: 弹窗应该关闭
      await waitFor(() => {
        expect(document.querySelector('.phone-verification-modal')).toBeFalsy();
      }, { timeout: 3000 });
      
      // And: 应该还在手机核验页
      expect(document.querySelector('.phone-verification-page')).toBeTruthy();
    });
  });

  describe('[P1] 错误处理', () => {
    
    it.skip('应该处理验证码错误', async () => {
      const user = userEvent.setup();
      
      // Mock API返回验证码错误
      (globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url === '/api/user/info') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ phone: '(+86)158****9968' })
          });
        }
        if (url === '/api/user/update-phone/request' && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              sessionId: 'test-session-id'
            })
          });
        }
        if (url === '/api/user/update-phone/confirm' && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: async () => ({
              error: '验证码错误'
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      // Given: 用户输入了错误的验证码
      await renderWithRouter({
        initialEntries: ['/phone-verification'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.phone-verification-page')).toBeTruthy();
      }, { timeout: 3000 });
      
      // 输入手机号和密码，打开弹窗
      const newPhoneInput = document.querySelector('.phone-input') as HTMLInputElement;
      const passwordInput = document.querySelector('.password-input') as HTMLInputElement;
      const confirmButton = screen.getByRole('button', { name: /确认/i });
      
      expect(newPhoneInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(confirmButton).toBeTruthy();
      
      await act(async () => {
        await user.type(newPhoneInput, '13800138000');
        await user.type(passwordInput, 'Test@123');
        await user.click(confirmButton);
      });
      
      await waitFor(() => {
        expect(document.querySelector('.phone-verification-modal')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 输入错误的验证码
      const codeInput = screen.getByPlaceholderText(/请输入6位验证码/i) || 
                        document.querySelector('.verification-input') as HTMLInputElement;
      const completeButton = screen.getByRole('button', { name: /完成/i });
      
      expect(codeInput).toBeTruthy();
      expect(completeButton).toBeTruthy();
      
      await act(async () => {
        await user.type(codeInput, '000000');
        await user.click(completeButton);
      });
      
      // Then: 应该显示错误提示（等待 API 调用完成和错误消息显示）
      await waitFor(() => {
        // 检查弹窗中的错误消息
        const modal = document.querySelector('.phone-verification-modal');
        if (modal) {
          const errorMessage = modal.querySelector('.phone-verification-error-message');
          if (errorMessage && errorMessage.textContent) {
            expect(errorMessage.textContent).toMatch(/验证码错误|错误/i);
            return;
          }
        }
        // 或者检查页面中的错误消息
        const pageErrorMessage = document.querySelector('.phone-verification-error-message');
        const textErrorMessage = screen.queryByText(/验证码错误|错误/i);
        expect(pageErrorMessage || textErrorMessage).toBeTruthy();
      }, { timeout: 5000 });
    });
  });
});

