
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LoginView from '../LoginView.vue'
import { createTestingPinia } from '@pinia/testing'
import { login, sendSMS, verifySMS } from '../../services/authService'
import { useRouter } from 'vue-router'

// Mocks
vi.mock('../../services/authService')
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('LoginView SMS Verification Flow', () => {
  let routerPushMock: any

  beforeEach(() => {
    routerPushMock = vi.fn()
    // @ts-ignore
    useRouter.mockReturnValue({ push: routerPushMock })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('should show SMS modal after password check, and allow full login flow', async () => {
    // 1. Setup Mocks
    const mockUser = { 
      id: 1, 
      username: 'testuser', 
      mobile: '13800138000', 
      id_no: '110101199001011234' 
    }
    // @ts-ignore
    login.mockResolvedValue({ user: mockUser })
    // @ts-ignore
    sendSMS.mockResolvedValue({})
    // @ts-ignore
    verifySMS.mockResolvedValue({})

    const wrapper = mount(LoginView, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          RouterLink: true
        }
      }
    })

    // 2. Login
    await wrapper.find('input[placeholder="用户名/邮箱/手机号"]').setValue('testuser')
    await wrapper.find('input[placeholder="密码"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    // 3. Check Modal
    const modal = wrapper.findComponent({ name: 'LoginVerificationModal' })
    expect(modal.exists()).toBe(true)
    expect(modal.text()).toContain('短信验证')
    
    // 4. Test Modal Logic - Get Code
    // Initial state: Get Code disabled
    const getCodeBtn = modal.findAll('button').find(b => b.text().includes('获取验证码'))
    expect(getCodeBtn?.attributes('disabled')).toBeDefined()

    // Input ID last 4
    const idInput = modal.find('input[placeholder="请输入登录账号绑定的证件号后4位"]')
    await idInput.setValue('1234') // Correct last 4
    expect(getCodeBtn?.attributes('disabled')).toBeUndefined() // Should be enabled now

    // Click Get Code
    await getCodeBtn?.trigger('click')
    await flushPromises()
    expect(sendSMS).toHaveBeenCalledWith('13800138000')
    expect(modal.text()).toContain('获取短信验证码成功')
    
    // Check Timer State (Button text changes)
    expect(getCodeBtn?.text()).toContain('重新发送(60)')

    // 5. Test Modal Logic - Confirm
    // Input Code
    const codeInput = modal.find('input[placeholder="输入验证码"]')
    await codeInput.setValue('666666')

    // Click Confirm
    const confirmBtn = modal.findAll('button').find(b => b.text().includes('确定'))
    await confirmBtn?.trigger('click')
    await flushPromises()

    // 6. Assertions
    expect(verifySMS).toHaveBeenCalledWith('13800138000', '666666')
    // Modal should close (emitted success -> parent sets showModal = false)
    expect(modal.props('isOpen')).toBe(false)
    // Router should push to home
    expect(routerPushMock).toHaveBeenCalledWith('/')
  })

  it('should handle incorrect ID last 4', async () => {
    // Setup Mocks
    const mockUser = { 
      id: 1, 
      username: 'testuser', 
      mobile: '13800138000', 
      id_no: '110101199001011234' 
    }
    // @ts-ignore
    login.mockResolvedValue({ user: mockUser })

    const wrapper = mount(LoginView, {
      global: {
        plugins: [createTestingPinia()],
        stubs: { RouterLink: true }
      }
    })

    // Login to open modal
    await wrapper.find('input[placeholder="用户名/邮箱/手机号"]').setValue('testuser')
    await wrapper.find('input[placeholder="密码"]').setValue('password123')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    const modal = wrapper.findComponent({ name: 'LoginVerificationModal' })
    
    // Input WRONG ID last 4
    await modal.find('input[placeholder="请输入登录账号绑定的证件号后4位"]').setValue('0000')
    
    // Click Get Code
    const getCodeBtn = modal.findAll('button').find(b => b.text().includes('获取验证码'))
    await getCodeBtn?.trigger('click')
    await flushPromises()

    // Should show error
    expect(modal.text()).toContain('请输入正确的用户信息')
    // sendSMS should NOT be called
    expect(sendSMS).not.toHaveBeenCalled()
  })
})
