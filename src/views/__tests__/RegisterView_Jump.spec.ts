
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import RegisterView from '../RegisterView.vue'
import { register, sendSMS, verifySMS } from '../../services/authService'
import { useRouter } from 'vue-router'

// Mock dependencies
vi.mock('../../services/authService')
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('RegisterView Registration Flow', () => {
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

  it('should navigate to login page after successful registration', async () => {
    // 1. Setup Mocks
    // @ts-ignore
    sendSMS.mockResolvedValue({})
    // @ts-ignore
    verifySMS.mockResolvedValue({})
    // @ts-ignore
    register.mockResolvedValue({ userId: 123 })

    const wrapper = mount(RegisterView, {
      global: {
        stubs: {
          RouterLink: true
        }
      }
    })

    // 2. Fill Form
    await wrapper.find('input[placeholder="用户名"]').setValue('validUser123')
    await wrapper.find('input[type="password"]').setValue('Password_123')
    // Find confirm password (it's the second password input)
    const passwordInputs = wrapper.findAll('input[type="password"]')
    await passwordInputs[1].setValue('Password_123')
    
    await wrapper.find('input[placeholder="请输入姓名"]').setValue('张三')
    await wrapper.find('input[placeholder="请输入您的证件号码"]').setValue('110101199001011234') // Valid 18 digit
    await wrapper.find('input[placeholder="手机号码"]').setValue('13800138000')
    
    // Check agreement
    await wrapper.find('input[type="checkbox"]').setValue(true)

    // 3. Click Next
    await wrapper.find('button.bg-orange-500').trigger('click')
    await flushPromises()

    // Expect SMS sent and Modal Open
    expect(sendSMS).toHaveBeenCalled()
    // Check if modal is visible (it's conditionally rendered with v-if="showModal" passed to component)
    // Since SMSVerificationModal is a child component, let's find it
    const modal = wrapper.findComponent({ name: 'SMSVerificationModal' })
    expect(modal.exists()).toBe(true)
    expect(modal.props('isOpen')).toBe(true)

    // 4. Simulate User Entering Code in Modal and Clicking Confirm
    // We can emit 'success' directly from the component to simulate "modal completed"
    // This bypasses the internal logic of the modal (which we tested separately or assume works)
    // but ensures we test the RegisterView's handling of the event.
    
    // However, to be thorough as per user request "feel it", let's interact with the modal inputs if possible.
    // The modal is rendered in the DOM (teleport might complicate things but here it's just a div in template usually, 
    // wait, SMSVerificationModal uses v-if="isOpen" inside its template, and it is placed in the root of RegisterView template.
    // It is NOT using <Teleport>.
    
    // Let's find the input inside the modal
    const codeInput = modal.find('input[type="text"]') // It has maxlength 6
    await codeInput.setValue('123456')
    
    // Find "Complete Registration" button in modal
    const buttons = modal.findAll('button')
    const completeBtn = buttons.find(b => b.text().includes('完成注册'))
    expect(completeBtn?.exists()).toBe(true)
    
    await completeBtn?.trigger('click')
    await flushPromises()

    // 5. Verify verifySMS and register called
    expect(verifySMS).toHaveBeenCalled()
    expect(register).toHaveBeenCalled()

    // 6. Check Success Message Overlay
    // The overlay is in RegisterView template: v-if="showSuccessMessage"
    expect(wrapper.find('.text-green-500').exists()).toBe(true)
    expect(wrapper.text()).toContain('恭喜您注册成功')

    // 7. Check Router Push after delay
    expect(routerPushMock).not.toHaveBeenCalled() // Should wait
    
    vi.advanceTimersByTime(2000)
    
    expect(routerPushMock).toHaveBeenCalledWith('/login')
  })
})
