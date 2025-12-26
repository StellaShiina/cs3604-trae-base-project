import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TrainList from '../TrainList.vue'
import TrainListItem from '../TrainListItem.vue'

describe('TrainList', () => {
  const mockTrains = [
    { trainNo: 'G1', departureTime: '10:00', duration: 60, arrivalTime: '11:00' },
    { trainNo: 'G2', departureTime: '09:00', duration: 120, arrivalTime: '11:00' }
  ]

  const defaultProps = {
    trains: mockTrains,
    isLoggedIn: true,
    queryTimestamp: '2023-01-01',
    departureCity: 'Beijing',
    arrivalCity: 'Shanghai',
    departureDate: '2023-12-22'
  }

  it('renders list of trains', () => {
    const wrapper = mount(TrainList, {
      props: defaultProps,
      global: {
        stubs: {
          TrainListItem: true
        }
      }
    })
    
    expect(wrapper.findAllComponents(TrainListItem)).toHaveLength(2)
    expect(wrapper.text()).toContain('共2个车次')
  })

  it('sorts by departure time correctly', async () => {
    const wrapper = mount(TrainList, {
      props: defaultProps,
      global: {
        stubs: {
          TrainListItem: true
        }
      }
    })

    // Find sort header for departure time
    const headers = wrapper.findAll('.sortable-line')
    const departureHeader = headers.find(h => h.text().includes('出发时间'))
    
    // Initial state: default order (G1, G2)
    let items = wrapper.findAllComponents(TrainListItem)
    expect(items[0].props('train').trainNo).toBe('G1')

    // Click to sort (First click: ASC)
    await departureHeader?.trigger('click')
    
    items = wrapper.findAllComponents(TrainListItem)
    expect(items[0].props('train').trainNo).toBe('G2') // 09:00
    expect(items[1].props('train').trainNo).toBe('G1') // 10:00
    
    // Click again (DESC)
    await departureHeader?.trigger('click')
    
    items = wrapper.findAllComponents(TrainListItem)
    expect(items[0].props('train').trainNo).toBe('G1')
    expect(items[1].props('train').trainNo).toBe('G2')
  })

  it('shows empty state when no trains', () => {
    const wrapper = mount(TrainList, {
      props: {
        ...defaultProps,
        trains: []
      },
      global: {
        stubs: {
          TrainListItem: true
        }
      }
    })

    expect(wrapper.text()).toContain('暂无符合条件的车次')
  })
})
