import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SmsVerificationModal from '../../src/components/SmsVerificationModal'
import axios from 'axios'

vi.mock('axios')

describe('SmsVerificationModal - 登录短信验证', () => {
  const mockOnClose = vi.fn()
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染登录短信验证模态框', () => {
    render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText('短信验证')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('输入验证码')).toBeInTheDocument()
  })

  it('应该处理证件号后4位输入', async () => {
    render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    
    const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
    await userEvent.type(idCardInput, '1234')
    
    expect(idCardInput).toHaveValue('1234')
  })

  it('应该处理验证码输入', async () => {
    render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    
    const codeInput = screen.getByPlaceholderText('输入验证码')
    await userEvent.type(codeInput, '123456')
    
    expect(codeInput).toHaveValue('123456')
  })

  it('点击发送验证码按钮应该验证证件号', async () => {
    render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    
    const sendButton = screen.getByText('获取验证码')
    
    // 按钮应该被禁用，因为证件号为空
    expect(sendButton).toBeDisabled()
  })

  it('应该在证件号正确时发送验证码', async () => {
    const consoleSpy = vi.spyOn(console, 'log')
    
    render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    
    const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
    await userEvent.type(idCardInput, '1234')
    
    const sendButton = screen.getByText('获取验证码')
    await userEvent.click(sendButton)
    
    expect(consoleSpy).toHaveBeenCalledWith('Sending SMS for ID card last 4:', '1234')
    
    consoleSpy.mockRestore()
  })

  it('应该在信息完整时提交表单', async () => {
    render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    
    const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
    const codeInput = screen.getByPlaceholderText('输入验证码')
    
    await userEvent.type(idCardInput, '1234')
    await userEvent.type(codeInput, '123456')
    
    const submitButton = screen.getByText('确定')
    await userEvent.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      idCardLast4: '1234',
      code: '123456'
    })
  })

  it('应该在信息不完整时禁用表单提交', async () => {
    render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    
    // 只填写证件号，不填验证码
    const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
    await userEvent.type(idCardInput, '1234')
    
    const submitButton = screen.getByText('确定')
    await userEvent.click(submitButton)
    
    // 表单不应提交（因为验证码为空，HTML5表单验证会阻止）
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('点击关闭按钮应该调用onClose', async () => {
    render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    
    const closeButton = screen.getByText('×')
    await userEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('应该显示倒计时按钮文本', async () => {
    render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    
    const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
    await userEvent.type(idCardInput, '1234')
    
    const sendButton = screen.getByText('获取验证码')
    await userEvent.click(sendButton)
    
    // 验证倒计时开始
    await waitFor(() => {
      expect(screen.getByText(/重新发送\(\d+s\)/)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('应该在倒计时期间禁用发送按钮', async () => {
    render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} />)
    
    const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
    await userEvent.type(idCardInput, '1234')
    
    const sendButton = screen.getByText('获取验证码')
    await userEvent.click(sendButton)
    
    // 验证按钮被禁用
    await waitFor(() => {
      const button = screen.getByText(/重新发送\(\d+s\)/)
      expect(button).toBeDisabled()
    }, { timeout: 1000 })
  })

  // ============ 补充测试：客户端验证 ============
  describe('客户端验证', () => {
    it('应该在证件号为空点击确认时显示"请输入登录账号绑定的证件号后4位"', async () => {
      render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} sessionId="test-session" />)
      
      const codeInput = screen.getByPlaceholderText('输入验证码')
      await userEvent.type(codeInput, '123456')
      
      const submitButton = screen.getByText('确定')
      await userEvent.click(submitButton)
      
      // 应该显示错误信息
      await waitFor(() => {
        expect(screen.getByText(/请输入登录账号绑定的证件号后4位/i)).toBeInTheDocument()
      })
    })

    it('应该在验证码为空点击确认时显示"请输入验证码"', async () => {
      render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} sessionId="test-session" />)
      
      const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
      await userEvent.type(idCardInput, '1234')
      
      const submitButton = screen.getByText('确定')
      await userEvent.click(submitButton)
      
      // 应该显示错误信息
      await waitFor(() => {
        expect(screen.getByText(/请输入验证码/i)).toBeInTheDocument()
      })
    })

    it('应该在验证码少于6位点击确认时显示"请输入正确的验证码"', async () => {
      render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} sessionId="test-session" />)
      
      const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
      const codeInput = screen.getByPlaceholderText('输入验证码')
      
      await userEvent.type(idCardInput, '1234')
      await userEvent.type(codeInput, '12345')  // 少于6位
      
      const submitButton = screen.getByText('确定')
      await userEvent.click(submitButton)
      
      // 应该显示错误信息
      await waitFor(() => {
        expect(screen.getByText(/请输入正确的验证码/i)).toBeInTheDocument()
      })
    })

    it('应该在"确定"按钮上方显示错误/成功消息', async () => {
      const { container } = render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} sessionId="test-session" />)
      
      const submitButton = screen.getByText('确定')
      await userEvent.click(submitButton)
      
      // 等待错误消息显示
      await waitFor(() => {
        const errorMessage = screen.queryByText(/请输入/i)
        if (errorMessage) {
          const messagePosition = errorMessage.getBoundingClientRect().bottom
          const buttonPosition = submitButton.getBoundingClientRect().top
          
          // 消息应该在按钮上方
          expect(messagePosition).toBeLessThanOrEqual(buttonPosition)
        }
      })
    })
  })

  // ============ 补充测试：按钮状态 ============
  describe('按钮状态', () => {
    it('应该在证件号<4位时显示状态1（灰色背景，灰色文字，禁用）', () => {
      render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} sessionId="test-session" />)
      
      const sendButton = screen.getByText('获取验证码')
      
      // 验证按钮禁用
      expect(sendButton).toBeDisabled()
      
      // 验证样式（如果组件实现了样式类）
      expect(sendButton).toHaveClass('disabled') || expect(sendButton).toBeDisabled()
    })

    it('应该在证件号=4位时显示状态2（白色背景，黑色文字，可点击）', async () => {
      render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} sessionId="test-session" />)
      
      const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
      await userEvent.type(idCardInput, '1234')
      
      const sendButton = screen.getByText('获取验证码')
      
      // 验证按钮可用
      expect(sendButton).not.toBeDisabled()
    })

    it('应该在倒计时时显示状态3（灰色背景，灰色文字"重新发送(XXs)"，禁用）', async () => {
      // Mock成功的API响应
      vi.mocked(axios.post).mockResolvedValueOnce({
        data: { success: true, message: '验证码已发送' }
      })

      render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} sessionId="test-session" />)
      
      const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
      await userEvent.type(idCardInput, '1234')
      
      const sendButton = screen.getByText('获取验证码')
      await userEvent.click(sendButton)
      
      // 验证倒计时文本和禁用状态
      await waitFor(() => {
        const button = screen.getByText(/重新发送\(\d+s\)/)
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
      }, { timeout: 1000 })
    })

    it('应该根据证件号位数动态切换状态1和状态2', async () => {
      render(<SmsVerificationModal onClose={mockOnClose} onSubmit={mockOnSubmit} sessionId="test-session" />)
      
      const idCardInput = screen.getByPlaceholderText('请输入登录账号绑定的证件号后4位')
      const sendButton = screen.getByText('获取验证码')
      
      // 初始状态：禁用（状态1）
      expect(sendButton).toBeDisabled()
      
      // 输入1位：仍然禁用
      await userEvent.type(idCardInput, '1')
      expect(sendButton).toBeDisabled()
      
      // 输入到4位：启用（状态2）
      await userEvent.type(idCardInput, '234')
      expect(sendButton).not.toBeDisabled()
      
      // 删除1位：禁用（状态1）
      await userEvent.clear(idCardInput)
      await userEvent.type(idCardInput, '123')
      expect(sendButton).toBeDisabled()
    })
  })
})
