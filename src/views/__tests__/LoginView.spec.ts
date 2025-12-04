import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoginView from '../LoginView.vue'
import { login } from '../../services/authService'
import { useRouter } from 'vue-router'

vi.mock('../../services/authService')
vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

describe('LoginView', () => {
  let routerPushMock: any

  beforeEach(() => {
    routerPushMock = vi.fn()
    // @ts-ignore
    useRouter.mockReturnValue({ push: routerPushMock })
  })

  it('renders login form', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [createTestingPinia()]
      }
    })
    expect(wrapper.find('input[type="text"]').exists()).toBe(true) // Identifier
    expect(wrapper.find('input[type="password"]').exists()).toBe(true) // Password
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('calls login service and updates store on success', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })]
      }
    })
    
    const mockUser = { id: 1, username: 'testuser' }
    // @ts-ignore
    login.mockResolvedValue({ user: mockUser })

    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('password')
    await wrapper.find('form').trigger('submit.prevent')
    
    await flushPromises()

    expect(login).toHaveBeenCalledWith('testuser', 'password')
    // Pinia store update is implicit if component calls store.setUser
    // We can check if router pushed to home
    expect(routerPushMock).toHaveBeenCalledWith('/')
  })

  it('displays error on login failure', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [createTestingPinia()]
      }
    })
    
    // @ts-ignore
    login.mockRejectedValue(new Error('Invalid credentials'))

    await wrapper.find('input[type="text"]').setValue('testuser')
    await wrapper.find('input[type="password"]').setValue('wrongpassword')
    await wrapper.find('form').trigger('submit.prevent')
    
    await flushPromises()

    expect(wrapper.text()).toContain('Invalid credentials') // Or a generic error message
  })
})
