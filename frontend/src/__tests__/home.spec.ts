import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HomePage from '../pages/HomePage.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: HomePage }, { path: '/booking', component: { template: '<div/>' } }] })

describe('HomePage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (url:string) => {
      if(String(url).includes('/api/v1/stations')){
        return { json: async () => ([{ id: 1, nameEn: 'Beijing', nameZh: '北京' }, { id: 2, nameEn: 'Shanghai', nameZh: '上海' }]) } as any
      }
      return { json: async () => ({}) } as any
    }))
  })
  it('navigates to booking with query when Search pressed', async () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } })
    await router.isReady()
    await flushPromises()
    const selects = wrapper.findAll('select')
    expect(selects.length).toBeGreaterThanOrEqual(2)
    const s0 = selects[0]!
    const s1 = selects[1]!
    await s0.setValue('1')
    await s1.setValue('2')
    const searchBtn = wrapper.find('button.bg-orange-500')
    await searchBtn.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/booking')
    const q = router.currentRoute.value.query
    expect(q.fromId).toBe('1')
    expect(q.toId).toBe('2')
  })
})