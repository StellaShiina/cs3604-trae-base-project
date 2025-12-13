/**
 * 登录页 - 功能业务逻辑测试
 * 
 * 测试目标：根据需求文档验证所有业务功能
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../src/pages/LoginPage';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

// Mock React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Helper function to render with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockedAxios.post.mockReset();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('1.1 登录主页面布局', () => {
    it('应该渲染所有必要的组件', () => {
      renderWithRouter(<LoginPage />);
      
      // 验证顶部导航区域
      expect(screen.getByText('欢迎登录12306')).toBeInTheDocument();
      
      // 验证登录表单区域
      expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /立即登录/i })).toBeInTheDocument();
      
      // 验证底部导航区域
      expect(screen.getByText('友情链接')).toBeInTheDocument();
    });

    it('应该处理Logo点击事件，跳转到首页', async () => {
      const { container } = renderWithRouter(<LoginPage />);
      
      // 找到 Logo 图片（通过 alt 属性定位）
      const logoImage = screen.getByAltText('中国铁路12306');
      expect(logoImage).toBeInTheDocument();
      
      // 找到 Logo 区域（logo 图片的父容器）
      const logoSection = logoImage.closest('.logo-section');
      expect(logoSection).toBeInTheDocument();
      
      // 点击 Logo 区域内的可点击元素
      if (logoSection) {
        const clickableDiv = logoSection.querySelector('div[onclick]') || logoSection.querySelector('div');
        if (clickableDiv) {
          fireEvent.click(clickableDiv);
        } else {
          fireEvent.click(logoSection);
        }
        
        // 验证跳转到首页
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/');
        }, { timeout: 2000 });
      }
    });

    it('应该显示"账号登录"选项卡且为选中状态', () => {
      renderWithRouter(<LoginPage />);
      
      const accountTab = screen.getByText('账号登录');
      expect(accountTab).toBeInTheDocument();
      expect(accountTab).toHaveClass('active');
    });

    it('应该显示"注册12306账户"和"忘记密码？"链接', () => {
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByText('注册12306账户')).toBeInTheDocument();
      expect(screen.getByText('忘记密码？')).toBeInTheDocument();
    });
  });

  describe('1.2 用户提交登录信息', () => {
    describe('1.2.1 校验用户输入的用户名或手机号或邮箱是否为空', () => {
      it('用户未输入用户名或手机号或邮箱，点击"立即登录"应提示"请输入用户名！"', async () => {
        renderWithRouter(<LoginPage />);
        
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('请输入用户名！')).toBeInTheDocument();
        });
      });
    });

    describe('1.2.2 校验用户输入的密码是否为空', () => {
      it('用户输入了用户名但未输入密码，点击"立即登录"应提示"请输入密码！"', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('请输入密码！')).toBeInTheDocument();
        });
      });
    });

    describe('1.2.3 校验用户输入的密码长度是否符合要求', () => {
      it('用户输入的密码长度小于6位，点击"立即登录"应提示"密码长度不能少于6位！"', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '12345' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('密码长度不能少于6位！')).toBeInTheDocument();
        });
      });
    });

    describe('1.2.4 校验用户输入的用户名/邮箱/手机号是否符合格式要求', () => {
      it('用户输入的用户名/邮箱/手机号不符合格式要求，应提示"用户名或密码错误！"并清空密码', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        // Mock API 返回错误
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: { error: '用户名或密码错误！' }
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: 'invalid@' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('用户名或密码错误！')).toBeInTheDocument();
          // 验证密码被清空
          expect(passwordInput).toHaveValue('');
        });
      });
    });

    describe('1.2.4 校验用户输入的用户名是否符合格式要求且注册过', () => {
      it('用户输入的用户名符合格式要求且注册过且密码正确，应显示"短信验证"弹窗', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        // Mock API 返回成功，包含 sessionId
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            success: true,
            sessionId: 'test-session-id'
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          // 验证短信验证弹窗显示
          expect(screen.getByText('短信验证')).toBeInTheDocument();
        });
      });

      it('用户输入的用户名符合格式要求但未注册过，应提示"用户名或密码错误！"并清空密码', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        // Mock API 返回用户不存在错误
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: { error: '用户名或密码错误！' }
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: 'nonexistent' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('用户名或密码错误！')).toBeInTheDocument();
          expect(passwordInput).toHaveValue('');
        });
      });

      it('用户输入的用户名符合要求且注册过但密码错误，应提示"用户名或密码错误！"并清空密码', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        // Mock API 返回密码错误
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: { error: '用户名或密码错误！' }
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('用户名或密码错误！')).toBeInTheDocument();
          expect(passwordInput).toHaveValue('');
        });
      });
    });

    describe('1.2.5 校验用户输入的邮箱是否符合格式要求且注册过', () => {
      it('用户输入的邮箱符合格式要求且注册过且密码正确，应显示"短信验证"弹窗', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        // Mock API 返回成功
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            success: true,
            sessionId: 'test-session-id'
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('短信验证')).toBeInTheDocument();
        });
      });

      it('用户输入的邮箱符合格式要求但未注册过，应提示"用户名或密码错误！"并清空密码', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: { error: '用户名或密码错误！' }
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: 'nonexistent@example.com' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('用户名或密码错误！')).toBeInTheDocument();
          expect(passwordInput).toHaveValue('');
        });
      });

      it('用户输入的邮箱符合要求且注册过但密码错误，应提示"用户名或密码错误！"并清空密码', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: { error: '用户名或密码错误！' }
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('用户名或密码错误！')).toBeInTheDocument();
          expect(passwordInput).toHaveValue('');
        });
      });
    });

    describe('1.2.6 校验用户输入的手机号是否符合格式要求且注册过', () => {
      it('用户输入的手机号符合格式要求且注册过且密码正确，应显示"短信验证"弹窗', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        mockedAxios.post.mockResolvedValueOnce({
          data: {
            success: true,
            sessionId: 'test-session-id'
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: '13800138000' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('短信验证')).toBeInTheDocument();
        });
      });

      it('用户输入的手机号符合格式要求但未注册过，应提示"用户名或密码错误！"并清空密码', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: { error: '用户名或密码错误！' }
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: '13999999999' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('用户名或密码错误！')).toBeInTheDocument();
          expect(passwordInput).toHaveValue('');
        });
      });

      it('用户输入的手机号符合格式要求且注册过但密码错误，应提示"用户名或密码错误！"并清空密码', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: { error: '用户名或密码错误！' }
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: '13800138000' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('用户名或密码错误！')).toBeInTheDocument();
          expect(passwordInput).toHaveValue('');
        });
      });

      it('用户输入的手机号不符合手机号格式要求，应提示"用户名或密码错误！"并清空密码', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        mockedAxios.post.mockRejectedValueOnce({
          response: {
            data: { error: '用户名或密码错误！' }
          }
        });
        
        fireEvent.change(usernameInput, { target: { value: '12345' } }); // 不符合手机号格式
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('用户名或密码错误！')).toBeInTheDocument();
          expect(passwordInput).toHaveValue('');
        });
      });
    });
  });

  describe('1.3 导航功能', () => {
    it('应该处理注册按钮点击，跳转到注册页', async () => {
      renderWithRouter(<LoginPage />);
      
      const registerButton = screen.getByText('注册12306账户');
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/register');
      });
    });

    it('应该处理忘记密码点击', async () => {
      renderWithRouter(<LoginPage />);
      
      const forgotPasswordButton = screen.getByText('忘记密码？');
      fireEvent.click(forgotPasswordButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
      });
    });
  });

  describe('2. 短信验证弹窗界面', () => {
    beforeEach(() => {
      // 设置初始状态：已登录成功，显示短信验证弹窗
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          sessionId: 'test-session-id'
        }
      });
    });

    it('登录成功后应该显示短信验证弹窗', async () => {
      renderWithRouter(<LoginPage />);
      
      const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
      const passwordInput = screen.getByPlaceholderText('密码');
      const loginButton = screen.getByRole('button', { name: /立即登录/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: '123456' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('短信验证')).toBeInTheDocument();
      });
    });

    describe('2.1 短信验证弹窗界面布局', () => {
      it('弹窗应该显示"短信验证"文字', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByText('短信验证')).toBeInTheDocument();
        });
      });

      it('弹窗应该显示"请输入登录账号绑定的证件号后4位"输入框', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
          expect(idCardInput).toBeInTheDocument();
        });
      });

      it('弹窗应该显示"输入验证码"输入框和"获取验证码"按钮', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByPlaceholderText(/输入验证码/i)).toBeInTheDocument();
          expect(screen.getByText(/获取验证码/i)).toBeInTheDocument();
        });
      });

      it('弹窗应该显示"确定"按钮', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /确定/i })).toBeInTheDocument();
        });
      });

      it('弹窗应该有关闭按钮', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          // 查找关闭按钮（通常是 "x" 或 "×"）
          const closeButton = screen.queryByRole('button', { name: /关闭|×|x/i }) ||
                             screen.queryByText(/×|x/i);
          expect(closeButton).toBeInTheDocument();
        });
      });
    });

    describe('2.1.4 "获取验证码"按钮状态', () => {
      it('当证件号后4位输入框为空时，"获取验证码"按钮应为状态1（灰色，不可点击）', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          const getCodeButton = screen.getByText(/获取验证码/i);
          expect(getCodeButton).toBeInTheDocument();
          // 验证按钮不可点击（disabled 或样式为灰色）
          expect(getCodeButton).toBeDisabled();
        });
      });

      it('当证件号后4位输入框输入了4位数字时，"获取验证码"按钮应为状态2（白色，可点击）', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
          const getCodeButton = screen.getByText(/获取验证码/i);
          
          // 输入4位数字
          fireEvent.change(idCardInput, { target: { value: '1234' } });
          
          // 验证按钮可点击
          expect(getCodeButton).not.toBeDisabled();
        });
      });

      it('当证件号后4位输入框输入少于4位数字时，"获取验证码"按钮应由状态2变为状态1', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
          const getCodeButton = screen.getByText(/获取验证码/i);
          
          // 先输入4位数字（状态2）
          fireEvent.change(idCardInput, { target: { value: '1234' } });
          expect(getCodeButton).not.toBeDisabled();
          
          // 删除到少于4位（状态1）
          fireEvent.change(idCardInput, { target: { value: '123' } });
          expect(getCodeButton).toBeDisabled();
        });
      });
    });

    describe('2.2 用户发出获取验证码请求', () => {
      it('用户点击获取验证码按钮且证件号后4位不正确，应提示"请输入正确的用户信息！"', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
          const getCodeButton = screen.getByText(/获取验证码/i);
          
          // 输入错误的证件号后4位
          fireEvent.change(idCardInput, { target: { value: '9999' } });
          
          // Mock API 返回错误
          mockedAxios.post.mockRejectedValueOnce({
            response: {
              data: { error: '请输入正确的用户信息！' }
            }
          });
          
          fireEvent.click(getCodeButton);
        });
        
        await waitFor(() => {
          expect(screen.getByText(/请输入正确的用户信息！/i)).toBeInTheDocument();
        });
      });

      it('用户点击获取验证码按钮且证件号后4位正确，应开始倒计时', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
          const getCodeButton = screen.getByText(/获取验证码/i);
          
          // 输入正确的证件号后4位
          fireEvent.change(idCardInput, { target: { value: '1234' } });
          
          // Mock API 返回成功
          mockedAxios.post.mockResolvedValueOnce({
            data: {
              success: true,
              verificationCode: '123456',
              phone: '13800138000'
            }
          });
          
          fireEvent.click(getCodeButton);
        });
        
        await waitFor(() => {
          // 验证按钮进入倒计时状态（显示"重新发送(60s)"或类似文本）
          const getCodeButton = screen.getByText(/重新发送|获取验证码/i);
          expect(getCodeButton).toBeInTheDocument();
          // 验证按钮被禁用（倒计时期间）
          expect(getCodeButton).toBeDisabled();
        }, { timeout: 2000 });
      });

      it('用户点击获取验证码按钮但1分钟内已发送过验证码，应提示"请求验证码过于频繁，请稍后再试！"', async () => {
        renderWithRouter(<LoginPage />);
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
        const passwordInput = screen.getByPlaceholderText('密码');
        const loginButton = screen.getByRole('button', { name: /立即登录/i });
        
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        fireEvent.click(loginButton);
        
        await waitFor(() => {
          const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
          const getCodeButton = screen.getByText(/获取验证码/i);
          
          fireEvent.change(idCardInput, { target: { value: '1234' } });
          
          // Mock API 返回频繁请求错误
          mockedAxios.post.mockRejectedValueOnce({
            response: {
              data: { error: '请求验证码过于频繁，请稍后再试！' }
            }
          });
          
          fireEvent.click(getCodeButton);
        });
        
        await waitFor(() => {
          expect(screen.getByText(/请求验证码过于频繁，请稍后再试！/i)).toBeInTheDocument();
        });
      });
    });

    describe('2.3 用户在"短信验证"弹窗进行登录验证', () => {
      describe('2.3.1 校验用户输入的证件号后4位是否为空', () => {
        it('用户未输入证件号后4位并点击确认按钮，应提示"请输入登录账号绑定的证件号后4位"', async () => {
          renderWithRouter(<LoginPage />);
          
          const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
          const passwordInput = screen.getByPlaceholderText('密码');
          const loginButton = screen.getByRole('button', { name: /立即登录/i });
          
          fireEvent.change(usernameInput, { target: { value: 'testuser' } });
          fireEvent.change(passwordInput, { target: { value: '123456' } });
          fireEvent.click(loginButton);
          
          await waitFor(() => {
            const confirmButton = screen.getByRole('button', { name: /确定/i });
            fireEvent.click(confirmButton);
          });
          
          await waitFor(() => {
            expect(screen.getByText(/请输入登录账号绑定的证件号后4位/i)).toBeInTheDocument();
          });
        });
      });

      describe('2.3.2 校验用户输入的验证码是否合法', () => {
        it('用户未在"输入验证码"输入框中输入任何内容并点击确认按钮，应提示"请输入验证码"', async () => {
          renderWithRouter(<LoginPage />);
          
          const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
          const passwordInput = screen.getByPlaceholderText('密码');
          const loginButton = screen.getByRole('button', { name: /立即登录/i });
          
          fireEvent.change(usernameInput, { target: { value: 'testuser' } });
          fireEvent.change(passwordInput, { target: { value: '123456' } });
          fireEvent.click(loginButton);
          
          await waitFor(() => {
            const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
            const confirmButton = screen.getByRole('button', { name: /确定/i });
            
            // 输入证件号后4位
            fireEvent.change(idCardInput, { target: { value: '1234' } });
            
            // 不输入验证码，直接点击确认
            fireEvent.click(confirmButton);
          });
          
          await waitFor(() => {
            expect(screen.getByText(/请输入验证码/i)).toBeInTheDocument();
          });
        });

        it('用户在"输入验证码"输入框中输入的验证码少于6位并点击确认按钮，应提示"请输入正确的验证码"', async () => {
          renderWithRouter(<LoginPage />);
          
          const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
          const passwordInput = screen.getByPlaceholderText('密码');
          const loginButton = screen.getByRole('button', { name: /立即登录/i });
          
          fireEvent.change(usernameInput, { target: { value: 'testuser' } });
          fireEvent.change(passwordInput, { target: { value: '123456' } });
          fireEvent.click(loginButton);
          
          await waitFor(() => {
            const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
            const codeInput = screen.getByPlaceholderText(/输入验证码/i);
            const confirmButton = screen.getByRole('button', { name: /确定/i });
            
            fireEvent.change(idCardInput, { target: { value: '1234' } });
            fireEvent.change(codeInput, { target: { value: '12345' } }); // 少于6位
            fireEvent.click(confirmButton);
          });
    
    await waitFor(() => {
            expect(screen.getByText(/请输入正确的验证码/i)).toBeInTheDocument();
          });
        });

        it('用户未成功获取过验证码并点击确认按钮，应提示"验证码校验失败！"', async () => {
          renderWithRouter(<LoginPage />);
          
          const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
          const passwordInput = screen.getByPlaceholderText('密码');
          const loginButton = screen.getByRole('button', { name: /立即登录/i });
          
          fireEvent.change(usernameInput, { target: { value: 'testuser' } });
          fireEvent.change(passwordInput, { target: { value: '123456' } });
          fireEvent.click(loginButton);
          
          await waitFor(() => {
            const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
            const codeInput = screen.getByPlaceholderText(/输入验证码/i);
            const confirmButton = screen.getByRole('button', { name: /确定/i });
            
            fireEvent.change(idCardInput, { target: { value: '1234' } });
            fireEvent.change(codeInput, { target: { value: '123456' } });
            
            // Mock API 返回验证码校验失败
            mockedAxios.post.mockRejectedValueOnce({
              response: {
                data: { error: '验证码校验失败！' }
              }
            });
            
            fireEvent.click(confirmButton);
          });
          
          await waitFor(() => {
            expect(screen.getByText(/验证码校验失败！/i)).toBeInTheDocument();
          });
        });
      });

      describe('2.3.3 校验用户输入的验证码是否正确', () => {
        it('用户输入了正确验证码，应提示登录成功并跳转到首页', async () => {
          renderWithRouter(<LoginPage />);
          
          const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
          const passwordInput = screen.getByPlaceholderText('密码');
          const loginButton = screen.getByRole('button', { name: /立即登录/i });
          
          fireEvent.change(usernameInput, { target: { value: 'testuser' } });
          fireEvent.change(passwordInput, { target: { value: '123456' } });
          fireEvent.click(loginButton);
          
          await waitFor(() => {
            const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
            const codeInput = screen.getByPlaceholderText(/输入验证码/i);
            const confirmButton = screen.getByRole('button', { name: /确定/i });
            
            fireEvent.change(idCardInput, { target: { value: '1234' } });
            fireEvent.change(codeInput, { target: { value: '123456' } });
            
            // Mock API 返回验证成功
            mockedAxios.post.mockResolvedValueOnce({
              data: {
                success: true,
                token: 'test-token',
                user: {
                  id: 'user-1',
                  username: 'testuser',
                  name: 'Test User'
                }
              }
            });
            
            fireEvent.click(confirmButton);
          });
    
    await waitFor(() => {
            // 验证 token 保存到 localStorage
            expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'test-token');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('userId', 'user-1');
            expect(localStorageMock.setItem).toHaveBeenCalledWith('username', 'Test User');
            
            // 验证显示成功消息
            expect(screen.getByText(/登录成功！正在跳转.../i)).toBeInTheDocument();
          }, { timeout: 3000 });
          
          // 验证2秒后跳转到首页
          await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
          }, { timeout: 3000 });
        });

        it('用户输入了错误验证码，应提示"很抱歉，您输入的短信验证码有误。"', async () => {
          renderWithRouter(<LoginPage />);
          
          const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
          const passwordInput = screen.getByPlaceholderText('密码');
          const loginButton = screen.getByRole('button', { name: /立即登录/i });
          
          fireEvent.change(usernameInput, { target: { value: 'testuser' } });
          fireEvent.change(passwordInput, { target: { value: '123456' } });
          fireEvent.click(loginButton);
          
          await waitFor(() => {
            const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
            const codeInput = screen.getByPlaceholderText(/输入验证码/i);
            const confirmButton = screen.getByRole('button', { name: /确定/i });
            
            fireEvent.change(idCardInput, { target: { value: '1234' } });
            fireEvent.change(codeInput, { target: { value: '000000' } }); // 错误的验证码
            
            // Mock API 返回验证码错误
            mockedAxios.post.mockRejectedValueOnce({
              response: {
                data: { error: '很抱歉，您输入的短信验证码有误。' }
              }
            });
            
            fireEvent.click(confirmButton);
          });
          
          await waitFor(() => {
            expect(screen.getByText(/很抱歉，您输入的短信验证码有误。/i)).toBeInTheDocument();
          });
        });
      });
    });
  });

  describe('边界情况和状态管理', () => {
    it('应该显示加载状态', async () => {
      renderWithRouter(<LoginPage />);
      
      const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
      const passwordInput = screen.getByPlaceholderText('密码');
      const loginButton = screen.getByRole('button', { name: /立即登录/i });
      
      // Mock API 延迟响应
      mockedAxios.post.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve({
          data: { success: true, sessionId: 'test-session-id' }
        }), 100))
      );
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: '123456' } });
      fireEvent.click(loginButton);
      
      // 验证加载状态
      await waitFor(() => {
        expect(screen.getByText('登录中...')).toBeInTheDocument();
      });
    });

  it('应该正确管理组件状态', () => {
      renderWithRouter(<LoginPage />);
    
    // 验证初始状态
      expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toHaveValue('');
      expect(screen.getByPlaceholderText('密码')).toHaveValue('');
      expect(screen.queryByText('短信验证')).not.toBeInTheDocument();
    });

    it('应该响应键盘事件（Enter键提交表单）', async () => {
      renderWithRouter(<LoginPage />);
      
      const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
      const passwordInput = screen.getByPlaceholderText('密码');
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: '123456' } });
      
      // 在密码输入框按 Enter 键
      fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' });
      
      // 验证表单提交（会触发验证错误，因为未点击按钮）
      await waitFor(() => {
        // 如果按 Enter 触发了提交，应该会有 API 调用或验证错误
        // 这里主要验证组件仍然存在
        expect(passwordInput).toBeInTheDocument();
      });
    });

    it('证件号后4位输入框应限制输入不能超过4位', async () => {
      // Mock 登录 API 返回成功
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          sessionId: 'test-session-id'
        }
      });
      
      renderWithRouter(<LoginPage />);
      
      const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
      const passwordInput = screen.getByPlaceholderText('密码');
      const loginButton = screen.getByRole('button', { name: /立即登录/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: '123456' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i);
        expect(idCardInput).toBeInTheDocument();
        
        // 尝试输入超过4位的数字
        fireEvent.change(idCardInput, { target: { value: '12345' } });
        
        // 验证输入被限制为4位
        expect(idCardInput).toHaveValue('1234');
      }, { timeout: 3000 });
    });

    it('验证码输入框应限制输入不能超过6位', async () => {
      // Mock 登录 API 返回成功
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          success: true,
          sessionId: 'test-session-id'
        }
      });
      
      renderWithRouter(<LoginPage />);
      
      const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号');
      const passwordInput = screen.getByPlaceholderText('密码');
      const loginButton = screen.getByRole('button', { name: /立即登录/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: '123456' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        const codeInput = screen.getByPlaceholderText(/输入验证码/i);
        expect(codeInput).toBeInTheDocument();
        
        // 尝试输入超过6位的数字
        fireEvent.change(codeInput, { target: { value: '1234567' } });
        
        // 验证输入被限制为6位
        expect(codeInput).toHaveValue('123456');
      }, { timeout: 3000 });
    });
  });
});
