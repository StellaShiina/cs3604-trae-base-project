import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import Login from '../Login.vue'
import { useUserStore } from '../../stores/user'

// Mock vue-router and request using vi.hoisted
const mocks = vi.hoisted(() => {
  return {
    pushMock: vi.fn(),
    postMock: vi.fn()
  }
})

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.pushMock
  })
}))

vi.mock('../../utils/request', () => ({
  default: {
    post: mocks.postMock
  }
}))

describe('Login.vue', () => {
  beforeEach(() => {
    mocks.pushMock.mockClear()
    mocks.postMock.mockClear()
  })

  it('renders login form', () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          'el-card': { template: '<div><slot name="header"></slot><slot></slot></div>' },
          'el-form': { template: '<form><slot></slot></form>' },
          'el-form-item': { template: '<div><slot></slot></div>' },
          'el-input': { template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', props: ['modelValue'] },
          'el-button': { template: '<button @click="$emit(\'click\')"><slot></slot></button>' }
        }
      }
    })
    
    expect(wrapper.text()).toContain('Login')
    expect(wrapper.findAll('input').length).toBe(2)
    expect(wrapper.findAll('button').length).toBe(2)
  })

  it('updates form data', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': { template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', props: ['modelValue'] },
          'el-button': true
        }
      }
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await inputs[1].setValue('password123')
    
    expect(inputs[0].element.value).toBe('testuser')
    expect(inputs[1].element.value).toBe('password123')
  })

  it('calls login API and redirects on success', async () => {
    mocks.postMock.mockResolvedValue({ token: 'fake-token' })
    
    const wrapper = mount(Login, {
      global: {
        plugins: [createTestingPinia({ stubActions: false, createSpy: vi.fn })],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': { template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', props: ['modelValue'] },
          'el-button': { template: '<button @click="$emit(\'click\')"><slot></slot></button>' }
        }
      }
    })
    
    const store = useUserStore()

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('testuser')
    await inputs[1].setValue('password123')
    
    const loginBtn = wrapper.findAll('button')[0] // First button is Login
    await loginBtn.trigger('click')
    
    expect(mocks.postMock).toHaveBeenCalledWith('/auth/login', {
      username: 'testuser',
      password: 'password123'
    })
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(store.setToken).toHaveBeenCalledWith('fake-token')
    expect(mocks.pushMock).toHaveBeenCalledWith('/')
  })

  it('navigates to register page', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-button': { template: '<button @click="$emit(\'click\')"><slot></slot></button>' }
        }
      }
    })
    
    const registerBtn = wrapper.findAll('button')[1] // Second button is Register
    await registerBtn.trigger('click')
    
    expect(mocks.pushMock).toHaveBeenCalledWith('/register')
  })
})
