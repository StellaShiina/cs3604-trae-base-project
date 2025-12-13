/**
 * 登录流程集成测试
 * 测试文件：frontend/test/integration/LoginFlow.integration.test.tsx
 * 
 * 测试完整的用户登录流程：
 * 1. 填写登录表单
 * 2. 提交并显示短信验证弹窗
 * 3. 输入证件号后4位
 * 4. 获取验证码
 * 5. 输入验证码
 * 6. 完成登录
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import LoginPage from '../../src/pages/LoginPage'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock导航
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

describe('登录流程集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 清除console.log的mock
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ==================== 完整登录流程测试 ====================
  describe('完整登录流程', () => {
    it('应该完成完整的登录流程：填表 → 短信验证 → 成功', async () => {
      // Given: Mock后端API
      mockedAxios.post.mockImplementation((url) => {
        if (url === '/api/auth/login') {
          return Promise.resolve({
            data: { 
              success: true,
              sessionId: 'test-session-123' 
            }
          })
        }
        if (url === '/api/auth/send-verification-code') {
          return Promise.resolve({ 
            data: { 
              success: true,
              verificationCode: '123456' // 开发环境返回验证码
            } 
          })
        }
        if (url === '/api/auth/verify-login') {
          return Promise.resolve({
            data: { 
              success: true,
              token: 'jwt-token-123',
              user: {
                username: 'testuser',
                email: 'test@example.com',
                phone: '13800138000'
              }
            }
          })
        }
        return Promise.reject(new Error('Unknown API'))
      })

      // When: 渲染登录页面
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      // Step 1: 填写登录表单
      const usernameInput = screen.getByPlaceholderText(/用户名.*邮箱.*手机号/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)
      
      await userEvent.type(usernameInput, 'testuser')
      await userEvent.type(passwordInput, 'password123')

      // Step 2: 提交表单
      const loginButton = screen.getByRole('button', { name: /立即登录/i })
      fireEvent.click(loginButton)

      // Then: 应该调用登录API
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          '/api/auth/login',
          expect.objectContaining({
            identifier: 'testuser',
            password: 'password123'
          })
        )
      })

      // Then: 应该显示短信验证弹窗
      await waitFor(() => {
        expect(screen.getByText('短信验证')).toBeInTheDocument()
      }, { timeout: 2000 })

      // Step 3: 输入证件号后4位
      const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i)
      await userEvent.type(idCardInput, '1234')

      // Step 4: 获取验证码
      const sendCodeButton = screen.getByText('获取验证码')
      expect(sendCodeButton).not.toBeDisabled()
      
      fireEvent.click(sendCodeButton)

      // Then: 应该调用发送验证码API
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          '/api/auth/send-verification-code',
          expect.objectContaining({
            sessionId: 'test-session-123',
            idCardLast4: '1234'
          })
        )
      })

      // Then: 按钮应该显示倒计时
      await waitFor(() => {
        expect(screen.getByText(/重新发送\(\d+s\)/)).toBeInTheDocument()
      }, { timeout: 1000 })

      // Step 5: 输入验证码
      const codeInput = screen.getByPlaceholderText(/输入验证码/i)
      await userEvent.type(codeInput, '123456')

      // Step 6: 点击确定完成登录
      const confirmButton = screen.getByRole('button', { name: /确定/i })
      fireEvent.click(confirmButton)

      // Then: 应该调用验证登录API
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          '/api/auth/verify-login',
          expect.objectContaining({
            sessionId: 'test-session-123',
            idCardLast4: '1234',
            verificationCode: '123456'
          })
        )
      })

      // Then: 登录成功后应该跳转
      // 注意：实际跳转逻辑需要在LoginPage中实现
    }, 10000) // 增加超时时间
  })

  // ==================== 客户端验证测试 ====================
  describe('客户端验证', () => {
    it('应该在用户名为空时显示错误', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const loginButton = screen.getByRole('button', { name: /立即登录/i })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/请输入用户名/i)).toBeInTheDocument()
      })
    })

    it('应该在密码为空时显示错误', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const usernameInput = screen.getByPlaceholderText(/用户名.*邮箱.*手机号/i)
      await userEvent.type(usernameInput, 'testuser')

      const loginButton = screen.getByRole('button', { name: /立即登录/i })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/请输入密码/i)).toBeInTheDocument()
      })
    })

    it('应该在密码少于6位时显示错误', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const usernameInput = screen.getByPlaceholderText(/用户名.*邮箱.*手机号/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)
      
      await userEvent.type(usernameInput, 'testuser')
      await userEvent.type(passwordInput, '12345')

      const loginButton = screen.getByRole('button', { name: /立即登录/i })
      fireEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/密码长度不能少于6位/i)).toBeInTheDocument()
      })
    })
  })

  // ==================== 登录API错误处理测试 ====================
  describe('登录API错误处理', () => {
    it('登录失败应该显示错误提示', async () => {
      // Given: Mock登录API失败
      mockedAxios.post.mockRejectedValue({
        response: { data: { error: '用户名或密码错误' } }
      })

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      // When: 填写并提交表单
      const usernameInput = screen.getByPlaceholderText(/用户名.*邮箱.*手机号/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)
      
      await userEvent.type(usernameInput, 'wronguser')
      await userEvent.type(passwordInput, 'wrongpassword')

      const loginButton = screen.getByRole('button', { name: /立即登录/i })
      fireEvent.click(loginButton)

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText(/用户名或密码错误/i)).toBeInTheDocument()
      })

      // Then: 密码应该被清空
      await waitFor(() => {
        expect(passwordInput).toHaveValue('')
      })
    })
  })

  // ==================== 短信验证错误处理测试 ====================
  describe('短信验证错误处理', () => {
    it('证件号不足4位时获取验证码按钮应该禁用', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { success: true, sessionId: 'test-session-123' }
      })

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      // 填写并提交登录表单
      const usernameInput = screen.getByPlaceholderText(/用户名.*邮箱.*手机号/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)
      await userEvent.type(usernameInput, 'testuser')
      await userEvent.type(passwordInput, 'password123')
      fireEvent.click(screen.getByRole('button', { name: /立即登录/i }))

      // 等待短信验证弹窗
      await waitFor(() => {
        expect(screen.getByText('短信验证')).toBeInTheDocument()
      })

      // 输入不足4位的证件号
      const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i)
      await userEvent.type(idCardInput, '123')

      // 获取验证码按钮应该禁用
      const sendCodeButton = screen.getByText('获取验证码')
      expect(sendCodeButton).toBeDisabled()
    })

    it('输入错误的验证码应该显示错误提示', async () => {
      // Mock window.alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
      
      mockedAxios.post.mockImplementation((url) => {
        if (url === '/api/auth/login') {
          return Promise.resolve({
            data: { success: true, sessionId: 'test-session-123' }
          })
        }
        if (url === '/api/auth/send-verification-code') {
          return Promise.resolve({ 
            data: { success: true, verificationCode: '123456' } 
          })
        }
        if (url === '/api/auth/verify-login') {
          return Promise.reject({
            response: { data: { error: '验证码错误或已过期' } }
          })
        }
        return Promise.reject(new Error('Unknown API'))
      })

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      // 完成到验证码输入的步骤
      const usernameInput = screen.getByPlaceholderText(/用户名.*邮箱.*手机号/i)
      const passwordInput = screen.getByPlaceholderText(/密码/i)
      await userEvent.type(usernameInput, 'testuser')
      await userEvent.type(passwordInput, 'password123')
      fireEvent.click(screen.getByRole('button', { name: /立即登录/i }))

      await waitFor(() => {
        expect(screen.getByText('短信验证')).toBeInTheDocument()
      })

      const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位/i)
      await userEvent.type(idCardInput, '1234')

      const sendCodeButton = screen.getByText('获取验证码')
      fireEvent.click(sendCodeButton)

      await waitFor(() => {
        expect(screen.getByText(/重新发送/)).toBeInTheDocument()
      })

      const codeInput = screen.getByPlaceholderText(/输入验证码/i)
      await userEvent.type(codeInput, '999999')

      const confirmButton = screen.getByRole('button', { name: /确定/i })
      fireEvent.click(confirmButton)

      // Then: 应该在modal内显示错误提示
      await waitFor(() => {
        const errorMessage = screen.getByText(/验证码/i)
        expect(errorMessage).toBeInTheDocument()
      })
    })
  })

  // ==================== 页面导航测试 ====================
  describe('页面导航', () => {
    it('应该支持导航到注册页面', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const registerLink = screen.getByText(/注册12306账户/i)
      expect(registerLink).toBeInTheDocument()
      expect(registerLink.closest('a, button')).toBeInTheDocument()
    })

    it('应该支持导航到忘记密码页面', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const forgotPasswordLink = screen.getByText(/忘记密码/i)
      expect(forgotPasswordLink).toBeInTheDocument()
      expect(forgotPasswordLink.closest('a, button')).toBeInTheDocument()
    })
  })
})

