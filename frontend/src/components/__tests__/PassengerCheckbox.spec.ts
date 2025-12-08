import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PassengerCheckbox from '../PassengerCheckbox.vue'

describe('PassengerCheckbox', () => {
  const mockPassenger = {
    name: '张三',
    idType: '身份证',
    idNo: '123456789012345678'
  }

  it('renders passenger name correctly', () => {
    const wrapper = mount(PassengerCheckbox, {
      props: {
        passenger: mockPassenger,
        selected: false
      }
    })
    expect(wrapper.text()).toContain('张三')
  })

  it('emits change event when clicked', async () => {
    const wrapper = mount(PassengerCheckbox, {
      props: {
        passenger: mockPassenger,
        selected: false
      }
    })
    
    const input = wrapper.find('input[type="checkbox"]')
    await input.setValue(true)
    
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')![0]).toEqual([true])
  })

  it('reflects selected prop state', async () => {
    const wrapper = mount(PassengerCheckbox, {
      props: {
        passenger: mockPassenger,
        selected: true
      }
    })
    
    const input = wrapper.find('input[type="checkbox"]')
    expect(input.element.checked).toBe(true)
  })
})
