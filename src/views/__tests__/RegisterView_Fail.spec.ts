
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import RegisterView from '../RegisterView.vue'
import { register, sendSMS, verifySMS } from '../../services/authService'
import { useRouter } from 'vue-router'

vi.mock('../../services/authService')
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('RegisterView Registration Failure Flow', () => {
  let routerPushMock: any

  beforeEach(() => {
    routerPushMock = vi.fn()
    // @ts-ignore
    useRouter.mockReturnValue({ push: routerPushMock })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should stay on registration page and show error if registration fails due to conflict', async () => {
    // 1. Setup Mocks
    // @ts-ignore
    sendSMS.mockResolvedValue({})
    // @ts-ignore
    verifySMS.mockResolvedValue({})
    
    // Simulate 409 Conflict for Username
    const conflictError: any = new Error('Conflict')
    conflictError.response = {
      status: 409,
      data: { error: 'username already exists' }
    }
    // @ts-ignore
    register.mockRejectedValue(conflictError)

    const wrapper = mount(RegisterView, {
      global: {
        stubs: {
          RouterLink: true
        }
      }
    })

    // 2. Fill Form
    await wrapper.find('input[placeholder="用户名"]').setValue('duplicateUser')
    await wrapper.find('input[type="password"]').setValue('Password_123')
    const passwordInputs = wrapper.findAll('input[type="password"]')
    await passwordInputs[1].setValue('Password_123')
    
    await wrapper.find('input[placeholder="请输入姓名"]').setValue('张三')
    await wrapper.find('input[placeholder="请输入您的证件号码"]').setValue('110101199001011234')
    await wrapper.find('input[placeholder="手机号码"]').setValue('13800138000')
    await wrapper.find('input[type="checkbox"]').setValue(true)

    // 3. Open Modal
    await wrapper.find('button.bg-orange-500').trigger('click')
    await flushPromises()

    // 4. Complete Modal
    const modal = wrapper.findComponent({ name: 'SMSVerificationModal' })
    const codeInput = modal.find('input[type="text"]')
    await codeInput.setValue('123456')
    
    const completeBtn = modal.findAll('button').find(b => b.text().includes('完成注册'))
    await completeBtn?.trigger('click')
    await flushPromises()

    // 5. Assertions
    expect(verifySMS).toHaveBeenCalled()
    expect(register).toHaveBeenCalled()

    // Modal should be closed
    expect(modal.props('isOpen')).toBe(false)
    
    // Success message should NOT be shown
    expect(wrapper.find('.text-green-500').exists()).toBe(false)

    // Router should NOT push
    vi.advanceTimersByTime(2000)
    expect(routerPushMock).not.toHaveBeenCalled()

    // Error should be displayed on the form
    expect(wrapper.text()).toContain('该用户名已经占用')
  })
})
