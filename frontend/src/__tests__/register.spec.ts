import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import RegisterPage from '../pages/RegisterPage.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/register', component: RegisterPage }, { path: '/login', component: { template: '<div/>' } }] })

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (url:string, init?:any) => {
      if(String(url).includes('/api/v1/auth/register')){
        return { status: 201, json: async () => ({ ok: true }) } as any
      }
      return { status: 200, json: async () => ({}) } as any
    }))
  })

  it('registers and redirects to login', async () => {
    await router.push('/register')
    const wrapper = mount(RegisterPage, { global: { plugins: [router] } })
    await router.isReady()
    await wrapper.find('select').setValue('US')
    await wrapper.find('input[placeholder="Name"]').setValue('Alice')
    await wrapper.find('input[placeholder="Passport number"]').setValue('P123456')
    await wrapper.find('input[type="date"]').setValue('2030-01-01')
    const dob = wrapper.findAll('input[type="date"]')[1]!
    await dob.setValue('1990-01-01')
    await wrapper.find('input[placeholder="Username"]').setValue('alice')
    const pwd = wrapper.find('input[placeholder="Password"]')
    await pwd.setValue('pass123')
    await wrapper.find('input[placeholder="Confirm Password"]').setValue('pass123')
    await wrapper.find('input[placeholder="Email address"]').setValue('a@b.com')
    await wrapper.find('input[type="checkbox"]').setValue(true)
    await wrapper.find('button.bg-orange-500').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('shows error when DOB is after passport expiration', async () => {
    await router.push('/register')
    const wrapper = mount(RegisterPage, { global: { plugins: [router] } })
    await router.isReady()
    await wrapper.find('select').setValue('US')
    await wrapper.find('input[placeholder="Name"]').setValue('Bob')
    await wrapper.find('input[placeholder="Passport number"]').setValue('P999999')
    const dates = wrapper.findAll('input[type="date"]')
    expect(dates.length).toBe(2)
    await dates[0]!.setValue('2026-01-01')
    await dates[1]!.setValue('2027-01-01')
    await wrapper.find('input[placeholder="Username"]').setValue('bob')
    await wrapper.find('input[placeholder="Password"]').setValue('pass1234')
    await wrapper.find('input[placeholder="Confirm Password"]').setValue('pass1234')
    await wrapper.find('input[placeholder="Email address"]').setValue('b@c.com')
    await wrapper.find('input[type="checkbox"]').setValue(true)
    await wrapper.find('button.bg-orange-500').trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('Date of birth cannot be after passport expiration date')
  })
})