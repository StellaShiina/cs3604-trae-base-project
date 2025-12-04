import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HomeView from '../HomeView.vue'
import SearchForm from '../../components/SearchForm.vue'
import { searchTrains } from '../../services/trainService'

// Mock the service
vi.mock('../../services/trainService')

describe('HomeView', () => {
  it('searches and displays trains', async () => {
    const mockTrains = [
      {
        trainNo: 'G1',
        from: 'Beijing',
        to: 'Shanghai',
        startTime: '09:00',
        endTime: '13:00',
        seats: [
          { type: 'second', left: 10, bookable: true }
        ]
      }
    ]

    // @ts-ignore
    searchTrains.mockResolvedValue(mockTrains)

    const wrapper = mount(HomeView)

    // Trigger search via SearchForm
    const searchFormComponent = wrapper.findComponent(SearchForm)
    expect(searchFormComponent.exists()).toBe(true)
    
    searchFormComponent.vm.$emit('search', { from: 'Beijing', to: 'Shanghai', date: '2023-10-01' })
    
    await flushPromises()
    
    expect(searchTrains).toHaveBeenCalledWith('Beijing', 'Shanghai', '2023-10-01')
    
    // Check if TrainList is rendered and contains data
    expect(wrapper.text()).toContain('G1')
    expect(wrapper.text()).toContain('Beijing')
    expect(wrapper.text()).toContain('Shanghai')
  })
})
