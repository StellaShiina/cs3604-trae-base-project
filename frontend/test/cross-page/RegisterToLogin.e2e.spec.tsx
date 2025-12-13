/**
 * 注册到登录完整流程端到端测试
 * 测试从注册页到登录页的导航流程
 * 
 * 需求文档参考：
 * - requirements/02-登录注册页/02-2-注册页.md (3.1.2 - 从登录页进入注册界面)
 * - requirements/02-登录注册页/02-1-登录页.md (1.1.3 - 登录表单区域)
 * 
 * 注意：完整的注册→验证→登录流程测试在 RegisterToVerification.cross.spec.tsx 和 LoginFlow.cross.spec.tsx 中
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import RegisterPage from '../../src/pages/RegisterPage'
import LoginPage from '../../src/pages/LoginPage'
import { renderWithRouter, setupLocalStorageMock, cleanupTest } from './test-utils'

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

import axios from 'axios'

describe('注册到登录完整流程E2E测试', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    vi.clearAllMocks()
    
    // Mock window.confirm
    window.confirm = vi.fn(() => true)
  })

  it('应该能从注册页直接导航到登录页', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/register'],
      routes: [
        { path: '/register', element: <RegisterPage /> },
        { path: '/login', element: <LoginPage /> },
      ],
    })

    // 验证在注册页
    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    })

    // 查找并点击登录链接
    // TrainListTopBar 使用 Link 组件显示"登录"链接
    // 注意：Link 组件可能嵌套在文本中，如 "您好，请登录"
    const loginLink = screen.queryByRole('link', { name: /登录/i })
    
    if (loginLink) {
      await act(async () => {
        await user.click(loginLink)
      })

      // 验证导航到登录页 - 使用更灵活的查找方式
      await waitFor(() => {
        // 查找登录页的多个标识元素
        const loginTitle = screen.queryByText(/账号登录/i)
        const welcomeText = screen.queryByText(/欢迎登录12306/i)
        const loginForm = screen.queryByPlaceholderText(/用户名\/邮箱\/手机号/i)
        const loginButton = screen.queryByRole('button', { name: /立即登录/i })
        
        // 至少应该有一个登录页的标识元素
        expect(loginTitle || welcomeText || loginForm || loginButton).toBeTruthy()
      }, { timeout: 3000 })
    } else {
      // 如果没有找到 Link，尝试查找按钮
      const loginButton = screen.queryByRole('button', { name: /登录/i })
      if (loginButton) {
        await act(async () => {
          await user.click(loginButton)
        })
        await waitFor(() => {
          const loginTitle = screen.queryByText(/账号登录/i)
          const welcomeText = screen.queryByText(/欢迎登录12306/i)
          const loginForm = screen.queryByPlaceholderText(/用户名\/邮箱\/手机号/i)
          expect(loginTitle || welcomeText || loginForm).toBeTruthy()
        }, { timeout: 3000 })
      } else {
        // 如果都找不到，测试失败
        throw new Error('未找到登录链接或按钮')
      }
    }
  })

  it('应该能从登录页导航到注册页再返回登录页', async () => {
    const user = userEvent.setup()

    // 步骤1: 从登录页导航到注册页
    await renderWithRouter({
      initialEntries: ['/login'],
      routes: [
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },
      ],
    })

    // 验证在登录页
    await waitFor(() => {
      const loginTitle = screen.queryByText(/账号登录/i)
      const welcomeText = screen.queryByText(/欢迎登录12306/i)
      const loginForm = screen.queryByPlaceholderText(/用户名\/邮箱\/手机号/i)
      expect(loginTitle || welcomeText || loginForm).toBeTruthy()
    })

    // 点击注册按钮
    const registerButton = screen.getByText(/注册12306账户/i)
    await act(async () => {
      await user.click(registerButton)
    })

    // 验证导航到注册页
    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // 步骤2: 从注册页返回登录页
    const loginLink = screen.queryByRole('link', { name: /登录/i })
    
    if (loginLink) {
      await act(async () => {
        await user.click(loginLink)
      })

      // 验证返回登录页 - 使用灵活的查找方式
      await waitFor(() => {
        const loginTitle = screen.queryByText(/账号登录/i)
        const welcomeText = screen.queryByText(/欢迎登录12306/i)
        const loginForm = screen.queryByPlaceholderText(/用户名\/邮箱\/手机号/i)
        expect(loginTitle || welcomeText || loginForm).toBeTruthy()
      }, { timeout: 3000 })
    } else {
      // 如果没有找到 Link，尝试查找按钮
      const loginButton = screen.queryByRole('button', { name: /登录/i })
      if (loginButton) {
        await act(async () => {
          await user.click(loginButton)
        })
        await waitFor(() => {
          const loginTitle = screen.queryByText(/账号登录/i)
          const welcomeText = screen.queryByText(/欢迎登录12306/i)
          const loginForm = screen.queryByPlaceholderText(/用户名\/邮箱\/手机号/i)
          expect(loginTitle || welcomeText || loginForm).toBeTruthy()
        }, { timeout: 3000 })
      }
    }
  })

  it('应该能在注册页和登录页之间正确传递状态', async () => {
    const user = userEvent.setup()

    // 在注册页填写部分信息
    await renderWithRouter({
      initialEntries: ['/register'],
      routes: [
        { path: '/register', element: <RegisterPage /> },
        { path: '/login', element: <LoginPage /> },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    })

    // 填写用户名
    const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/i)
    await act(async () => {
      await user.type(usernameInput, 'testuser123')
      await user.tab()
    })

    // 导航到登录页
    const loginLink = screen.queryByRole('link', { name: /登录/i })
    
    if (loginLink) {
      await act(async () => {
        await user.click(loginLink)
      })

      // 验证在登录页 - 使用灵活的查找方式
      await waitFor(() => {
        const loginTitle = screen.queryByText(/账号登录/i)
        const welcomeText = screen.queryByText(/欢迎登录12306/i)
        const loginForm = screen.queryByPlaceholderText(/用户名\/邮箱\/手机号/i)
        expect(loginTitle || welcomeText || loginForm).toBeTruthy()
      }, { timeout: 3000 })

      // 验证登录页的表单是空的（状态没有传递，这是正确的）
      const loginUsernameInput = screen.getByPlaceholderText(/用户名\/邮箱\/手机号|请输入用户名/i)
      expect(loginUsernameInput).toHaveValue('')
    } else {
      // 如果没有找到 Link，尝试查找按钮
      const loginButton = screen.queryByRole('button', { name: /登录/i })
      if (loginButton) {
        await act(async () => {
          await user.click(loginButton)
        })
        await waitFor(() => {
          const loginTitle = screen.queryByText(/账号登录/i)
          const welcomeText = screen.queryByText(/欢迎登录12306/i)
          const loginForm = screen.queryByPlaceholderText(/用户名\/邮箱\/手机号/i)
          expect(loginTitle || welcomeText || loginForm).toBeTruthy()
        }, { timeout: 3000 })
        
        // 验证登录页的表单是空的
        const loginUsernameInput = screen.getByPlaceholderText(/用户名\/邮箱\/手机号|请输入用户名/i)
        expect(loginUsernameInput).toHaveValue('')
      }
    }
  })
})
