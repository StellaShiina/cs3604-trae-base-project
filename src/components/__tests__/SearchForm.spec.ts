import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchForm from '../SearchForm.vue'

describe('SearchForm', () => {
  it('renders properly', () => {
    const wrapper = mount(SearchForm)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true) // From/To inputs might be text for now
    expect(wrapper.find('input[type="date"]').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('Search')
  })

  it('emits search event with payload when submitted', async () => {
    const wrapper = mount(SearchForm)
    
    // Find inputs
    const inputs = wrapper.findAll('input[type="text"]')
    const fromInput = inputs[0]
    const toInput = inputs[1]
    const dateInput = wrapper.find('input[type="date"]')

    // Set values
    await fromInput.setValue('Beijing')
    await toInput.setValue('Shanghai')
    await dateInput.setValue('2023-10-01')

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')

    // Assert event emitted
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0]).toEqual([{
      from: 'Beijing',
      to: 'Shanghai',
      date: '2023-10-01'
    }])
  })
})
