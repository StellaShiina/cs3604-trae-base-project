import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LoginPage from '../pages/LoginPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({ history: createWebHistory(), routes: [{ path: '/login', component: LoginPage }, { path: '/', component: { template: '<div/>' } }] })

describe('LoginPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (url:string, init?:any) => {
      if(url.startsWith('/api/v1/auth/login')){
        return { status: 200, json: async () => ({ ok: true }) } as any
      }
      return { status: 200, json: async () => ({}) } as any
    }))
  })

  it('logs in and redirects to home', async () => {
    const wrapper = mount(LoginPage, { global: { plugins: [router] } })
    await router.isReady()
    await wrapper.find('input[placeholder="Email/Username/Mobile number"]').setValue('user')
    await wrapper.find('input[placeholder="Password"]').setValue('pass')
    await wrapper.find('button').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
  })
})