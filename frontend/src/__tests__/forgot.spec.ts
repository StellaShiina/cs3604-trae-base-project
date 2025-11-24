import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import ForgotPasswordRequestPage from '../pages/ForgotPasswordRequestPage.vue'
import ForgotPasswordVerifyPage from '../pages/ForgotPasswordVerifyPage.vue'
import ForgotPasswordResetPage from '../pages/ForgotPasswordResetPage.vue'

const router = createRouter({ history: createWebHistory(), routes: [
  { path: '/', component: { template: '<div />' } },
  { path: '/login', component: LoginPage },
  { path: '/forgot', component: ForgotPasswordRequestPage },
  { path: '/forgot/verify', component: ForgotPasswordVerifyPage },
  { path: '/forgot/reset', component: ForgotPasswordResetPage },
] })

describe('Forgot password flow', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (url:string, init?:any) => {
      if(url.includes('/api/v1/auth/forgot') && !url.includes('verify') && !url.includes('reset')){
        return { status: 202, json: async () => ({ status: 'accepted', next: 'verify' }) } as any
      }
      if(url.includes('/api/v1/auth/forgot/verify')){
        return { status: 200, json: async () => ({ resetToken: 'tok', expiresAt: new Date().toISOString(), next: 'reset' }) } as any
      }
      if(url.includes('/api/v1/auth/forgot/reset')){
        return { status: 200, json: async () => ({ next: 'login' }) } as any
      }
      if(url.includes('/api/v1/auth/login')){
        return { status: 200, json: async () => ({ ok: true }) } as any
      }
      return { status: 200, json: async () => ({}) } as any
    }))
    sessionStorage.clear()
  })

  it('navigates through request, verify, reset', async () => {
    const wrapper = mount(LoginPage, { global: { plugins: [router] } })
    await router.isReady()
    await wrapper.find('a.text-blue-600').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/forgot')

    const req = mount(ForgotPasswordRequestPage, { global: { plugins: [router] } })
    await router.isReady()
    await req.find('input[placeholder="Email or Username"]').setValue('user')
    await req.find('button').trigger('click')
    await flushPromises()
    expect(sessionStorage.getItem('fp:identifier')).toBe('user')
    expect(router.currentRoute.value.path).toBe('/forgot/verify')

    const ver = mount(ForgotPasswordVerifyPage, { global: { plugins: [router] } })
    await router.isReady()
    await ver.find('input[placeholder="Email or Username"]').setValue('user')
    await ver.find('input[placeholder="6-digit code"]').setValue('123456')
    await ver.find('button').trigger('click')
    await flushPromises()
    expect(sessionStorage.getItem('fp:resetToken')).toBe('tok')
    expect(router.currentRoute.value.path).toBe('/forgot/reset')

    const rst = mount(ForgotPasswordResetPage, { global: { plugins: [router] } })
    await router.isReady()
    await rst.find('input[placeholder="New password"]').setValue('new')
    await rst.find('input[placeholder="Confirm password"]').setValue('new')
    await rst.find('button').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('shows error when identifier does not exist', async () => {
    (global.fetch as any).mockImplementationOnce(async () => {
      return { status: 404, json: async () => ({ code: 'not_found', message: '用户名或邮箱不存在' }) } as any
    })
    await router.push('/forgot')
    await router.isReady()
    const req = mount(ForgotPasswordRequestPage, { global: { plugins: [router] } })
    await req.find('input[placeholder="Email or Username"]').setValue('nonexist')
    await req.find('button').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/forgot')
    expect(req.text()).toContain('用户名或邮箱不存在')
  })
})