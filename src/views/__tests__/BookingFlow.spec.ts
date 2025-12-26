import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import SearchPage from '../SearchPage.vue'
import { searchTrains } from '@/api/train'
import { login, verifyLogin } from '@/api/auth'

// Mock APIs
vi.mock('@/api/train', () => ({
  searchTrains: vi.fn()
}))

vi.mock('@/api/auth', () => ({
  login: vi.fn(),
  verifyLogin: vi.fn()
}))

// Mock Router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {
      departureStation: 'Beijing',
      arrivalStation: 'Shanghai',
      departureDate: '2023-12-22'
    }
  }),
  useRouter: () => ({
    push: mockPush
  })
}))

describe('Booking Flow Integration', () => {
  const mockTrains = [
    {
      trainNo: 'G1',
      departureStation: 'Beijing',
      arrivalStation: 'Shanghai',
      departureDate: '2023-12-22',
      departureTime: '10:00',
      arrivalTime: '14:00',
      availableSeats: { '二等座': 10 }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(searchTrains as any).mockResolvedValue(mockTrains)
  })

  it('redirects to order page if logged in', async () => {
    const wrapper = mount(SearchPage, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            auth: {
              token: 'valid-token',
              user: { id: 1 }
            }
          }
        })],
        stubs: {
          TopHeader: true,
          MainNavigation: true,
          BottomFooter: true
        }
      }
    })

    await flushPromises()

    // Find reserve button (it's inside TrainList -> TrainListItem -> ReserveButton)
    // But since we are mounting SearchPage, we can find the 'button.reserve-button' if we didn't stub TrainList
    // We didn't stub TrainList in global.stubs, so it should render.
    
    const reserveBtn = wrapper.find('.reserve-button')
    expect(reserveBtn.exists()).toBe(true)

    await reserveBtn.trigger('click')

    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Order',
      query: expect.objectContaining({
        trainNo: 'G1'
      })
    }))
  })

  it('shows login modal if not logged in, then redirects after login', async () => {
    const wrapper = mount(SearchPage, {
      global: {
        plugins: [createTestingPinia({
          initialState: {
            auth: {
              token: null,
              user: null
            }
          }
        })],
        stubs: {
          TopHeader: true,
          MainNavigation: true,
          BottomFooter: true
        }
      }
    })

    await flushPromises()

    // 1. Click Reserve
    const reserveBtn = wrapper.find('.reserve-button')
    await reserveBtn.trigger('click')

    // 2. Check Router Push NOT called
    expect(mockPush).not.toHaveBeenCalled()

    // 3. Check Login Modal Visible
    // We can check if the LoginModal component exists and is visible
    // Or check the prop passed to LoginModal
    const loginModal = wrapper.findComponent({ name: 'LoginModal' })
    expect(loginModal.exists()).toBe(true)
    expect(loginModal.props('isVisible')).toBe(true)

    // 4. Simulate Login Success
    // We can emit 'success' from LoginModal directly to test SearchPage logic
    await loginModal.vm.$emit('success')
    
    // 5. Check Redirect happened
    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Order',
      query: expect.objectContaining({
        trainNo: 'G1'
      })
    }))
  })
})
