import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RegisterForm from '../../src/components/RegisterForm.vue'

describe('RegisterForm', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(RegisterForm, {
      props: {
        onRegisterSuccess: vi.fn(),
        onSwitchToLogin: vi.fn()
      }
    })
  })

  describe('Component Rendering', () => {
    it('should render all required registration fields', () => {
      // 验收标准：组件应渲染所有必填的注册字段输入框
      const requiredFields = [
        'username-input',
        'password-input',
        'confirm-password-input',
        'real-name-input',
        'id-type-select',
        'id-number-input',
        'passenger-type-select',
        'phone-input',
        'email-input'
      ]

      requiredFields.forEach(fieldId => {
        const field = wrapper.find(`[data-testid="${fieldId}"]`)
        expect(field.exists()).toBe(true)
      })
    })

    it('should include terms agreement checkbox', () => {
      // 验收标准：包含服务条款同意复选框
      const termsCheckbox = wrapper.find('[data-testid="terms-checkbox"]')
      const termsLabel = wrapper.find('[data-testid="terms-label"]')
      
      expect(termsCheckbox.exists()).toBe(true)
      expect(termsLabel.exists()).toBe(true)
      expect(termsLabel.text()).toContain('服务条款')
    })

    it('should have submit and cancel buttons', () => {
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      const cancelButton = wrapper.find('[data-testid="cancel-button"]')
      
      expect(submitButton.exists()).toBe(true)
      expect(cancelButton.exists()).toBe(true)
      expect(submitButton.text()).toContain('注册')
      expect(cancelButton.text()).toContain('取消')
    })
  })

  describe('Real-time Validation', () => {
    it('should validate username format in real-time', async () => {
      // 验收标准：实时验证输入格式（用户名、密码强度、证件号码等）
      const usernameInput = wrapper.find('[data-testid="username-input"]')
      
      // 测试无效用户名
      await usernameInput.setValue('ab')
      expect(wrapper.vm.errors.username).toContain('用户名长度不能少于3位')
      
      // 测试有效用户名
      await usernameInput.setValue('validuser')
      expect(wrapper.vm.errors.username).toBe('')
    })

    it('should validate password strength in real-time', async () => {
      const passwordInput = wrapper.find('[data-testid="password-input"]')
      
      // 测试弱密码
      await passwordInput.setValue('123')
      expect(wrapper.vm.errors.password).toContain('密码强度不够')
      
      // 测试强密码
      await passwordInput.setValue('StrongPass123!')
      expect(wrapper.vm.errors.password).toBe('')
    })

    it('should validate ID number format in real-time', async () => {
      const idNumberInput = wrapper.find('[data-testid="id-number-input"]')
      
      // 测试无效身份证号
      await idNumberInput.setValue('123456')
      expect(wrapper.vm.errors.idNumber).toContain('证件号码格式不正确')
      
      // 测试有效身份证号
      await idNumberInput.setValue('123456789012345678')
      expect(wrapper.vm.errors.idNumber).toBe('')
    })

    it('should validate email format in real-time', async () => {
      const emailInput = wrapper.find('[data-testid="email-input"]')
      
      // 测试无效邮箱
      await emailInput.setValue('invalid-email')
      expect(wrapper.vm.errors.email).toContain('邮箱格式不正确')
      
      // 测试有效邮箱
      await emailInput.setValue('user@example.com')
      expect(wrapper.vm.errors.email).toBe('')
    })

    it('should validate phone number format in real-time', async () => {
      const phoneInput = wrapper.find('[data-testid="phone-input"]')
      
      // 测试无效手机号
      await phoneInput.setValue('123')
      expect(wrapper.vm.errors.phoneNumber).toContain('手机号格式不正确')
      
      // 测试有效手机号
      await phoneInput.setValue('13912345678')
      expect(wrapper.vm.errors.phoneNumber).toBe('')
    })
  })

  describe('Password Confirmation', () => {
    it('should show error when passwords do not match', async () => {
      // 验收标准：密码和确认密码不一致时显示错误提示
      const passwordInput = wrapper.find('[data-testid="password-input"]')
      const confirmPasswordInput = wrapper.find('[data-testid="confirm-password-input"]')
      
      await passwordInput.setValue('password123')
      await confirmPasswordInput.setValue('differentpassword')
      
      expect(wrapper.vm.errors.confirmPassword).toContain('两次输入的密码不一致')
    })

    it('should clear error when passwords match', async () => {
      const passwordInput = wrapper.find('[data-testid="password-input"]')
      const confirmPasswordInput = wrapper.find('[data-testid="confirm-password-input"]')
      
      await passwordInput.setValue('password123')
      await confirmPasswordInput.setValue('password123')
      
      expect(wrapper.vm.errors.confirmPassword).toBe('')
    })
  })

  describe('Terms Agreement', () => {
    it('should disable submit button when terms are not agreed', () => {
      // 验收标准：未同意时不能提交
      wrapper.vm.agreeTerms = false
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('should enable submit button when terms are agreed and form is valid', async () => {
      // 填写有效表单数据
      await wrapper.setData({
        username: 'testuser',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        realName: '张三',
        idType: '身份证',
        idNumber: '123456789012345678',
        passengerType: '成人',
        phoneNumber: '13912345678',
        email: 'test@example.com',
        agreeTerms: true,
        errors: {}
      })
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      expect(submitButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Loading State', () => {
    it('should show loading state during submission', () => {
      // 验收标准：提交时显示加载状态
      wrapper.vm.isLoading = true
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
      expect(submitButton.text()).toContain('注册中')
      
      const loadingSpinner = wrapper.find('[data-testid="loading-spinner"]')
      expect(loadingSpinner.exists()).toBe(true)
    })
  })

  describe('Success Message', () => {
    it('should show success message after successful registration', () => {
      // 验收标准：成功后显示成功消息
      const successMessage = '注册成功！'
      wrapper.vm.successMessage = successMessage
      
      const successElement = wrapper.find('[data-testid="success-message"]')
      expect(successElement.exists()).toBe(true)
      expect(successElement.text()).toContain(successMessage)
    })
  })

  describe('Field Error Display', () => {
    it('should display error messages at corresponding field positions', () => {
      // 验收标准：各字段验证失败时在对应位置显示错误提示
      const fieldErrors = {
        username: '用户名格式错误',
        password: '密码强度不够',
        email: '邮箱格式不正确',
        phoneNumber: '手机号格式不正确',
        idNumber: '证件号码格式不正确'
      }
      
      wrapper.vm.errors = fieldErrors
      
      Object.keys(fieldErrors).forEach(field => {
        const errorElement = wrapper.find(`[data-testid="${field}-error"]`)
        expect(errorElement.exists()).toBe(true)
        expect(errorElement.text()).toContain(fieldErrors[field])
      })
    })
  })

  describe('Form Submission', () => {
    it('should call handleRegister when submit button is clicked', async () => {
      const handleRegisterSpy = vi.spyOn(wrapper.vm, 'handleRegister')
      
      // 设置有效表单数据
      await wrapper.setData({
        username: 'testuser',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        realName: '张三',
        idType: '身份证',
        idNumber: '123456789012345678',
        passengerType: '成人',
        phoneNumber: '13912345678',
        email: 'test@example.com',
        agreeTerms: true
      })
      
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      await submitButton.trigger('click')
      
      expect(handleRegisterSpy).toHaveBeenCalled()
    })

    it('should call onSwitchToLogin when cancel button is clicked', async () => {
      const onSwitchToLogin = vi.fn()
      wrapper = mount(RegisterForm, {
        props: {
          onRegisterSuccess: vi.fn(),
          onSwitchToLogin
        }
      })
      
      const cancelButton = wrapper.find('[data-testid="cancel-button"]')
      await cancelButton.trigger('click')
      
      expect(onSwitchToLogin).toHaveBeenCalled()
    })

    it('should not submit when form has validation errors', async () => {
      wrapper.vm.errors = { username: '用户名格式错误' }
      wrapper.vm.agreeTerms = true
      
      const handleRegisterSpy = vi.spyOn(wrapper.vm, 'handleRegister')
      const submitButton = wrapper.find('[data-testid="submit-button"]')
      
      await submitButton.trigger('click')
      
      // 有验证错误时不应该调用注册函数
      expect(handleRegisterSpy).not.toHaveBeenCalled()
    })
  })

  describe('Validation Status', () => {
    it('should track validation status for each field', () => {
      const expectedValidationStatus = {
        username: 'valid',
        password: 'invalid',
        email: 'valid',
        phoneNumber: 'invalid',
        idNumber: 'valid'
      }
      
      wrapper.vm.validationStatus = expectedValidationStatus
      
      Object.keys(expectedValidationStatus).forEach(field => {
        const fieldElement = wrapper.find(`[data-testid="${field}-input"]`)
        const status = expectedValidationStatus[field]
        
        if (status === 'valid') {
          expect(fieldElement.classes()).toContain('valid')
        } else if (status === 'invalid') {
          expect(fieldElement.classes()).toContain('invalid')
        }
      })
    })
  })
})