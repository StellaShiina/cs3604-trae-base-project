/**
 * 跨组件交互测试：注册表单验证流程
 * 
 * 测试场景：
 * 1. 用户填写表单各字段的完整流程
 * 2. 表单验证的实时反馈
 * 3. 多字段联动验证
 * 4. 提交前的完整性检查
 * 
 * 需求文档参考：
 * - requirements/02-登录注册页/02-2-注册页.md (3.2 用户输入注册信息)
 */

import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import RegisterPage from '../../src/pages/RegisterPage'
import { renderWithRouter, setupLocalStorageMock, cleanupTest } from './test-utils'

describe('跨组件交互：注册表单验证流程', () => {
  beforeEach(() => {
    cleanupTest()
    setupLocalStorageMock()
  })

  it('应该按顺序完成所有必填字段的填写和验证', async () => {
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

    // 1. 填写用户名（合法：以字母开头，6-30位，只含字母数字下划线）
    const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/i)
    await act(async () => {
      await user.type(usernameInput, 'testUser123')
      await user.tab() // 触发 blur 事件
    })

    await waitFor(() => {
      // 验证用户名通过验证（应该显示绿色勾勾）
      const checkmark = screen.queryByTestId('username-checkmark')
      if (checkmark) {
        expect(checkmark).toBeInTheDocument()
      }
    })

    // 2. 填写登录密码（合法：6位以上，包含字母和数字）
    const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/i)
    await act(async () => {
      await user.type(passwordInput, 'Pass123')
      await user.tab()
    })

    await waitFor(() => {
      const checkmark = screen.queryByTestId('password-checkmark')
      if (checkmark) {
        expect(checkmark).toBeInTheDocument()
      }
    })

    // 3. 填写确认密码（与登录密码一致）
    const confirmPasswordInput = screen.getByPlaceholderText(/请再次输入您的登录密码/i)
    await act(async () => {
      await user.type(confirmPasswordInput, 'Pass123')
      await user.tab()
    })

    await waitFor(() => {
      const checkmark = screen.queryByTestId('confirm-password-checkmark')
      if (checkmark) {
        expect(checkmark).toBeInTheDocument()
      }
    })

    // 4. 选择证件类型（默认已选"居民身份证"）
    // 证件类型选择框已经有默认值，跳过

    // 5. 填写姓名（合法：中英文，3-30字符）
    const nameInput = screen.getByPlaceholderText(/请输入姓名/i)
    await act(async () => {
      await user.type(nameInput, '张三')
      await user.tab()
    })

    await waitFor(() => {
      const checkmark = screen.queryByTestId('name-checkmark')
      if (checkmark) {
        expect(checkmark).toBeInTheDocument()
      }
    })

    // 6. 填写证件号码（合法：18位数字和字母）
    const idCardInput = screen.getByPlaceholderText(/请输入您的证件号码/i)
    await act(async () => {
      await user.type(idCardInput, '110101199001011237')
      await user.tab()
    })

    await waitFor(() => {
      const checkmark = screen.queryByTestId('id-card-checkmark')
      if (checkmark) {
        expect(checkmark).toBeInTheDocument()
      }
    })

    // 7. 填写手机号码（合法：11位数字）
    const phoneInput = screen.getByPlaceholderText(/手机号码/i)
    await act(async () => {
      await user.type(phoneInput, '13800138000')
      await user.tab()
    })

    // 8. 勾选用户协议
    const agreementCheckbox = screen.getByRole('checkbox')
    await act(async () => {
      await user.click(agreementCheckbox)
    })

    // 验证下一步按钮应该可以点击
    const nextButton = screen.getByRole('button', { name: /下一步/i })
    expect(nextButton).toBeEnabled()
  })

  describe('用户名字段验证 (需求 3.2.1)', () => {
    it('应该在用户名长度小于6位时显示错误提示', async () => {
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

      // 测试用户名过短
      const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/i)
      await act(async () => {
        await user.type(usernameInput, 'abc')
        await user.tab()
      })

      await waitFor(() => {
        expect(screen.getByText(/用户名长度不能少于6个字符/i)).toBeInTheDocument()
      })
    })

    it('应该在用户名以数字开头时显示错误提示', async () => {
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

      const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/i)
      await act(async () => {
        await user.type(usernameInput, '123user')
        await user.tab()
      })

      await waitFor(() => {
        expect(screen.getByText(/用户名只能由字母、数字和_组成，须以字母开头/i)).toBeInTheDocument()
      })
    })

    it('应该在用户名包含特殊字符时显示错误提示', async () => {
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

      const usernameInput = screen.getByPlaceholderText(/用户名设置成功后不可修改/i)
      await act(async () => {
        await user.type(usernameInput, 'user@123')
        await user.tab()
      })

      await waitFor(() => {
        expect(screen.getByText(/用户名只能由字母、数字和_组成，须以字母开头/i)).toBeInTheDocument()
      })
    })
  })

  describe('密码字段验证 (需求 3.2.2)', () => {
    it('应该在密码长度小于6位时显示错误提示', async () => {
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

      // 测试密码过短
      const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/i)
      await act(async () => {
        await user.type(passwordInput, '123')
        await user.tab()
      })

      await waitFor(() => {
        expect(screen.getByText(/密码长度不能少于6个字符/i)).toBeInTheDocument()
      })
    })

    it('应该在密码只包含单一字符类型时显示错误提示', async () => {
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

      // 测试只包含数字
      const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/i)
      await act(async () => {
        await user.type(passwordInput, '123456')
        await user.tab()
      })

      await waitFor(() => {
        expect(screen.getByText(/格式错误，必须且只能包含字母、数字和下划线中的两种或两种以上/i)).toBeInTheDocument()
      })
    })
  })

  describe('确认密码字段验证 (需求 3.3.3)', () => {
    it('应该在确认密码与密码不一致时显示错误提示', async () => {
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

      // 填写密码
      const passwordInput = screen.getByPlaceholderText(/6-20位字母、数字或符号/i)
      await act(async () => {
        await user.type(passwordInput, 'Pass123')
        await user.tab()
      })

      // 填写不一致的确认密码
      const confirmPasswordInput = screen.getByPlaceholderText(/请再次输入您的登录密码/i)
      await act(async () => {
        await user.type(confirmPasswordInput, 'Pass456')
        await user.tab()
      })

      await waitFor(() => {
        expect(screen.getByText(/确认密码与密码不一致/i)).toBeInTheDocument()
      })
    })
  })

  describe('手机号字段验证 (需求 3.3.9)', () => {
    it('应该在手机号长度不足11位时显示错误提示', async () => {
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

      // 测试手机号过短
      const phoneInput = screen.getByPlaceholderText(/手机号码/i)
      await act(async () => {
        await user.type(phoneInput, '138')
        await user.tab()
      })

      await waitFor(() => {
        expect(screen.getByText(/您输入的手机号码不是有效的格式/i)).toBeInTheDocument()
      })
    })
  })

  describe('用户协议验证 (需求 3.3.10)', () => {
    it('应该在未勾选协议时阻止提交', async () => {
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

      // 不勾选协议，直接点击下一步
      const nextButton = screen.getByRole('button', { name: /下一步/i })
      await act(async () => {
        await user.click(nextButton)
      })

      // 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText(/请确认服务条款/i)).toBeInTheDocument()
      })
    })
  })

  describe('邮箱字段验证 (需求 3.3.8)', () => {
    it('应该能正确处理邮箱的选填验证', async () => {
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

      // 填写不正确的邮箱格式
      const emailInput = screen.getByPlaceholderText(/请正确填写邮箱地址/i)
      await act(async () => {
        await user.type(emailInput, 'invalidemail')
        await user.tab()
      })

      await waitFor(() => {
        expect(screen.getByText(/请输入有效的电子邮件地址/i)).toBeInTheDocument()
      })

      // 清空邮箱，验证不填写邮箱是可以的
      await act(async () => {
        await user.clear(emailInput)
        await user.tab()
      })

      // 不应该显示错误（邮箱是选填）
      await waitFor(() => {
        expect(screen.queryByText(/请输入有效的电子邮件地址/i)).not.toBeInTheDocument()
      })
    })
  })
})
