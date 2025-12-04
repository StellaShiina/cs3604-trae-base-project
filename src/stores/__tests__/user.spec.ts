import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with no user', () => {
    const store = useUserStore()
    expect(store.user).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })

  it('sets user correctly', () => {
    const store = useUserStore()
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' }
    
    store.setUser(mockUser)
    
    expect(store.user).toEqual(mockUser)
    expect(store.isLoggedIn).toBe(true)
  })

  it('clears user on logout', () => {
    const store = useUserStore()
    const mockUser = { id: 1, username: 'testuser' }
    
    store.setUser(mockUser)
    store.logout()
    
    expect(store.user).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })
})
