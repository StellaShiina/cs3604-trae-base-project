import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Register from '../Register.vue'

// Mock vue-router
const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock
  })
}))

// Mock request
const postMock = vi.fn()
vi.mock('../../utils/request', () => ({
  default: {
    post: postMock
  }
}))

describe('Register.vue', () => {
  beforeEach(() => {
    pushMock.mockClear()
    postMock.mockClear()
  })

  it('renders register form', () => {
    const wrapper = mount(Register, {
      global: {
        stubs: {
          'el-card': { template: '<div><slot name="header"></slot><slot></slot></div>' },
          'el-form': { template: '<form><slot></slot></form>' },
          'el-form-item': { template: '<div><slot></slot></div>' },
          'el-input': { template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', props: ['modelValue'] },
          'el-button': { template: '<button @click="$emit(\'click\')"><slot></slot></button>' }
        }
      }
    })
    
    expect(wrapper.text()).toContain('Register')
    // Fields: Username, Password, Email, Mobile, Real Name, ID No -> 6 inputs
    expect(wrapper.findAll('input').length).toBe(6)
    expect(wrapper.findAll('button').length).toBe(2)
  })

  it('updates form data', async () => {
    const wrapper = mount(Register, {
      global: {
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
    await inputs[0].setValue('newuser') // Username
    await inputs[1].setValue('newpass') // Password
    
    expect(inputs[0].element.value).toBe('newuser')
    expect(inputs[1].element.value).toBe('newpass')
  })

  it('calls register API and redirects on success', async () => {
    postMock.mockResolvedValue({})
    
    const wrapper = mount(Register, {
      global: {
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': { template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />', props: ['modelValue'] },
          'el-button': { template: '<button @click="$emit(\'click\')"><slot></slot></button>' }
        }
      }
    })

    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('newuser') // Username
    await inputs[1].setValue('newpass') // Password
    await inputs[2].setValue('test@example.com') // Email
    await inputs[3].setValue('13800138000') // Mobile
    await inputs[4].setValue('张三') // Name
    await inputs[5].setValue('110101199001011234') // ID No
    
    const registerBtn = wrapper.findAll('button')[0] // First button is Register
    await registerBtn.trigger('click')
    
    expect(postMock).toHaveBeenCalledWith('/auth/register', {
      username: 'newuser',
      password: 'newpass',
      email: 'test@example.com',
      mobile: '13800138000',
      name: '张三',
      id_no: '110101199001011234',
      id_type: '1',
      gender: 'unknown'
    })
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(pushMock).toHaveBeenCalledWith('/login')
  })

  it('navigates back to login', async () => {
    const wrapper = mount(Register, {
      global: {
        stubs: {
          'el-card': true,
          'el-form': true,
          'el-form-item': true,
          'el-input': true,
          'el-button': { template: '<button @click="$emit(\'click\')"><slot></slot></button>' }
        }
      }
    })
    
    const backBtn = wrapper.findAll('button')[1] // Second button is Back to Login
    await backBtn.trigger('click')
    
    expect(pushMock).toHaveBeenCalledWith('/login')
  })
})
