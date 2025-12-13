// 个人信息页导航流程跨页测试
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

describe('个人信息页导航流程测试', () => {
  
  beforeEach(() => {
    cleanupTest();
    setupLocalStorageMock();
    mockFetch();
    
    // 默认mock用户信息API
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
            country: '中国China',
            idCardType: '居民身份证',
            idCardNumber: '310101199001011234',
            verificationStatus: '已通过',
            phone: '(+86)158****9968',
            email: 'test@example.com',
            discountType: '成人'
          })
        });
      }
      if (url === '/api/passengers') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ passengers: [] })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });
  });

  describe('进入个人信息页流程', () => {
    
    it('[P0] 已登录用户应该能够访问个人信息页', async () => {
      // Given: 用户已登录
      mockAuthenticatedUser('valid-test-token', 'testuser');
      
      // When: 直接访问个人信息页
      await renderWithRouter({
        initialEntries: ['/personal-info'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      // Then: 页面应该正确加载
      await waitFor(() => {
        const personalInfoPage = document.querySelector('.personal-info-page');
        const sideMenu = document.querySelector('.side-menu');
        expect(personalInfoPage).toBeTruthy();
        expect(sideMenu).toBeTruthy();
      }, { timeout: 3000 });
      
      // And: 应该调用用户信息API
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled();
        const fetchCalls = (globalThis.fetch as any).mock.calls;
        const userInfoCall = fetchCalls.find((call: any[]) => 
          call[0] && typeof call[0] === 'string' && call[0].includes('/api/user/info')
        );
        expect(userInfoCall).toBeTruthy();
        if (userInfoCall && userInfoCall[1]) {
          const headers = userInfoCall[1].headers || {};
          expect(headers['Authorization']).toBe('Bearer valid-test-token');
        }
      }, { timeout: 3000 });
    });

    it('[P0] 未登录用户访问个人信息页应该被拦截', async () => {
      // Given: 用户未登录
      mockUnauthenticatedUser();
      
      // When: 尝试访问个人信息页
      await renderWithRouter({
        initialEntries: ['/personal-info'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      // Then: 应该显示错误信息或跳转到登录页
      await waitFor(() => {
        const errorElement = document.querySelector('.error-container');
        const loginPage = document.querySelector('.login-page');
        const accountLoginText = screen.queryByText(/账号登录/i);
        expect(errorElement || loginPage || accountLoginText).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('侧边菜单导航流程', () => {
    
    beforeEach(() => {
      mockAuthenticatedUser('valid-test-token', 'testuser');
    });

    it('[P0] 应该能够通过侧边菜单导航到手机核验页', async () => {
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
      
      // When: 点击侧边菜单的"手机核验"
      const phoneVerificationItem = screen.getByText(/手机核验/i);
      await act(async () => {
        await user.click(phoneVerificationItem);
      });
      
      // Then: 应该跳转到手机核验页
      await waitFor(() => {
        const phoneVerificationPage = document.querySelector('.phone-verification-page');
        const personalInfoPage = document.querySelector('.personal-info-page');
        expect(phoneVerificationPage).toBeTruthy();
        expect(personalInfoPage).toBeFalsy();
      }, { timeout: 3000 });
    });

    it('[P0] 应该能够通过侧边菜单导航到乘客管理页', async () => {
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
      
      // When: 点击侧边菜单的"乘车人"
      const passengersItem = screen.getByText(/乘车人/i);
      await act(async () => {
        await user.click(passengersItem);
      });
      
      // Then: 应该跳转到乘客管理页
      await waitFor(() => {
        const passengersPage = document.querySelector('.passenger-management-page');
        const personalInfoPage = document.querySelector('.personal-info-page');
        expect(passengersPage).toBeTruthy();
        expect(personalInfoPage).toBeFalsy();
      }, { timeout: 3000 });
    });

    it('[P0] 应该能够通过侧边菜单导航到历史订单页', async () => {
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
      
      // When: 点击侧边菜单的"火车票订单"
      const ordersItem = screen.getByText(/火车票订单/i);
      await act(async () => {
        await user.click(ordersItem);
      });
      
      // Then: 应该跳转到历史订单页
      await waitFor(() => {
        const ordersPage = document.querySelector('.order-history-page');
        const personalInfoPage = document.querySelector('.personal-info-page');
        expect(ordersPage).toBeTruthy();
        expect(personalInfoPage).toBeFalsy();
      }, { timeout: 3000 });
    });

    it('[P1] 侧边菜单应该正确高亮当前页面', async () => {
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
      
      // Then: "查看个人信息"菜单项应该被选中
      await waitFor(() => {
        const selectedItem = document.querySelector('.menu-item.selected');
        expect(selectedItem).toBeTruthy();
        expect(selectedItem?.textContent).toContain('查看个人信息');
      }, { timeout: 3000 });
    });
  });

  describe('面包屑导航验证', () => {
    
    beforeEach(() => {
      mockAuthenticatedUser('valid-test-token', 'testuser');
    });

    it('[P1] 个人信息页应该显示正确的面包屑导航', async () => {
      // When: 访问个人信息页
      await renderWithRouter({
        initialEntries: ['/personal-info'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      // Then: 面包屑应该显示正确的路径
      await waitFor(() => {
        const breadcrumb = document.querySelector('.breadcrumb-navigation');
        expect(breadcrumb).toBeTruthy();
        expect(breadcrumb?.textContent).toContain('个人中心');
        expect(breadcrumb?.textContent).toContain('查看个人信息');
      }, { timeout: 3000 });
    });

    it('[P1] 手机核验页应该显示正确的面包屑导航', async () => {
      // When: 访问手机核验页
      await renderWithRouter({
        initialEntries: ['/phone-verification'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      // Then: 面包屑应该显示完整路径
      await waitFor(() => {
        const breadcrumb = document.querySelector('.breadcrumb-navigation');
        expect(breadcrumb).toBeTruthy();
        expect(breadcrumb?.textContent).toContain('个人中心');
        expect(breadcrumb?.textContent).toContain('账号安全');
        expect(breadcrumb?.textContent).toContain('手机核验');
      }, { timeout: 3000 });
    });

    it('[P1] 乘客管理页应该显示正确的面包屑导航', async () => {
      // When: 访问乘客管理页
      await renderWithRouter({
        initialEntries: ['/passengers'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      // Then: 面包屑应该显示正确路径
      await waitFor(() => {
        const breadcrumb = document.querySelector('.breadcrumb-navigation');
        expect(breadcrumb).toBeTruthy();
        expect(breadcrumb?.textContent).toContain('个人中心');
        expect(breadcrumb?.textContent).toContain('常用信息管理');
        expect(breadcrumb?.textContent).toContain('乘车人');
      }, { timeout: 3000 });
    });
  });

  describe('Logo返回首页流程', () => {
    
    beforeEach(() => {
      mockAuthenticatedUser('valid-test-token', 'testuser');
    });

    it('[P1] 点击Logo应该返回首页', async () => {
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
      
      // When: 点击顶部的Logo（点击整个 Logo 区域）
      await waitFor(() => {
        const logoElement = screen.queryByAltText(/中国铁路12306/i);
        const logoSection = document.querySelector('.train-list-logo-section');
        expect(logoElement || logoSection).toBeTruthy();
      }, { timeout: 3000 });
      
      const logoSection = document.querySelector('.train-list-logo-section');
      if (logoSection) {
        await act(async () => {
          await user.click(logoSection as HTMLElement);
        });
      } else {
        const logoElement = screen.getByAltText(/中国铁路12306/i);
        await act(async () => {
          await user.click(logoElement);
        });
      }
      
      // Then: 应该跳转到首页
      await waitFor(() => {
        const homePage = document.querySelector('.home-page');
        const personalInfoPage = document.querySelector('.personal-info-page');
        expect(homePage).toBeTruthy();
        expect(personalInfoPage).toBeFalsy();
      }, { timeout: 3000 });
    });
  });
});

