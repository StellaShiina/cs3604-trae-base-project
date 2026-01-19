import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with no user', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.token).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('login updates state and localStorage', () => {
    const store = useAuthStore()
    const token = 'fake-token'
    const user = { id: 1, name: 'Test User' }

    store.login(token, user)

    expect(store.token).toBe(token)
    expect(store.user).toEqual(user)
    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('authToken')).toBe(token)
    expect(localStorage.getItem('userInfo')).toBe(JSON.stringify(user))
  })

  it('logout clears state and localStorage', () => {
    const store = useAuthStore()
    store.login('token', { id: 1 })
    
    store.logout()

    expect(store.token).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('userInfo')).toBeNull()
  })

  it('restoreSession recovers state from localStorage', () => {
    const token = 'stored-token'
    const user = { id: 2, name: 'Stored User' }
    localStorage.setItem('authToken', token)
    localStorage.setItem('userInfo', JSON.stringify(user))

    const store = useAuthStore()
    store.restoreSession()

    expect(store.token).toBe(token)
    expect(store.user).toEqual(user)
    expect(store.isAuthenticated).toBe(true)
  })
})
