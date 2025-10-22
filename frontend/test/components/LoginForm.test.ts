import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '../../src/components/LoginForm.vue'

describe('LoginForm', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(LoginForm, {
      props: {
        onLoginSuccess: vi.fn(),
        onSwitchToRegister: vi.fn(),
        initialLoginType: 'account'
      }
    })
  })

  describe('Component Rendering', () => {
    it('should render account login and QR code login toggle tabs', () => {
      // 验收标准：组件应渲染账号登录和扫码登录的切换标签
      const accountTab = wrapper.find('[data-testid="account-login-tab"]')
      const qrcodeTab = wrapper.find('[data-testid="qrcode-login-tab"]')
      
      expect(accountTab.exists()).toBe(true)
      expect(qrcodeTab.exists()).toBe(true)
      expect(accountTab.text()).toContain('账号登录')
      expect(qrcodeTab.text()).toContain('扫码登录')
    })

    it('should display username/phone/email input and password input in account mode', () => {
      // 验收标准：账号登录模式下显示用户名/手机号/邮箱输入框、密码输入框
      wrapper.vm.loginType = 'account'
      
      const usernameInput = wrapper.find('[data-testid="username-input"]')
      const passwordInput = wrapper.find('[data-testid="password-input"]')
      
      expect(usernameInput.exists()).toBe(true)
      expect(passwordInput.exists()).toBe(true)
      expect(usernameInput.attributes('placeholder')).toContain('用户名/手机号/邮箱')
      expect(passwordInput.attributes('type')).toBe('password')
    })

    it('should include remember me checkbox and login button', () => {
      // 验收标准：包含"记住我"复选框和"立即登录"按钮
      const rememberCheckbox = wrapper.find('[data-testid="remember-me-checkbox"]')
      const loginButton = wrapper.find('[data-testid="login-button"]')
      
      expect(rememberCheckbox.exists()).toBe(true)
      expect(loginButton.exists()).toBe(true)
      expect(loginButton.text()).toContain('立即登录')
    })

    it('should provide forgot password and register links', () => {
      // 验收标准：提供"忘记密码"和"立即注册"链接
      const forgotPasswordLink = wrapper.find('[data-testid="forgot-password-link"]')
      const registerLink = wrapper.find('[data-testid="register-link"]')
      
      expect(forgotPasswordLink.exists()).toBe(true)
      expect(registerLink.exists()).toBe(true)
      expect(forgotPasswordLink.text()).toContain('忘记密码')
      expect(registerLink.text()).toContain('立即注册')
    })
  })

  describe('Loading State', () => {
    it('should disable login button and show loading state when isLoading is true', () => {
      // 验收标准：当isLoading状态为true时，登录按钮应被禁用并显示加载状态
      wrapper.vm.isLoading = true
      
      const loginButton = wrapper.find('[data-testid="login-button"]')
      expect(loginButton.attributes('disabled')).toBeDefined()
      expect(loginButton.text()).toContain('登录中')
      
      const loadingSpinner = wrapper.find('[data-testid="loading-spinner"]')
      expect(loadingSpinner.exists()).toBe(true)
    })

    it('should enable login button when isLoading is false', () => {
      wrapper.vm.isLoading = false
      
      const loginButton = wrapper.find('[data-testid="login-button"]')
      expect(loginButton.attributes('disabled')).toBeUndefined()
      expect(loginButton.text()).toContain('立即登录')
    })
  })

  describe('Error Handling', () => {
    it('should display error message when login fails', () => {
      // 验收标准：登录失败时显示错误信息
      const errorMessage = '用户名或密码错误'
      wrapper.vm.error = errorMessage
      
      const errorElement = wrapper.find('[data-testid="error-message"]')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.text()).toContain(errorMessage)
    })

    it('should hide error message when no error', () => {
      wrapper.vm.error = ''
      
      const errorElement = wrapper.find('[data-testid="error-message"]')
      expect(errorElement.exists()).toBe(false)
    })
  })

  describe('Login Type Switching', () => {
    it('should switch to QR code mode when QR code tab is clicked', () => {
      const qrcodeTab = wrapper.find('[data-testid="qrcode-login-tab"]')
      qrcodeTab.trigger('click')
      
      expect(wrapper.vm.loginType).toBe('qrcode')
      
      const qrcodeContainer = wrapper.find('[data-testid="qrcode-container"]')
      expect(qrcodeContainer.exists()).toBe(true)
    })

    it('should switch to account mode when account tab is clicked', () => {
      wrapper.vm.loginType = 'qrcode'
      
      const accountTab = wrapper.find('[data-testid="account-login-tab"]')
      accountTab.trigger('click')
      
      expect(wrapper.vm.loginType).toBe('account')
      
      const usernameInput = wrapper.find('[data-testid="username-input"]')
      expect(usernameInput.exists()).toBe(true)
    })
  })

  describe('Form Interaction', () => {
    it('should update username when input changes', async () => {
      const usernameInput = wrapper.find('[data-testid="username-input"]')
      await usernameInput.setValue('testuser')
      
      expect(wrapper.vm.username).toBe('testuser')
    })

    it('should update password when input changes', async () => {
      const passwordInput = wrapper.find('[data-testid="password-input"]')
      await passwordInput.setValue('password123')
      
      expect(wrapper.vm.password).toBe('password123')
    })

    it('should toggle remember me state when checkbox is clicked', async () => {
      const rememberCheckbox = wrapper.find('[data-testid="remember-me-checkbox"]')
      await rememberCheckbox.setChecked(true)
      
      expect(wrapper.vm.rememberMe).toBe(true)
    })

    it('should call handleLogin when login button is clicked', async () => {
      const handleLoginSpy = vi.spyOn(wrapper.vm, 'handleLogin')
      const loginButton = wrapper.find('[data-testid="login-button"]')
      
      await loginButton.trigger('click')
      
      expect(handleLoginSpy).toHaveBeenCalled()
    })

    it('should call onSwitchToRegister when register link is clicked', async () => {
      const onSwitchToRegister = vi.fn()
      wrapper = mount(LoginForm, {
        props: {
          onLoginSuccess: vi.fn(),
          onSwitchToRegister,
          initialLoginType: 'account'
        }
      })
      
      const registerLink = wrapper.find('[data-testid="register-link"]')
      await registerLink.trigger('click')
      
      expect(onSwitchToRegister).toHaveBeenCalled()
    })
  })

  describe('Form Validation', () => {
    it('should not submit when username is empty', async () => {
      wrapper.vm.username = ''
      wrapper.vm.password = 'password123'
      
      const handleLoginSpy = vi.spyOn(wrapper.vm, 'handleLogin')
      const loginButton = wrapper.find('[data-testid="login-button"]')
      
      await loginButton.trigger('click')
      
      // 应该显示验证错误而不是调用登录
      expect(wrapper.vm.error).toContain('请输入用户名')
    })

    it('should not submit when password is empty', async () => {
      wrapper.vm.username = 'testuser'
      wrapper.vm.password = ''
      
      const loginButton = wrapper.find('[data-testid="login-button"]')
      await loginButton.trigger('click')
      
      expect(wrapper.vm.error).toContain('请输入密码')
    })
  })

  describe('Initial Props', () => {
    it('should set initial login type from props', () => {
      const wrapperWithQRCode = mount(LoginForm, {
        props: {
          onLoginSuccess: vi.fn(),
          onSwitchToRegister: vi.fn(),
          initialLoginType: 'qrcode'
        }
      })
      
      expect(wrapperWithQRCode.vm.loginType).toBe('qrcode')
    })
  })
})