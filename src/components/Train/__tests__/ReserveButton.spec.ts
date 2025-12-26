import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ReserveButton from '../ReserveButton.vue'
import ConfirmModal from '../ConfirmModal.vue'

describe('ReserveButton', () => {
  const defaultProps = {
    trainNo: 'G1',
    departureStation: 'Beijing',
    arrivalStation: 'Shanghai',
    departureDate: '2023-12-22',
    departureTime: '10:00',
    hasSoldOut: false,
    isLoggedIn: true,
    queryTimestamp: new Date().toISOString()
  }

  it('renders correctly', () => {
    const wrapper = mount(ReserveButton, {
      props: defaultProps
    })
    expect(wrapper.find('button').text()).toBe('预订')
    expect(wrapper.classes('soldout')).toBe(false)
  })

  it('is disabled when sold out', () => {
    const wrapper = mount(ReserveButton, {
      props: {
        ...defaultProps,
        hasSoldOut: true
      }
    })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('emits reserve event immediately if checks pass', async () => {
    const wrapper = mount(ReserveButton, {
      props: defaultProps
    })

    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('reserve')).toBeTruthy()
    expect(wrapper.emitted('reserve')?.[0]).toEqual([
      'G1', 'Beijing', 'Shanghai', '2023-12-22'
    ])
  })

  it('shows modal if query expired (> 5 mins)', async () => {
    // Mock timestamp 6 minutes ago
    const oldTime = new Date(Date.now() - 6 * 60 * 1000).toISOString()
    
    const wrapper = mount(ReserveButton, {
      props: {
        ...defaultProps,
        queryTimestamp: oldTime
      }
    })

    await wrapper.find('button').trigger('click')
    
    // Check if ConfirmModal is visible
    // Note: ConfirmModal uses Teleport, but in tests without mounting to body it might just render in place or we check the component state
    // We can check component internal state 'showConfirmModal'
    // Or check if ConfirmModal component exists and has isVisible=true
    
    // Since we are not using stubs: false, the child components are stubs by default in shallowMount? 
    // No, mount renders children. 
    // Teleport in jsdom works if target exists.
    
    // Easier way: check internal state
    expect((wrapper.vm as any).showConfirmModal).toBe(true)
    expect((wrapper.vm as any).modalConfig.message).toContain('过期')
  })

  it('shows warning if departure is within 3 hours', async () => {
    // Mock date/time to be 2 hours from now
    const now = new Date()
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)
    
    // Format to match props (YYYY-MM-DD and HH:mm)
    const dateStr = twoHoursLater.toISOString().split('T')[0]
    const timeStr = `${String(twoHoursLater.getHours()).padStart(2, '0')}:${String(twoHoursLater.getMinutes()).padStart(2, '0')}`

    const wrapper = mount(ReserveButton, {
      props: {
        ...defaultProps,
        departureDate: dateStr,
        departureTime: timeStr
      }
    })

    await wrapper.find('button').trigger('click')
    
    expect((wrapper.vm as any).showConfirmModal).toBe(true)
    expect((wrapper.vm as any).modalConfig.title).toBe('温馨提示')
    
    // Simulate confirm on modal
    // We need to trigger the 'confirm' event on the ConfirmModal component
    const modal = wrapper.findComponent(ConfirmModal)
    await modal.vm.$emit('confirm')
    
    expect(wrapper.emitted('reserve')).toBeTruthy()
  })
})
