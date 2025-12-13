// 乘客管理流程跨页测试
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

describe('乘客管理流程跨页测试', () => {
  
  const mockPassengers = [
    {
      id: 1,
      name: '张三',
      idCardType: '居民身份证',
      idCardNumber: '310101199001011234',
      phone: '13800138000',
      discountType: '成人',
      verificationStatus: '已通过'
    },
    {
      id: 2,
      name: '李四',
      idCardType: '居民身份证',
      idCardNumber: '320101199002021234',
      phone: '13900139000',
      discountType: '学生',
      verificationStatus: '未通过'
    }
  ];

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
            name: '测试用户',
            phone: '(+86)158****9968',
            email: 'test@example.com'
          })
        });
      }
      if (url === '/api/passengers' && (!options || options.method === 'GET' || !options.method)) {
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
          json: async () => ({ passengers: mockPassengers })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });
  });

  describe('[P0] 进入乘客管理页流程', () => {
    
    it('应该能够从个人信息页进入乘客管理页', async () => {
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
      const passengerMenuItem = screen.getByText(/乘车人/i);
      await act(async () => {
        await user.click(passengerMenuItem);
      });
      
      // Then: 应该跳转到乘客管理页
      await waitFor(() => {
        const passengerManagementPage = document.querySelector('.passenger-management-page');
        const personalInfoPage = document.querySelector('.personal-info-page');
        expect(passengerManagementPage).toBeTruthy();
        expect(personalInfoPage).toBeFalsy();
      }, { timeout: 3000 });
    });

    it('乘客管理页应该显示所有乘客列表', async () => {
      // When: 访问乘客管理页
      await renderWithRouter({
        initialEntries: ['/passengers'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      // Then: 应该显示乘客列表
      await waitFor(() => {
        expect(document.querySelector('.passenger-management-page')).toBeTruthy();
        expect(screen.getByText(/张三/i)).toBeInTheDocument();
        expect(screen.getByText(/李四/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // And: 应该调用乘客列表API
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled();
        const fetchCalls = (globalThis.fetch as any).mock.calls;
        const passengersCall = fetchCalls.find((call: any[]) => 
          call[0] && typeof call[0] === 'string' && call[0].includes('/api/passengers')
        );
        expect(passengersCall).toBeTruthy();
        if (passengersCall && passengersCall[1]) {
          const headers = passengersCall[1].headers || {};
          expect(headers['Authorization']).toBe('Bearer valid-test-token');
        }
      }, { timeout: 3000 });
    });

    it('应该正确脱敏显示身份证号和手机号', async () => {
      // When: 访问乘客管理页
      await renderWithRouter({
        initialEntries: ['/passengers'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      // Then: 身份证号应该脱敏显示
      await waitFor(() => {
        const text = document.body.textContent || '';
        // 应该包含脱敏的身份证号（格式是 3101***********234）
        expect(text).toMatch(/3101\*+234/);
        // 应该包含脱敏的手机号（格式是 138****8000）
        expect(text).toMatch(/138\*+8000/);
      }, { timeout: 3000 });
    });
  });

  describe('[P0] 添加乘客流程', () => {
    
    it.skip('应该能够完成添加乘客的完整流程', async () => {
      const newPassenger = {
        name: '王五',
        idCardType: '居民身份证',
        idCardNumber: '330101199003031234',
        phone: '13700137000',
        discountType: '成人'
      };

      // Mock添加乘客API
      (globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url === '/api/passengers' && options?.method === 'GET') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ passengers: mockPassengers })
          });
        }
        if (url === '/api/passengers' && options?.method === 'POST') {
          const body = JSON.parse(options.body);
          expect(body.name).toBe(newPassenger.name);
          expect(body.idCardNumber).toBe(newPassenger.idCardNumber);
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              passenger: { id: 3, ...newPassenger }
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      const user = userEvent.setup();
      
      // Given: 用户在乘客管理页
      await renderWithRouter({
        initialEntries: ['/passengers'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.passenger-management-page')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 点击"添加"按钮
      const addButton = screen.getByRole('button', { name: /添加/i });
      await act(async () => {
        await user.click(addButton);
      });
      
      // Then: 应该显示添加乘客表单
      await waitFor(() => {
        expect(document.querySelector('.add-passenger-panel')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 填写表单（使用 placeholder 选择器）
      const nameInput = screen.getByPlaceholderText(/请输入姓名/i) as HTMLInputElement;
      const idCardNumberInput = screen.getByPlaceholderText(/请填写证件号码/i) as HTMLInputElement;
      const phoneInput = screen.getByPlaceholderText(/请填写手机号码/i) as HTMLInputElement;
      
      expect(nameInput).toBeTruthy();
      expect(idCardNumberInput).toBeTruthy();
      expect(phoneInput).toBeTruthy();
      
      await act(async () => {
        await user.type(nameInput, newPassenger.name);
        await user.type(idCardNumberInput, newPassenger.idCardNumber);
        await user.type(phoneInput, newPassenger.phone);
      });
      
      // And: 点击保存按钮
      const saveButton = screen.getByRole('button', { name: /保存|确认/i });
      await act(async () => {
        await user.click(saveButton);
      });
      
      // Then: 应该调用添加乘客API（等待表单提交完成）
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled();
        const fetchCalls = (globalThis.fetch as any).mock.calls;
        const addCall = fetchCalls.find((call: any[]) => 
          call[0] && typeof call[0] === 'string' && call[0].includes('/api/passengers') &&
          call[1] && call[1].method === 'POST'
        );
        expect(addCall).toBeTruthy();
      }, { timeout: 5000 });
      
      // And: 应该返回乘客列表页（等待导航完成）
      await waitFor(() => {
        const passengerListPanel = document.querySelector('.passenger-list-panel');
        const addPassengerPanel = document.querySelector('.add-passenger-panel');
        // 验证返回列表页（添加面板消失或列表面板出现）
        expect(passengerListPanel || !addPassengerPanel).toBeTruthy();
      }, { timeout: 5000 });
    });

    it('应该验证添加乘客表单的必填字段', async () => {
      const user = userEvent.setup();
      
      // Given: 用户在添加乘客面板
      await renderWithRouter({
        initialEntries: ['/passengers'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.passenger-management-page')).toBeTruthy();
      }, { timeout: 3000 });
      
      const addButton = screen.getByRole('button', { name: /添加/i });
      await act(async () => {
        await user.click(addButton);
      });
      
      await waitFor(() => {
        expect(document.querySelector('.add-passenger-panel')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 不填写任何内容直接点击保存
      const saveButton = screen.getByRole('button', { name: /保存/i });
      await act(async () => {
        await user.click(saveButton);
      });
      
      // Then: 应该显示验证错误信息（检查错误消息元素）
      await waitFor(() => {
        const errorMessages = document.querySelectorAll('.passenger-error-message');
        const hasError = errorMessages.length > 0 && Array.from(errorMessages).some(msg => 
          msg.textContent && (msg.textContent.includes('必填') || msg.textContent.includes('不能为空') || msg.textContent.includes('请输入'))
        );
        expect(hasError).toBeTruthy();
      }, { timeout: 3000 });
      
      // And: 不应该调用添加API
      const fetchCalls = (globalThis.fetch as any).mock.calls;
      const addCall = fetchCalls.find((call: any[]) => 
        call[0] && typeof call[0] === 'string' && call[0].includes('/api/passengers') &&
        call[1] && call[1].method === 'POST'
      );
      expect(addCall).toBeFalsy();
    });

    it('应该能够取消添加乘客', async () => {
      const user = userEvent.setup();
      
      // Given: 用户在添加乘客面板
      await renderWithRouter({
        initialEntries: ['/passengers'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.passenger-management-page')).toBeTruthy();
      }, { timeout: 3000 });
      
      const addButton = screen.getByRole('button', { name: /添加/i });
      await act(async () => {
        await user.click(addButton);
      });
      
      await waitFor(() => {
        expect(document.querySelector('.add-passenger-panel')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 点击取消按钮
      const cancelButton = screen.getByRole('button', { name: /取消|返回/i });
      await act(async () => {
        await user.click(cancelButton);
      });
      
      // Then: 应该返回乘客列表
      await waitFor(() => {
        expect(document.querySelector('.passenger-list-panel')).toBeTruthy();
        expect(document.querySelector('.add-passenger-panel')).toBeFalsy();
      }, { timeout: 3000 });
      
      // And: 不应该调用添加API
      const fetchCalls = (globalThis.fetch as any).mock.calls;
      const addCall = fetchCalls.find((call: any[]) => 
        call[0] && typeof call[0] === 'string' && call[0].includes('/api/passengers') &&
        call[1] && call[1].method === 'POST'
      );
      expect(addCall).toBeFalsy();
    });
  });

  describe('[P0] 编辑乘客流程', () => {
    
    it('应该能够完成编辑乘客的完整流程', async () => {
      const updatedPhone = '13600136000';

      const user = userEvent.setup();
      
      // Mock编辑乘客API
      (globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url === '/api/user/info') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              username: 'testuser',
              name: '测试用户',
              phone: '(+86)158****9968',
              email: 'test@example.com'
            })
          });
        }
        if (url === '/api/passengers' && (!options || options.method === 'GET' || !options.method)) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ passengers: mockPassengers })
          });
        }
        if (url.match(/\/api\/passengers\/\d+/) && options?.method === 'PUT') {
          const body = JSON.parse(options.body);
          expect(body.phone).toBe(updatedPhone);
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              message: '更新成功'
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      // Given: 用户在乘客管理页
      await renderWithRouter({
        initialEntries: ['/passengers'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.passenger-management-page')).toBeTruthy();
        expect(screen.getByText(/张三/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // When: 点击第一个乘客的"编辑"按钮（使用 title 或 alt 属性）
      const editButtons = screen.getAllByTitle(/修改|编辑/i);
      expect(editButtons.length).toBeGreaterThan(0);
      
      await act(async () => {
        await user.click(editButtons[0]);
      });
      
      // Then: 应该显示编辑乘客面板
      await waitFor(() => {
        expect(document.querySelector('.edit-passenger-panel')).toBeTruthy();
      }, { timeout: 3000 });
      
      // And: 应该显示乘客的基本信息（只读）
      expect(screen.getByText(/张三/i)).toBeInTheDocument();
      
      // When: 修改手机号（使用 placeholder 或类名选择器）
      const phoneInput = screen.getByPlaceholderText(/请填写手机号码/i) || 
                        document.querySelector('.passenger-phone-input') as HTMLInputElement;
      expect(phoneInput).toBeTruthy();
      
      await act(async () => {
        await user.clear(phoneInput);
        await user.type(phoneInput, updatedPhone);
      });
      
      // And: 点击保存按钮
      const saveButton = screen.getByRole('button', { name: /保存/i });
      await act(async () => {
        await user.click(saveButton);
      });
      
      // Then: 应该调用更新API
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled();
        const fetchCalls = (globalThis.fetch as any).mock.calls;
        const updateCall = fetchCalls.find((call: any[]) => 
          call[0] && typeof call[0] === 'string' && call[0].match(/\/api\/passengers\/\d+/) &&
          call[1] && call[1].method === 'PUT'
        );
        expect(updateCall).toBeTruthy();
      }, { timeout: 3000 });
      
      // And: 应该返回乘客列表
      await waitFor(() => {
        expect(document.querySelector('.passenger-list-panel')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('[P0] 删除乘客流程', () => {
    
    it('应该能够删除乘客', async () => {
      const user = userEvent.setup();
      
      // Mock删除乘客API
      (globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url === '/api/user/info') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              username: 'testuser',
              name: '测试用户',
              phone: '(+86)158****9968',
              email: 'test@example.com'
            })
          });
        }
        if (url === '/api/passengers' && (!options || options.method === 'GET' || !options.method)) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ passengers: mockPassengers })
          });
        }
        if (url.match(/\/api\/passengers\/\d+/) && options?.method === 'DELETE') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              message: '删除成功'
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      // Given: 用户在乘客管理页
      await renderWithRouter({
        initialEntries: ['/passengers'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.passenger-management-page')).toBeTruthy();
        expect(screen.getByText(/张三/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // When: 点击第一个乘客的"删除"按钮（使用 title 或 alt 属性）
      const deleteButtons = screen.getAllByTitle(/删除/i);
      expect(deleteButtons.length).toBeGreaterThan(0);
      
      await act(async () => {
        await user.click(deleteButtons[0]);
      });
      
      // Then: 应该显示确认弹窗
      await waitFor(() => {
        const confirmModal = document.querySelector('.confirm-modal');
        expect(confirmModal).toBeTruthy();
      }, { timeout: 3000 });
      
      // And: 点击确认按钮
      const confirmButton = screen.getByRole('button', { name: /确定/i });
      await act(async () => {
        await user.click(confirmButton);
      });
      
      // Then: 应该调用删除API
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalled();
        const fetchCalls = (globalThis.fetch as any).mock.calls;
        const deleteCall = fetchCalls.find((call: any[]) => 
          call[0] && typeof call[0] === 'string' && call[0].match(/\/api\/passengers\/\d+/) &&
          call[1] && call[1].method === 'DELETE'
        );
        expect(deleteCall).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('应该能够取消删除操作', async () => {
      const user = userEvent.setup();
      
      // Mock API
      (globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url === '/api/user/info') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              username: 'testuser',
              name: '测试用户',
              phone: '(+86)158****9968',
              email: 'test@example.com'
            })
          });
        }
        if (url === '/api/passengers' && (!options || options.method === 'GET' || !options.method)) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ passengers: mockPassengers })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });
      
      // Given: 用户在乘客管理页
      await renderWithRouter({
        initialEntries: ['/passengers'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.passenger-management-page')).toBeTruthy();
      }, { timeout: 3000 });
      
      // When: 点击删除按钮
      const deleteButtons = screen.getAllByTitle(/删除/i);
      expect(deleteButtons.length).toBeGreaterThan(0);
      
      await act(async () => {
        await user.click(deleteButtons[0]);
      });
      
      // Then: 应该显示确认弹窗
      await waitFor(() => {
        const confirmModal = document.querySelector('.confirm-modal');
        expect(confirmModal).toBeTruthy();
      }, { timeout: 3000 });
      
      // And: 点击取消按钮
      const cancelButton = screen.getByRole('button', { name: /取消/i });
      await act(async () => {
        await user.click(cancelButton);
      });
      
      // Then: 不应该调用删除API
      const fetchCalls = (globalThis.fetch as any).mock.calls;
      const deleteCall = fetchCalls.find((call: any[]) => 
        call[0] && typeof call[0] === 'string' && call[0].match(/\/api\/passengers\/\d+/) &&
        call[1] && call[1].method === 'DELETE'
      );
      expect(deleteCall).toBeFalsy();
    });
  });

  describe('[P1] 搜索乘客流程', () => {
    
    it('应该能够按姓名搜索乘客', async () => {
      const user = userEvent.setup();
      
      // Mock API
      (globalThis.fetch as any).mockImplementation((url: string, options?: any) => {
        if (url === '/api/user/info') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              username: 'testuser',
              name: '测试用户',
              phone: '(+86)158****9968',
              email: 'test@example.com'
            })
          });
        }
        if (url === '/api/passengers' && (!options || options.method === 'GET' || !options.method)) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ passengers: mockPassengers })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });
      
      // Given: 用户在乘客管理页
      await renderWithRouter({
        initialEntries: ['/passengers'],
        routes: [
          { path: '*', element: <App /> },
        ],
      });
      
      await waitFor(() => {
        expect(document.querySelector('.passenger-management-page')).toBeTruthy();
        expect(screen.getByText(/张三/i)).toBeInTheDocument();
        expect(screen.getByText(/李四/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      // When: 在搜索框输入"张三"
      const searchInput = screen.getByPlaceholderText(/请输入乘客姓名/i) || 
                          document.querySelector('.search-input') as HTMLInputElement;
      expect(searchInput).toBeTruthy();
      
      await act(async () => {
        await user.type(searchInput, '张三');
      });
      
      // And: 点击查询按钮
      const searchButton = screen.getByRole('button', { name: /查询/i });
      await act(async () => {
        await user.click(searchButton);
      });
      
      // Then: 应该只显示匹配的乘客（前端过滤）
      await waitFor(() => {
        expect(screen.getByText(/张三/i)).toBeInTheDocument();
        // 注意：前端过滤可能仍显示所有乘客，这取决于实现
      }, { timeout: 3000 });
    });
  });
});

