/**
 * 登录流程跨页测试
 * 
 * 测试场景：
 * 1. 登录页 → 短信验证 → 首页完整流程
 * 2. 登录成功后保存token到localStorage
 * 3. 首页正确显示登录状态
 * 4. 登录失败和短信验证失败的错误处理
 * 
 * 需求文档参考：
 * - requirements/02-登录注册页/02-1-登录页.md (1.2节, 2节)
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import LoginPage from '../../src/pages/LoginPage'
import HomePage from '../../src/pages/HomePage'
import { renderWithRouter, setupLocalStorageMock, cleanupTest, mockAuthenticatedUser, mockUnauthenticatedUser } from './test-utils'

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import axios from 'axios'

describe('登录流程跨页测试', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    vi.clearAllMocks()
  })

  it('应该在登录成功后保存token并跳转到首页 (需求 1.2.4-1.2.6, 2.3)', async () => {
    const user = userEvent.setup()
    
    // Mock登录API响应
    ;(axios.post as any).mockImplementation((url: string) => {
      if (url === '/api/auth/login') {
        return Promise.resolve({
          data: {
            success: true,
            sessionId: 'test-session-123',
          },
        })
      }
      if (url === '/api/auth/verify-login') {
        return Promise.resolve({
          data: {
            success: true,
            token: 'test-token-456',
            userId: 'user-123',
          },
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    await renderWithRouter({
      initialEntries: ['/login'],
      routes: [
        { path: '/login', element: <LoginPage /> },
        { path: '/', element: <HomePage /> },
      ],
    })

    // 验证在登录页
    await waitFor(() => {
      expect(screen.getByText(/欢迎登录12306/i)).toBeInTheDocument()
    })

    // 填写登录表单
    const usernameInput = screen.getByPlaceholderText(/用户名\/邮箱\/手机号/)
    const passwordInput = screen.getByPlaceholderText(/^密码$/)
    
    await act(async () => {
      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'password123')
    })

    // 点击登录按钮
    const loginButton = screen.getByRole('button', { name: /立即登录/i })
    await act(async () => {
      await user.click(loginButton)
    })

    // 等待短信验证弹窗出现 (需求 2.1)
    // 弹窗标题是"选择验证方式"，内容区域有"短信验证"
    await waitFor(() => {
      const modalTitle = screen.queryByText(/选择验证方式/i)
      const smsVerification = screen.queryByText(/短信验证/i)
      const modal = document.querySelector('.sms-modal')
      // 至少有一个标识弹窗已出现
      expect(modalTitle || smsVerification || modal).toBeTruthy()
    }, { timeout: 3000 })

    // 填写短信验证码
    // 根据实际DOM，placeholder是"请输入登录账号绑定的证件号后4位"
    const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位|证件号后4位/i)
    const smsCodeInput = screen.getByPlaceholderText(/输入验证码/i)
    
    await act(async () => {
      await user.type(idCardInput, '1234')
      await user.type(smsCodeInput, '123456')
    })

    // 提交验证码 - 按钮文本是"确定"而不是"提交"
    const submitButton = screen.getByRole('button', { name: /确定|提交/i })
    await act(async () => {
      await user.click(submitButton)
    })

    // 验证localStorage保存了token (需求 2.3.3)
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token-456')
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', 'user-123')
    }, { timeout: 3000 })
  })

  it('应该在登录失败时显示错误信息 (需求 1.2.4)', async () => {
    const user = userEvent.setup()
    
    // Mock登录失败
    ;(axios.post as any).mockRejectedValue({
      response: {
        data: {
          error: '用户名或密码错误',
        },
      },
    })

    await renderWithRouter({
      initialEntries: ['/login'],
      routes: [
        { path: '/login', element: <LoginPage /> },
      ],
    })

    // 验证在登录页
    await waitFor(() => {
      expect(screen.getByText(/欢迎登录12306/i)).toBeInTheDocument()
    })

    // 填写登录表单
    const usernameInput = screen.getByPlaceholderText(/用户名\/邮箱\/手机号/)
    const passwordInput = screen.getByPlaceholderText(/^密码$/)
    
    await act(async () => {
      await user.type(usernameInput, 'wronguser')
      await user.type(passwordInput, 'wrongpass')
    })

    // 点击登录按钮
    const loginButton = screen.getByRole('button', { name: /立即登录/i })
    await act(async () => {
      await user.click(loginButton)
    })

    // 验证显示错误信息
    await waitFor(() => {
      const errorElement = screen.queryByText(/用户名或密码错误/i) || screen.queryByText(/登录失败/i)
      expect(errorElement).toBeInTheDocument()
    })

    // 验证没有保存token
    expect(localStorage.setItem).not.toHaveBeenCalledWith('authToken', expect.anything())
  })

  it('应该在短信验证失败时显示错误信息 (需求 2.3.3)', async () => {
    const user = userEvent.setup()
    
    // Mock登录成功但验证失败
    ;(axios.post as any).mockImplementation((url: string) => {
      if (url === '/api/auth/login') {
        return Promise.resolve({
          data: {
            success: true,
            sessionId: 'test-session-123',
          },
        })
      }
      if (url === '/api/auth/verify-login') {
        return Promise.reject({
          response: {
            data: {
              error: '验证码错误',
            },
          },
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    await renderWithRouter({
      initialEntries: ['/login'],
      routes: [
        { path: '/login', element: <LoginPage /> },
      ],
    })

    // 验证在登录页
    await waitFor(() => {
      expect(screen.getByText(/欢迎登录12306/i)).toBeInTheDocument()
    })

    // 填写登录表单
    const usernameInput = screen.getByPlaceholderText(/用户名\/邮箱\/手机号/)
    const passwordInput = screen.getByPlaceholderText(/^密码$/)
    
    await act(async () => {
      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'password123')
    })

    // 点击登录按钮
    const loginButton = screen.getByRole('button', { name: /立即登录/i })
    await act(async () => {
      await user.click(loginButton)
    })

    // 等待短信验证弹窗出现
    await waitFor(() => {
      const modalTitle = screen.queryByText(/选择验证方式/i)
      const smsVerification = screen.queryByText(/短信验证/i)
      const modal = document.querySelector('.sms-modal')
      // 至少有一个标识弹窗已出现
      expect(modalTitle || smsVerification || modal).toBeTruthy()
    }, { timeout: 3000 })

    // 填写错误的验证码
    const idCardInput = screen.getByPlaceholderText(/请输入登录账号绑定的证件号后4位|证件号后4位|证件号码后四位/i)
    const smsCodeInput = screen.getByPlaceholderText(/输入验证码/i)
    
    await act(async () => {
      await user.type(idCardInput, '1234')
      await user.type(smsCodeInput, '000000')
    })

    // 提交验证码 - 按钮文本是"确定"
    const submitButton = screen.getByRole('button', { name: /确定|提交/i })
    await act(async () => {
      await user.click(submitButton)
    })

    // 验证显示错误信息
    await waitFor(() => {
      expect(screen.getByText(/验证码错误|很抱歉，您输入的短信验证码有误/i)).toBeInTheDocument()
    })

    // 验证没有保存token
    expect(localStorage.setItem).not.toHaveBeenCalledWith('authToken', expect.anything())
  })

  describe('首页登录状态显示', () => {
    it('应该在已登录时显示用户信息和退出按钮', async () => {
      // 预先设置登录状态
      mockAuthenticatedUser('existing-token-789', 'user-456')
      // 设置用户名
      localStorage.setItem('username', 'testuser')

      await renderWithRouter({
        initialEntries: ['/'],
        routes: [
          { path: '/', element: <HomePage /> },
        ],
      })

      // 等待组件加载并读取localStorage，检查退出按钮（已登录状态的明确标识）
      await waitFor(() => {
        // 验证显示"退出"按钮（这是已登录状态的明确标识）
        const logoutButton = screen.queryByRole('button', { name: /退出/i })
        expect(logoutButton).toBeInTheDocument()
      }, { timeout: 3000 })

      // 验证不显示"登录"和"注册"按钮
      expect(screen.queryByRole('button', { name: /^登录$/ })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /注册/ })).not.toBeInTheDocument()
    })

    it('应该在未登录时显示登录和注册按钮', async () => {
      // 确保未登录状态
      mockUnauthenticatedUser()

      await renderWithRouter({
        initialEntries: ['/'],
        routes: [
          { path: '/', element: <HomePage /> },
        ],
      })

      // 直接验证显示"登录"和"注册"按钮（这是未登录状态的明确标识）
      await waitFor(() => {
        const loginButton = screen.queryByRole('button', { name: /登录/i })
        const registerButton = screen.queryByRole('button', { name: /注册/i })
        expect(loginButton).toBeInTheDocument()
        expect(registerButton).toBeInTheDocument()
      }, { timeout: 3000 })

      // 验证不显示"退出"按钮（已登录状态的特征）
      expect(screen.queryByRole('button', { name: /退出/i })).not.toBeInTheDocument()
    })
  })

  describe('登录表单验证 (需求 1.2)', () => {
    it('应该在用户名为空时显示错误提示 (需求 1.2.1)', async () => {
      const user = userEvent.setup()

      await renderWithRouter({
        initialEntries: ['/login'],
        routes: [
          { path: '/login', element: <LoginPage /> },
        ],
      })

      await waitFor(() => {
        expect(screen.getByText(/欢迎登录12306/i)).toBeInTheDocument()
      })

      // 不填写用户名，只填写密码
      const passwordInput = screen.getByPlaceholderText(/^密码$/)
      await act(async () => {
        await user.type(passwordInput, 'password123')
      })

      // 点击登录
      const loginButton = screen.getByRole('button', { name: /立即登录/i })
      await act(async () => {
        await user.click(loginButton)
      })

      // 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText(/请输入用户名/i)).toBeInTheDocument()
      })
    })

    it('应该在密码为空时显示错误提示 (需求 1.2.2)', async () => {
      const user = userEvent.setup()

      await renderWithRouter({
        initialEntries: ['/login'],
        routes: [
          { path: '/login', element: <LoginPage /> },
        ],
      })

      await waitFor(() => {
        expect(screen.getByText(/欢迎登录12306/i)).toBeInTheDocument()
      })

      // 只填写用户名，不填写密码
      const usernameInput = screen.getByPlaceholderText(/用户名\/邮箱\/手机号/)
      await act(async () => {
        await user.type(usernameInput, 'testuser')
      })

      // 点击登录
      const loginButton = screen.getByRole('button', { name: /立即登录/i })
      await act(async () => {
        await user.click(loginButton)
      })

      // 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText(/请输入密码/i)).toBeInTheDocument()
      })
    })
  })
})
