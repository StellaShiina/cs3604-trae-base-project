import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import OrderList from '../OrderList.vue'

vi.mock('@/api/order', () => ({
  getOrders: vi.fn(),
  cancelOrder: vi.fn(),
  refundTicket: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

const { getOrders, refundTicket } = await import('@/api/order')

describe('OrderList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(globalThis as any).confirm = vi.fn(() => true)
    ;(globalThis as any).alert = vi.fn()
  })

  it('shows refund button in upcoming tab and refunds active tickets', async () => {
    ;(getOrders as any).mockResolvedValue({
      data: [
        {
          id: 'ord-1',
          status: 'paid',
          created_at: '2025-01-01 10:00:00',
          departure_station: '北京',
          arrival_station: '上海',
          train_no: 'G1',
          departure_date: '2099-12-31',
          departure_time: '10:00',
          total_price: 100,
          passengers: [
            {
              ticket_id: 1,
              passenger_name: '张三',
              seat_type: 'second',
              seat_no: '01A',
              status: 'active'
            }
          ]
        }
      ]
    })

    const wrapper = mount(OrderList, {
      global: {
        stubs: {
          DatePicker: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    const tabButtons = wrapper.findAll('.tab-btn')
    expect(tabButtons.length).toBeGreaterThan(1)
    await tabButtons[1]!.trigger('click')
    await flushPromises()

    const refundBtn = wrapper.find('button.btn-refund')
    expect(refundBtn.exists()).toBe(true)

    await refundBtn.trigger('click')
    await flushPromises()

    expect(refundTicket).toHaveBeenCalledWith(1)
    expect(getOrders).toHaveBeenCalledTimes(2)
  })

  it('does not show refund button if all tickets already refunded', async () => {
    ;(getOrders as any).mockResolvedValue({
      data: [
        {
          id: 'ord-2',
          status: 'paid',
          created_at: '2025-01-01 10:00:00',
          departure_station: '北京',
          arrival_station: '上海',
          train_no: 'G1',
          departure_date: '2099-12-31',
          departure_time: '10:00',
          total_price: 100,
          passengers: [
            {
              ticket_id: 2,
              passenger_name: '李四',
              seat_type: 'second',
              seat_no: '01B',
              status: 'refunded'
            }
          ]
        }
      ]
    })

    const wrapper = mount(OrderList, {
      global: {
        stubs: {
          DatePicker: true,
          RouterLink: true
        }
      }
    })

    await flushPromises()

    const tabButtons = wrapper.findAll('.tab-btn')
    expect(tabButtons.length).toBeGreaterThan(1)
    await tabButtons[1]!.trigger('click')
    await flushPromises()

    expect(wrapper.find('button.btn-refund').exists()).toBe(false)
  })
})
