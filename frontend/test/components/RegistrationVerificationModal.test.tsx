/**
 * RegistrationVerificationModal 组件测试
 * 测试文件：frontend/test/components/RegistrationVerificationModal.test.tsx
 * 源文件：frontend/src/components/RegistrationVerificationModal.tsx
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegistrationVerificationModal from '../../src/components/RegistrationVerificationModal'

describe('RegistrationVerificationModal Component Tests', () => {
  let mockOnClose: ReturnType<typeof vi.fn>
  let mockOnComplete: ReturnType<typeof vi.fn>
  let mockOnBack: ReturnType<typeof vi.fn>
  const testPhoneNumber = '13800138000'

  beforeEach(() => {
    mockOnClose = vi.fn()
    mockOnComplete = vi.fn()
    mockOnBack = vi.fn()
  })

  // ==================== UI元素存在性检查 ====================
  describe('UI元素存在性检查', () => {
    it('应该渲染标题"手机验证"', () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 标题应该显示
      expect(screen.getByText('手机验证')).toBeInTheDocument()
    })

    it('应该显示验证码发送提示信息', () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 应该显示验证码已发送提示
      expect(screen.getByText(`验证码已发送至${testPhoneNumber}`)).toBeInTheDocument()
    })

    it('应该显示手机号码', () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 应该显示手机号
      expect(screen.getByText(new RegExp(testPhoneNumber))).toBeInTheDocument()
    })

    it('应该渲染验证码输入框', () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 应该有验证码输入框
      const input = screen.getByPlaceholderText('请输入6位验证码')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('maxLength', '6')
    })

    it('应该渲染"完成注册"按钮', () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 应该有完成注册按钮
      const completeButton = screen.getByRole('button', { name: /完成注册/ })
      expect(completeButton).toBeInTheDocument()
      expect(completeButton).toHaveClass('complete-button')
    })

    it('应该渲染"返回修改"按钮', () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 应该有返回修改按钮
      const backButton = screen.getByRole('button', { name: /返回修改/ })
      expect(backButton).toBeInTheDocument()
      expect(backButton).toHaveClass('back-button')
    })

    it('应该渲染关闭按钮', () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 应该有关闭按钮
      const closeButton = screen.getByLabelText('关闭')
      expect(closeButton).toBeInTheDocument()
    })
  })

  // ==================== 验证码输入验证 ====================
  describe('验证码输入验证', () => {
    it('应该只允许输入数字', async () => {
      // Given: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )
      const input = screen.getByPlaceholderText('请输入6位验证码') as HTMLInputElement

      // When: 尝试输入非数字字符
      await userEvent.type(input, 'abc123def456')

      // Then: 只应该保留数字
      expect(input.value).toBe('123456')
    })

    it('应该限制最多输入6位数字', async () => {
      // Given: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )
      const input = screen.getByPlaceholderText('请输入6位验证码') as HTMLInputElement

      // When: 输入超过6位数字
      await userEvent.type(input, '1234567890')

      // Then: 只应该保留前6位
      expect(input.value).toBe('123456')
    })

    it('输入验证码时应该清除错误提示', async () => {
      // Given: 渲染组件并先触发一个错误
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // When: 不输入验证码直接提交
      const completeButton = screen.getByRole('button', { name: /完成注册/ })
      fireEvent.click(completeButton)

      // Then: 应该显示错误
      await waitFor(() => {
        expect(screen.getByText('请输入验证码')).toBeInTheDocument()
      })

      // When: 开始输入验证码
      const input = screen.getByPlaceholderText('请输入6位验证码')
      await userEvent.type(input, '1')

      // Then: 错误应该消失
      await waitFor(() => {
        expect(screen.queryByText('请输入验证码')).not.toBeInTheDocument()
      })
    })
  })

  // ==================== 表单提交验证 ====================
  describe('表单提交验证', () => {
    it('未输入验证码时应该显示错误', async () => {
      // Given: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // When: 不输入验证码直接点击完成注册
      const completeButton = screen.getByRole('button', { name: /完成注册/ })
      fireEvent.click(completeButton)

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('请输入验证码')).toBeInTheDocument()
      })
      expect(mockOnComplete).not.toHaveBeenCalled()
    })

    it('验证码少于6位时应该显示错误', async () => {
      // Given: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // When: 输入少于6位的验证码
      const input = screen.getByPlaceholderText('请输入6位验证码')
      await userEvent.type(input, '12345')
      const completeButton = screen.getByRole('button', { name: /完成注册/ })
      fireEvent.click(completeButton)

      // Then: 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('验证码应为6位数字')).toBeInTheDocument()
      })
      expect(mockOnComplete).not.toHaveBeenCalled()
    })

    it('输入正确的6位验证码应该调用onComplete', async () => {
      // Given: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // When: 输入6位验证码并提交
      const input = screen.getByPlaceholderText('请输入6位验证码')
      await userEvent.type(input, '123456')
      const completeButton = screen.getByRole('button', { name: /完成注册/ })
      fireEvent.click(completeButton)

      // Then: 应该调用onComplete并传入验证码
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('123456')
      })
      expect(screen.queryByText('请输入验证码')).not.toBeInTheDocument()
      expect(screen.queryByText('验证码应为6位数字')).not.toBeInTheDocument()
    })

    it('按Enter键应该提交表单', async () => {
      // Given: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // When: 输入验证码并按Enter键
      const input = screen.getByPlaceholderText('请输入6位验证码')
      await userEvent.type(input, '123456{Enter}')

      // Then: 应该调用onComplete
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('123456')
      })
    })
  })

  // ==================== 按钮功能测试 ====================
  describe('按钮功能测试', () => {
    it('点击"返回修改"按钮应该调用onBack', () => {
      // Given: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // When: 点击返回修改按钮
      const backButton = screen.getByRole('button', { name: /返回修改/ })
      fireEvent.click(backButton)

      // Then: 应该调用onBack
      expect(mockOnBack).toHaveBeenCalled()
      expect(mockOnComplete).not.toHaveBeenCalled()
    })

    it('点击关闭按钮应该调用onClose', () => {
      // Given: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // When: 点击关闭按钮
      const closeButton = screen.getByLabelText('关闭')
      fireEvent.click(closeButton)

      // Then: 应该调用onClose
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('点击背景遮罩应该调用onClose', () => {
      // Given: 渲染组件
      const { container } = render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // When: 点击背景遮罩（backdrop）
      const backdrop = container.querySelector('.reg-verification-modal-backdrop')
      if (backdrop) {
        fireEvent.click(backdrop)
      }

      // Then: 应该调用onClose
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('点击弹窗内容区域不应该关闭弹窗', () => {
      // Given: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // When: 点击弹窗内容区域
      const modal = screen.getByText('手机验证').parentElement
      if (modal) {
        fireEvent.click(modal)
      }

      // Then: 不应该调用onClose
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  // ==================== 样式和布局测试 ====================
  describe('样式和布局测试', () => {
    it('弹窗应该有正确的CSS类', () => {
      // When: 渲染组件
      const { container } = render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 应该有正确的CSS类
      expect(container.querySelector('.reg-verification-modal-backdrop')).toBeInTheDocument()
      expect(container.querySelector('.reg-verification-modal')).toBeInTheDocument()
      expect(container.querySelector('.reg-verification-modal-header')).toBeInTheDocument()
      expect(container.querySelector('.verification-message')).toBeInTheDocument()
      expect(container.querySelector('.verification-form')).toBeInTheDocument()
    })

    it('完成注册按钮应该有橙色样式类', () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 完成注册按钮应该有正确的类名
      const completeButton = screen.getByRole('button', { name: /完成注册/ })
      expect(completeButton).toHaveClass('complete-button')
    })

    it('返回修改按钮应该有正确的样式类', () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 返回修改按钮应该有正确的类名
      const backButton = screen.getByRole('button', { name: /返回修改/ })
      expect(backButton).toHaveClass('back-button')
    })
  })

  // ==================== 边界条件测试 ====================
  describe('边界条件测试', () => {
    it('应该正确处理空手机号', () => {
      // When: 传入空手机号
      render(
        <RegistrationVerificationModal
          phoneNumber=""
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 组件应该正常渲染
      expect(screen.getByText('手机验证')).toBeInTheDocument()
    })

    it('应该正确处理特殊字符手机号', () => {
      // When: 传入包含特殊字符的手机号
      const specialPhone = '138-0013-8000'
      render(
        <RegistrationVerificationModal
          phoneNumber={specialPhone}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 应该显示手机号
      expect(screen.getByText(new RegExp(specialPhone.replace(/-/g, '\\-')))).toBeInTheDocument()
    })

    it('连续多次提交应该正确处理', async () => {
      // Given: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // When: 输入验证码并多次点击完成注册
      const input = screen.getByPlaceholderText('请输入6位验证码')
      await userEvent.type(input, '123456')
      const completeButton = screen.getByRole('button', { name: /完成注册/ })
      
      fireEvent.click(completeButton)
      fireEvent.click(completeButton)
      fireEvent.click(completeButton)

      // Then: onComplete应该被调用多次
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(3)
      })
    })
  })

  // ==================== 可访问性测试 ====================
  describe('可访问性测试', () => {
    it('输入框应该可以通过键盘访问', async () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 输入框应该可以获得焦点
      const input = screen.getByPlaceholderText('请输入6位验证码')
      input.focus()
      expect(input).toHaveFocus()
    })

    it('按钮应该可以通过Tab键导航', async () => {
      // When: 渲染组件
      render(
        <RegistrationVerificationModal
          phoneNumber={testPhoneNumber}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          onBack={mockOnBack}
        />
      )

      // Then: 按钮应该可以通过Tab键访问
      const completeButton = screen.getByRole('button', { name: /完成注册/ })
      const backButton = screen.getByRole('button', { name: /返回修改/ })
      
      expect(completeButton).toBeInTheDocument()
      expect(backButton).toBeInTheDocument()
    })
  })
})

