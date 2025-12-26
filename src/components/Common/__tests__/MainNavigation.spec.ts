import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import MainNavigation from '../MainNavigation.vue'
import { reactive } from 'vue'

// Mock route
const mockRoute = reactive({ path: '/' })
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute
}))

describe('MainNavigation', () => {
  it('renders navigation items', () => {
    const wrapper = mount(MainNavigation, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub
        }
      }
    })
    
    expect(wrapper.text()).toContain('首页')
    expect(wrapper.text()).toContain('车票')
    expect(wrapper.text()).toContain('团购服务')
  })

  it('highlights "Home" when path is /', async () => {
    mockRoute.path = '/'
    
    const wrapper = mount(MainNavigation, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub
        }
      }
    })
    
    // Check if the home link has 'active' class
    // We need to find the RouterLink that wraps "首页"
    // RouterLinkStub renders as <a> by default or we check the stub
    const links = wrapper.findAllComponents(RouterLinkStub)
    const homeLink = links.find(link => link.text().includes('首页'))
    
    expect(homeLink?.classes()).toContain('active')
  })

  it('highlights "Ticket" when path is /search', async () => {
    mockRoute.path = '/search'
    
    const wrapper = mount(MainNavigation, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub
        }
      }
    })
    
    const links = wrapper.findAllComponents(RouterLinkStub)
    const ticketLink = links.find(link => link.text().includes('车票'))
    
    expect(ticketLink?.classes()).toContain('active')
  })

  it('renders dropdown menu', () => {
    const wrapper = mount(MainNavigation, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub
        }
      }
    })
    
    const dropdown = wrapper.find('.dropdown-menu')
    expect(dropdown.exists()).toBe(true)
    expect(dropdown.text()).toContain('单程')
    expect(dropdown.text()).toContain('退票')
  })
})
