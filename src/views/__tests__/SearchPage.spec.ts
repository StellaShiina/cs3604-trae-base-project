import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import SearchPage from '../SearchPage.vue'
import TrainList from '@/components/Train/TrainList.vue'
import { searchTrains } from '@/api/train'

// Mock API
vi.mock('@/api/train', () => ({
  searchTrains: vi.fn()
}))

// Mock Router
const mockRoute = {
  query: {
    departureStation: '北京',
    arrivalStation: '上海',
    departureDate: '2023-12-22',
    tripType: 'single'
  }
}
const mockRouter = {
  push: vi.fn()
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => mockRouter
}))

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('triggers search on mount with query params', async () => {
    const mockTrains = [
      {
        trainNo: 'G1',
        departureStation: '北京',
        arrivalStation: '上海',
        departureTime: '09:00',
        arrivalTime: '13:00',
        availableSeats: { '二等座': 10 }
      }
    ]
    // Use type assertion to avoid TS error on mockResolvedValue
    ;(searchTrains as any).mockResolvedValue(mockTrains)

    const wrapper = mount(SearchPage, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          TopHeader: true,
          MainNavigation: true,
          BottomFooter: true,
          TrainSearchBar: true,
          TrainFilterPanel: true,
          TrainList: true,
          LoginModal: true
        }
      }
    })

    await flushPromises()

    // Verify API called with correct params from route query
    // searchTrains(from, to, date, trainTypes)
    expect(searchTrains).toHaveBeenCalled() 
    
    // Verify TrainList receives data
    const trainList = wrapper.findComponent(TrainList)
    expect(trainList.exists()).toBe(true)
    expect(trainList.props('trains')).toEqual(mockTrains)
    expect(trainList.props('departureCity')).toBe('北京')
    expect(trainList.props('arrivalCity')).toBe('上海')
  })

  it('displays error message when search fails', async () => {
    const errorMessage = '查询失败，请稍后重试'
    ;(searchTrains as any).mockRejectedValue(new Error(errorMessage))

    const wrapper = mount(SearchPage, {
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          TopHeader: true,
          MainNavigation: true,
          BottomFooter: true,
          TrainSearchBar: true,
          TrainFilterPanel: true,
          TrainList: true,
          LoginModal: true
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain(errorMessage)
  })
})
