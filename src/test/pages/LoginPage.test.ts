import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/vue';
import LoginPage from '@/views/LoginPage.vue';
import { renderWithPlugins } from '../utils';
import request from '@/utils/request';

// Mock request
vi.mock('@/utils/request', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn()
    }
  }
})

const mockedRequest = request as any;

// Mock router push
const mockPush = vi.fn()
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush
    })
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('1.1 登录主页面布局', () => {
    it('应该渲染所有必要的组件', () => {
      renderWithPlugins(LoginPage)
      
      expect(screen.getByText('欢迎登录12306')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('密码')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /立即登录/ })).toBeInTheDocument()
      expect(screen.getByText(/友情链接/)).toBeInTheDocument()
    })

    it('应该处理Logo点击事件，跳转到首页', async () => {
      renderWithPlugins(LoginPage)
      
      const logoImage = screen.getByAltText('中国铁路12306')
      expect(logoImage).toBeInTheDocument()
      
      const logoSection = logoImage.closest('.logo-section')
      expect(logoSection).toBeInTheDocument()
      
      if (logoSection) {
        await fireEvent.click(logoSection)
        expect(mockPush).toHaveBeenCalledWith('/')
      }
    })
  })
  
  describe('1.2 登录流程', () => {
    it('登录成功应该跳转首页', async () => {
        mockedRequest.post.mockResolvedValue({ token: 'fake-token' })
        
        renderWithPlugins(LoginPage)
        
        const usernameInput = screen.getByPlaceholderText('用户名/邮箱/手机号')
        const passwordInput = screen.getByPlaceholderText('密码')
        const submitButton = screen.getByRole('button', { name: /立即登录/i })
        
        await fireEvent.update(usernameInput, 'testuser')
        await fireEvent.update(passwordInput, 'password123')
        await fireEvent.click(submitButton)
        
        await waitFor(() => {
            expect(mockedRequest.post).toHaveBeenCalledWith('/auth/login', {
                username: 'testuser',
                password: 'password123'
            })
            expect(mockPush).toHaveBeenCalledWith('/')
        })
    })
  })
})
