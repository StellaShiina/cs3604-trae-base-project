import { describe, it, expect, vi } from 'vitest'
import { login, register } from '../authService'
import axios from 'axios'

vi.mock('axios')

describe('authService', () => {
  it('login sends correct parameters and returns user data', async () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' }
    // @ts-ignore
    axios.post.mockResolvedValue({ data: { user: mockUser } })

    const result = await login('testuser', 'password123')

    expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/login', {
      identifier: 'testuser',
      password: 'password123'
    })
    expect(result).toEqual({ user: mockUser })
  })

  it('register sends correct parameters', async () => {
    const mockResponse = { userId: 123 }
    const registerData = {
      username: 'newuser',
      password: 'password123',
      email: 'new@example.com',
      mobile: '13800138000',
      name: 'New User',
      id_type: 'passport',
      id_no: 'E12345678'
    }

    // @ts-ignore
    axios.post.mockResolvedValue({ data: mockResponse })

    const result = await register(registerData)

    expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/register', registerData)
    expect(result).toEqual(mockResponse)
  })
})
