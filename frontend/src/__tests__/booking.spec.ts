import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import BookingPage from '../pages/BookingPage.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({ history: createWebHistory(), routes: [{ path: '/booking', component: BookingPage }] })

describe('BookingPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async (url:string, init?:any) => {
      if(String(url).includes('/api/v1/stations')){
        return { json: async () => ([{ ID: 1, NameEn: 'Beijing', NameZh: '北京' }, { ID: 2, NameEn: 'Shanghai', NameZh: '上海' }]) } as any
      }
      if(String(url).includes('/api/v1/trains/search')){
        return { json: async () => ({ items: [{ segment_id: 10, train_no: 'D5', depart_time: '07:21', arrive_time: '09:27', date: '2025-11-13', from_station_id: 1, to_station_id: 2, seats: JSON.stringify([{ type: 'second-class seat', price: 31800, left: 12 }]), bookable: true }] }) } as any
      }
      if(String(url).includes('/api/v1/preorders')){
        return { json: async () => ({ ok: true }), status: 201 } as any
      }
      return { json: async () => ({}) } as any
    }))
  })

  it('fetches and renders trains, then books a seat', async () => {
    const wrapper = mount(BookingPage, { global: { plugins: [router] } })
    await router.isReady()
    await flushPromises()
    const selects = wrapper.findAll('select')
    const s0 = selects[0]!
    const s1 = selects[1]!
    await s0.setValue('1')
    await s1.setValue('2')
    await wrapper.find('input[type="date"]').setValue('2025-11-13')
    // trigger search
    const searchBtn = wrapper.find('button.bg-orange-500')
    await searchBtn.trigger('click')
    await flushPromises()
    await flushPromises()
    const calledSearch = (fetch as any).mock.calls.some((args:any[]) => String(args[0]).includes('/api/v1/trains/search'))
    expect(calledSearch).toBe(true)
  })
})