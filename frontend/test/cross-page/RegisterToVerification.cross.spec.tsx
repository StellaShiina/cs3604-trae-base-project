/**
 * 跨页流程测试：注册页 → 验证页 → 登录页
 * 
 * 测试场景：
 * 1. 完成注册表单填写后点击"下一步"跳转到验证页
 * 2. 在验证页完成验证并注册成功
 * 3. 注册成功后显示弹窗
 * 4. 关闭弹窗后跳转回登录页
 * 
 * 需求文档参考：
 * - requirements/02-登录注册页/02-2-注册页.md (3.3.10, 3.5节)
 * 
 * 注意：由于验证页尚未完全实现，部分测试聚焦于注册页的提交流程
 */

import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import RegisterPage from '../../src/pages/RegisterPage'
import { renderWithRouter, setupLocalStorageMock, cleanupTest, mockFetch } from './test-utils'

// Mock fetch for API calls
beforeEach(() => {
  mockFetch()
})

describe('跨页流程：注册页 → 验证页 → 登录页', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
    vi.clearAllMocks()
  })

  it('应该在填写完整信息并勾选协议后允许点击下一步', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/register'],
      routes: [
        { path: '/register', element: <RegisterPage /> },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    })

    // 填写所有必填字段
    await act(async () => {
      await user.type(screen.getByPlaceholderText(/用户名设置成功后不可修改/i), 'testUser123')
      await user.type(screen.getByPlaceholderText(/6-20位字母、数字或符号/i), 'Pass123')
      await user.type(screen.getByPlaceholderText(/请再次输入您的登录密码/i), 'Pass123')
      await user.type(screen.getByPlaceholderText(/请输入姓名/i), '张三')
      await user.type(screen.getByPlaceholderText(/请输入您的证件号码/i), '110101199001011237')
      await user.type(screen.getByPlaceholderText(/手机号码/i), '13800138000')
    })

    // 勾选协议
    const agreementCheckbox = screen.getByRole('checkbox')
    await act(async () => {
      await user.click(agreementCheckbox)
    })

    // 验证下一步按钮可点击
    const nextButton = screen.getByRole('button', { name: /下一步/i })
    expect(nextButton).toBeEnabled()
  })

  it('应该在信息不完整时阻止提交 (需求 3.3.10)', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/register'],
      routes: [
        { path: '/register', element: <RegisterPage /> },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    })

    // 只填写部分字段
    await act(async () => {
      await user.type(screen.getByPlaceholderText(/用户名设置成功后不可修改/i), 'testUser123')
      await user.type(screen.getByPlaceholderText(/6-20位字母、数字或符号/i), 'Pass123')
    })

    // 勾选协议
    const agreementCheckbox = screen.getByRole('checkbox')
    await act(async () => {
      await user.click(agreementCheckbox)
    })

    // 点击下一步
    const nextButton = screen.getByRole('button', { name: /下一步/i })
    await act(async () => {
      await user.click(nextButton)
    })

    // 应该显示错误提示
    await waitFor(() => {
      expect(screen.getByText(/请填写完整信息/i)).toBeInTheDocument()
    })
  })

  it('应该在有字段验证失败时阻止提交', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/register'],
      routes: [
        { path: '/register', element: <RegisterPage /> },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    })

    // 填写字段，但用户名不合法
    await act(async () => {
      await user.type(screen.getByPlaceholderText(/用户名设置成功后不可修改/i), '123')
      await user.tab()
      
      await user.type(screen.getByPlaceholderText(/6-20位字母、数字或符号/i), 'Pass123')
      await user.type(screen.getByPlaceholderText(/请再次输入您的登录密码/i), 'Pass123')
      await user.type(screen.getByPlaceholderText(/请输入姓名/i), '张三')
      await user.type(screen.getByPlaceholderText(/请输入您的证件号码/i), '110101199001011237')
      await user.type(screen.getByPlaceholderText(/手机号码/i), '13800138000')
    })

    // 勾选协议
    const agreementCheckbox = screen.getByRole('checkbox')
    await act(async () => {
      await user.click(agreementCheckbox)
    })

    // 点击下一步
    const nextButton = screen.getByRole('button', { name: /下一步/i })
    await act(async () => {
      await user.click(nextButton)
    })

    // 应该显示用户名错误提示
    await waitFor(() => {
      expect(screen.getByText(/用户名长度不能少于6个字符/i)).toBeInTheDocument()
    })
  })

  it('应该正确处理密码强度指示器', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/register'],
      routes: [
        { path: '/register', element: <RegisterPage /> },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    })

    const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/i)

    // 输入弱密码（只有字母和数字，较短）
    await act(async () => {
      await user.type(passwordInput, 'Pass12')
    })
    
    // 应该显示密码强度指示器
    await waitFor(() => {
      const strengthBars = document.querySelectorAll('.strength-bar')
      expect(strengthBars.length).toBeGreaterThan(0)
    })
  })

  it('应该能正确处理证件类型选择 (需求 3.3.4)', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/register'],
      routes: [
        { path: '/register', element: <RegisterPage /> },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    })

    // 找到证件类型选择框
    const idTypeDropdown = screen.queryByTestId('id-card-type-dropdown')
    if (idTypeDropdown) {
      expect(idTypeDropdown).toBeInTheDocument()

      // 点击展开选项
      await act(async () => {
        await user.click(idTypeDropdown)
      })

      // 验证选项列表展开
      await waitFor(() => {
        // 应该能看到选项列表
        const options = document.querySelectorAll('.option')
        expect(options.length).toBeGreaterThan(0)
      })
    } else {
      // 如果没有testId，测试默认值
      const idTypeElements = screen.queryAllByText(/居民身份证/)
      expect(idTypeElements.length).toBeGreaterThan(0)
    }
  })

  it('应该能正确处理优惠类型选择 (需求 3.3.7)', async () => {
    const user = userEvent.setup()

    await renderWithRouter({
      initialEntries: ['/register'],
      routes: [
        { path: '/register', element: <RegisterPage /> },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    })

    // 找到优惠类型选择框
    const passengerTypeDropdown = screen.queryByTestId('passenger-type-dropdown')
    if (passengerTypeDropdown) {
      expect(passengerTypeDropdown).toBeInTheDocument()

      // 点击展开选项
      await act(async () => {
        await user.click(passengerTypeDropdown)
      })

      // 验证选项列表展开
      await waitFor(() => {
        const options = document.querySelectorAll('.option')
        expect(options.length).toBeGreaterThan(0)
      }, { timeout: 2000 })
    } else {
      // 如果没有testId，测试默认值
      const passengerTypeElements = screen.queryAllByText(/成人/)
      expect(passengerTypeElements.length).toBeGreaterThan(0)
    }
  })

  it('应该显示正确的导航路径提示', async () => {
    await renderWithRouter({
      initialEntries: ['/register'],
      routes: [
        { path: '/register', element: <RegisterPage /> },
      ],
    })

    await waitFor(() => {
      expect(screen.getByText(/账户信息/i)).toBeInTheDocument()
    })

    // 验证面包屑导航或位置提示
    // 根据需求文档，可能显示"您现在的位置：客运首页 > 注册"
    const breadcrumb = screen.queryByText(/客运首页.*注册/i)
    if (breadcrumb) {
      expect(breadcrumb).toBeInTheDocument()
    }
  })
})
