import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TrainItem from '../TrainItem.vue'

// Mock the child component to avoid router injection issues
const ReserveButtonStub = {
  template: '<button>预订</button>',
  props: ['trainNo', 'departureStation', 'arrivalStation', 'departureDate', 'departureTime', 'hasSoldOut', 'isLoggedIn', 'queryTimestamp']
}

describe('TrainItem', () => {
  const mockTrain = {
    trainNo: 'G123',
    from: 'Beijing',
    to: 'Shanghai',
    startTime: '08:00',
    endTime: '12:00',
    duration: 240,
    departureStation: 'Beijing South',
    arrivalStation: 'Shanghai Hongqiao',
    departureTime: '08:00',
    arrivalTime: '12:00',
    availableSeats: {
      '商务座': 10,
      '一等座': 20,
      '二等座': 50,
      '硬卧': 0,
      '软卧': 5
    }
  }

  const defaultProps = {
    train: mockTrain,
    rowIndex: 0,
    isLoggedIn: true,
    queryTimestamp: '1234567890',
    queryDate: '2023-10-01'
  }

  it('renders train number correctly', () => {
    const wrapper = mount(TrainItem, {
      props: defaultProps,
      global: {
        stubs: {
          ReserveButton: ReserveButtonStub
        }
      }
    })
    expect(wrapper.find('.train-number').text()).toBe('G123')
  })

  it('renders stations correctly', () => {
    const wrapper = mount(TrainItem, {
      props: defaultProps,
      global: {
        stubs: {
          ReserveButton: ReserveButtonStub
        }
      }
    })
    const stations = wrapper.findAll('.station-name')
    expect(stations[0].text()).toBe('Beijing South')
    expect(stations[1].text()).toBe('Shanghai Hongqiao')
  })

  it('renders times correctly', () => {
    const wrapper = mount(TrainItem, {
      props: defaultProps,
      global: {
        stubs: {
          ReserveButton: ReserveButtonStub
        }
      }
    })
    expect(wrapper.find('.train-time-departure').text()).toBe('08:00')
    expect(wrapper.find('.train-time-arrival').text()).toBe('12:00')
  })

  it('displays seat availability correctly', () => {
    const wrapper = mount(TrainItem, {
      props: defaultProps,
      global: {
        stubs: {
          ReserveButton: ReserveButtonStub
        }
      }
    })
    
    const seatInfos = wrapper.findAll('.seat-info')
    
    // Business class is the first seat column (index 0)
    // formatSeatStatus: 10 -> "10"
    expect(seatInfos[0].text()).toBe('10') 
    
    // First class is index 2 (index 1 is '优选/一等座' which is --)
    // Wait, let's check template structure carefully
    // Cell 0: Train No
    // Cell 1: Stations
    // Cell 2: Times
    // Cell 3: Duration
    // Cell 4: Business (index 0 of seat-infos if we query .seat-info)
    // Cell 5: Superior/First (index 1) -> "--"
    // Cell 6: First Class (index 2) -> 20 -> "有" (>=20 returns '有')
    
    expect(seatInfos[2].text()).toBe('有')
    
    // Hard Sleeper (index 6? Let's count)
    // 0: Business
    // 1: Superior
    // 2: First Class
    // 3: Second Class (50 -> "有")
    // 4: Advanced Soft Sleeper (--)
    // 5: Soft Sleeper (5 -> "5")
    // 6: Hard Sleeper (0 -> "无")
    
    expect(seatInfos[6].text()).toBe('无')
  })
})
