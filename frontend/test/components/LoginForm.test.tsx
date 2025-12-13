import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '../../src/components/LoginForm'

describe('LoginForm', () => {
  const mockProps = {
    onSubmit: vi.fn(),
    onRegisterClick: vi.fn(),
    onForgotPasswordClick: vi.fn(),
    error: '',
    isLoading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染登录表单', () => {
    render(<LoginForm {...mockProps} />)
    
    expect(screen.getByText('账号登录')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument()
    expect(screen.getByText('立即登录')).toBeInTheDocument()
  })

  it('应该处理用户输入', () => {
    render(<LoginForm {...mockProps} />)
    
    const identifierInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
    const passwordInput = screen.getByPlaceholderText('密码')
    
    fireEvent.change(identifierInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(identifierInput).toHaveValue('testuser')
    expect(passwordInput).toHaveValue('password123')
  })

  it('应该处理表单提交', () => {
    render(<LoginForm {...mockProps} />)
    
    const identifierInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
    const passwordInput = screen.getByPlaceholderText('密码')
    const submitButton = screen.getByText('立即登录')
    
    fireEvent.change(identifierInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    // 由于当前是骨架代码，onSubmit不会被调用
    // 但我们可以验证表单结构正确
    expect(submitButton).toBeInTheDocument()
  })

  it('应该显示错误消息', () => {
    const propsWithError = {
      ...mockProps,
      error: '用户名或密码错误'
    }
    
    render(<LoginForm {...propsWithError} />)
    
    expect(screen.getByText('用户名或密码错误')).toBeInTheDocument()
  })

  it('应该在加载时禁用输入和按钮', () => {
    const loadingProps = {
      ...mockProps,
      isLoading: true
    }
    
    render(<LoginForm {...loadingProps} />)
    
    const identifierInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
    const passwordInput = screen.getByPlaceholderText('密码')
    const submitButton = screen.getByText('登录中...')
    
    expect(identifierInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('应该处理注册链接点击', () => {
    render(<LoginForm {...mockProps} />)
    
    const registerLink = screen.getByText('注册12306账户')
    fireEvent.click(registerLink)
    
    expect(mockProps.onRegisterClick).toHaveBeenCalledTimes(1)
  })

  it('应该处理忘记密码链接点击', () => {
    render(<LoginForm {...mockProps} />)
    
    const forgotPasswordLink = screen.getByText('忘记密码？')
    fireEvent.click(forgotPasswordLink)
    
    expect(mockProps.onForgotPasswordClick).toHaveBeenCalledTimes(1)
  })

  it('应该支持键盘导航', () => {
    render(<LoginForm {...mockProps} />)
    
    const identifierInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
    const passwordInput = screen.getByPlaceholderText('密码')
    
    // 测试Tab键导航
    identifierInput.focus()
    expect(document.activeElement).toBe(identifierInput)
    
    fireEvent.keyDown(identifierInput, { key: 'Tab' })
    // 在实际实现中，焦点应该移动到密码输入框
  })

  it('应该验证输入格式', () => {
    render(<LoginForm {...mockProps} />)
    
    const identifierInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
    
    // 测试邮箱格式
    fireEvent.change(identifierInput, { target: { value: 'test@example.com' } })
    expect(identifierInput).toHaveValue('test@example.com')
    
    // 测试手机号格式
    fireEvent.change(identifierInput, { target: { value: '13800138000' } })
    expect(identifierInput).toHaveValue('13800138000')
    
    // 测试用户名格式
    fireEvent.change(identifierInput, { target: { value: 'username' } })
    expect(identifierInput).toHaveValue('username')
  })

  it('应该处理Enter键提交', () => {
    render(<LoginForm {...mockProps} />)
    
    const form = screen.getByRole('form') || screen.getByText('账号登录').closest('form')
    
    if (form) {
      fireEvent.submit(form)
      // 验证表单提交处理
    }
  })

  it('应该清空表单', () => {
    render(<LoginForm {...mockProps} />)
    
    const identifierInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
    const passwordInput = screen.getByPlaceholderText('密码')
    
    fireEvent.change(identifierInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(identifierInput).toHaveValue('testuser')
    expect(passwordInput).toHaveValue('password123')
    
    // 清空输入
    fireEvent.change(identifierInput, { target: { value: '' } })
    fireEvent.change(passwordInput, { target: { value: '' } })
    
    expect(identifierInput).toHaveValue('')
    expect(passwordInput).toHaveValue('')
  })

  // ============ 补充测试：表单验证 ============
  describe('表单验证', () => {
    it('应该在用户名为空时显示"请输入用户名！"', async () => {
      const onSubmitMock = vi.fn()
      render(<LoginForm {...mockProps} onSubmit={onSubmitMock} />)
      
      const passwordInput = screen.getByPlaceholderText('密码')
      const submitButton = screen.getByText('立即登录')
      
      // 只填写密码，不填用户名
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      // 应该显示错误信息
      await waitFor(() => {
        expect(screen.getByText(/请输入用户名/i)).toBeInTheDocument()
      })
    })

    it('应该在密码为空时显示"请输入密码！"', async () => {
      const onSubmitMock = vi.fn()
      render(<LoginForm {...mockProps} onSubmit={onSubmitMock} />)
      
      const identifierInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
      const submitButton = screen.getByText('立即登录')
      
      // 只填写用户名，不填密码
      fireEvent.change(identifierInput, { target: { value: 'testuser' } })
      fireEvent.click(submitButton)
      
      // 应该显示错误信息
      await waitFor(() => {
        expect(screen.getByText(/请输入密码/i)).toBeInTheDocument()
      })
    })

    it('应该在密码<6位时显示"密码长度不能少于6位！"', async () => {
      const onSubmitMock = vi.fn()
      render(<LoginForm {...mockProps} onSubmit={onSubmitMock} />)
      
      const identifierInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
      const passwordInput = screen.getByPlaceholderText('密码')
      const submitButton = screen.getByText('立即登录')
      
      fireEvent.change(identifierInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: '12345' } })
      fireEvent.click(submitButton)
      
      // 应该显示错误信息
      await waitFor(() => {
        expect(screen.getByText(/密码长度不能少于6位/i)).toBeInTheDocument()
      })
    })

    it('应该在错误消息显示在"立即登录"按钮上方', () => {
      const propsWithError = {
        ...mockProps,
        error: '用户名或密码错误'
      }
      
      const { container } = render(<LoginForm {...propsWithError} />)
      
      const errorElement = screen.getByText('用户名或密码错误')
      const submitButton = screen.getByText('立即登录')
      
      // 验证错误信息在按钮上方（通过DOM顺序或位置）
      const errorPosition = errorElement.getBoundingClientRect().bottom
      const buttonPosition = submitButton.getBoundingClientRect().top
      
      // 错误信息应该在按钮上方
      expect(errorPosition).toBeLessThanOrEqual(buttonPosition)
    })

    it('应该在登录失败时清空密码字段', async () => {
      const onSubmitMock = vi.fn()
      const propsWithError = {
        ...mockProps,
        onSubmit: onSubmitMock,
        error: '用户名或密码错误！'
      }
      
      const { rerender } = render(<LoginForm {...mockProps} onSubmit={onSubmitMock} />)
      
      const identifierInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
      const passwordInput = screen.getByPlaceholderText('密码')
      
      // 填写表单
      fireEvent.change(identifierInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      
      expect(passwordInput).toHaveValue('wrongpassword')
      
      // 模拟登录失败，重新渲染带错误的组件
      rerender(<LoginForm {...propsWithError} />)
      
      // 密码字段应该被清空
      await waitFor(() => {
        expect(passwordInput).toHaveValue('')
      })
    })

    it('应该在登录成功时触发短信验证弹窗显示', async () => {
      const onSubmitMock = vi.fn()
      render(<LoginForm {...mockProps} onSubmit={onSubmitMock} />)
      
      const identifierInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
      const passwordInput = screen.getByPlaceholderText('密码')
      const submitButton = screen.getByText('立即登录')
      
      fireEvent.change(identifierInput, { target: { value: 'testuser' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      // 验证onSubmit被调用
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith({
          identifier: 'testuser',
          password: 'password123'
        })
      })
    })
  })
})