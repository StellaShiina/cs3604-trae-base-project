import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderManagement from '../../src/components/OrderManagement.vue'

describe('OrderManagement', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(OrderManagement, {
      props: {
        onOrderUpdate: vi.fn()
      }
    })
  })

  describe('Filter Tabs Rendering', () => {
    it('should display filter tabs for different order statuses', () => {
      // 验收标准：提供筛选标签页（全部、待支付、已支付、已取消）
      const filterTabs = [
        { testId: 'filter-all', text: '全部' },
        { testId: 'filter-pending', text: '待支付' },
        { testId: 'filter-paid', text: '已支付' },
        { testId: 'filter-cancelled', text: '已取消' }
      ]

      filterTabs.forEach(tab => {
        const tabElement = wrapper.find(`[data-testid="${tab.testId}"]`)
        expect(tabElement.exists()).toBe(true)
        expect(tabElement.text()).toContain(tab.text)
      })
    })

    it('should highlight active filter tab', () => {
      // 默认应该选中"全部"标签
      const allTab = wrapper.find('[data-testid="filter-all"]')
      expect(allTab.classes()).toContain('active')

      // 其他标签不应该被选中
      const pendingTab = wrapper.find('[data-testid="filter-pending"]')
      expect(pendingTab.classes()).not.toContain('active')
    })

    it('should switch active tab when clicked', async () => {
      const pendingTab = wrapper.find('[data-testid="filter-pending"]')
      await pendingTab.trigger('click')

      expect(pendingTab.classes()).toContain('active')
      expect(wrapper.find('[data-testid="filter-all"]').classes()).not.toContain('active')
      expect(wrapper.vm.activeFilter).toBe('pending')
    })
  })

  describe('Order List Display', () => {
    beforeEach(() => {
      wrapper.vm.orders = [
        {
          id: 'ORDER001',
          status: 'pending',
          trainNumber: 'G123',
          departureStation: '北京南',
          arrivalStation: '上海虹桥',
          departureTime: '2024-01-15 08:00',
          arrivalTime: '2024-01-15 12:30',
          seatType: '二等座',
          seatNumber: '05车06A',
          price: 553.0,
          createTime: '2024-01-10 10:30:00'
        },
        {
          id: 'ORDER002',
          status: 'paid',
          trainNumber: 'D456',
          departureStation: '上海虹桥',
          arrivalStation: '杭州东',
          departureTime: '2024-01-16 14:00',
          arrivalTime: '2024-01-16 15:30',
          seatType: '一等座',
          seatNumber: '03车02B',
          price: 128.0,
          createTime: '2024-01-12 15:20:00'
        }
      ]
    })

    it('should display orders using OrderCard components', () => {
      // 验收标准：以卡片形式展示订单列表，每个订单使用OrderCard组件
      const orderCards = wrapper.findAllComponents({ name: 'OrderCard' })
      expect(orderCards.length).toBe(2)

      // 验证传递给OrderCard的props
      const firstCard = orderCards[0]
      expect(firstCard.props('order')).toEqual(wrapper.vm.orders[0])
    })

    it('should filter orders based on active filter', async () => {
      // 切换到"待支付"筛选
      const pendingTab = wrapper.find('[data-testid="filter-pending"]')
      await pendingTab.trigger('click')

      const orderCards = wrapper.findAllComponents({ name: 'OrderCard' })
      expect(orderCards.length).toBe(1)
      expect(orderCards[0].props('order').status).toBe('pending')
    })

    it('should show all orders when "全部" filter is active', async () => {
      // 先切换到其他筛选
      await wrapper.find('[data-testid="filter-pending"]').trigger('click')
      
      // 再切换回"全部"
      const allTab = wrapper.find('[data-testid="filter-all"]')
      await allTab.trigger('click')

      const orderCards = wrapper.findAllComponents({ name: 'OrderCard' })
      expect(orderCards.length).toBe(2)
    })
  })

  describe('Empty State Display', () => {
    it('should show empty state when no orders match filter', async () => {
      wrapper.vm.orders = []

      const emptyState = wrapper.find('[data-testid="empty-state"]')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('暂无订单')
    })

    it('should show specific empty message for different filters', async () => {
      wrapper.vm.orders = [
        {
          id: 'ORDER001',
          status: 'paid',
          trainNumber: 'G123',
          departureStation: '北京南',
          arrivalStation: '上海虹桥',
          departureTime: '2024-01-15 08:00',
          arrivalTime: '2024-01-15 12:30',
          seatType: '二等座',
          seatNumber: '05车06A',
          price: 553.0,
          createTime: '2024-01-10 10:30:00'
        }
      ]

      // 切换到"待支付"筛选，应该显示空状态
      const pendingTab = wrapper.find('[data-testid="filter-pending"]')
      await pendingTab.trigger('click')

      const emptyState = wrapper.find('[data-testid="empty-state"]')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('暂无待支付订单')
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator when orders are loading', () => {
      wrapper.vm.isLoading = true

      const loadingIndicator = wrapper.find('[data-testid="loading-indicator"]')
      expect(loadingIndicator.exists()).toBe(true)

      const orderList = wrapper.find('[data-testid="order-list"]')
      expect(orderList.exists()).toBe(false)
    })

    it('should hide loading indicator when orders are loaded', () => {
      wrapper.vm.isLoading = false

      const loadingIndicator = wrapper.find('[data-testid="loading-indicator"]')
      expect(loadingIndicator.exists()).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('should display error message when there is an error', () => {
      const errorMessage = '加载订单失败，请重试'
      wrapper.vm.error = errorMessage

      const errorElement = wrapper.find('[data-testid="error-message"]')
      expect(errorElement.exists()).toBe(true)
      expect(errorElement.text()).toContain(errorMessage)
    })

    it('should provide retry button when error occurs', () => {
      wrapper.vm.error = '加载订单失败'

      const retryButton = wrapper.find('[data-testid="retry-button"]')
      expect(retryButton.exists()).toBe(true)
      expect(retryButton.text()).toContain('重试')
    })

    it('should call loadOrders when retry button is clicked', async () => {
      wrapper.vm.error = '加载订单失败'
      const loadOrdersSpy = vi.spyOn(wrapper.vm, 'loadOrders')

      const retryButton = wrapper.find('[data-testid="retry-button"]')
      await retryButton.trigger('click')

      expect(loadOrdersSpy).toHaveBeenCalled()
    })
  })

  describe('Order Actions', () => {
    beforeEach(() => {
      wrapper.vm.orders = [
        {
          id: 'ORDER001',
          status: 'pending',
          trainNumber: 'G123',
          departureStation: '北京南',
          arrivalStation: '上海虹桥',
          departureTime: '2024-01-15 08:00',
          arrivalTime: '2024-01-15 12:30',
          seatType: '二等座',
          seatNumber: '05车06A',
          price: 553.0,
          createTime: '2024-01-10 10:30:00'
        }
      ]
    })

    it('should handle payment action from OrderCard', async () => {
      const handlePaymentSpy = vi.spyOn(wrapper.vm, 'handlePayment')
      
      const orderCard = wrapper.findComponent({ name: 'OrderCard' })
      await orderCard.vm.$emit('pay', 'ORDER001')

      expect(handlePaymentSpy).toHaveBeenCalledWith('ORDER001')
    })

    it('should handle cancel action from OrderCard', async () => {
      const handleCancelSpy = vi.spyOn(wrapper.vm, 'handleCancel')
      
      const orderCard = wrapper.findComponent({ name: 'OrderCard' })
      await orderCard.vm.$emit('cancel', 'ORDER001')

      expect(handleCancelSpy).toHaveBeenCalledWith('ORDER001')
    })

    it('should update order status after successful payment', async () => {
      // 模拟支付成功
      wrapper.vm.handlePayment = vi.fn().mockResolvedValue(true)
      
      await wrapper.vm.handlePayment('ORDER001')

      // 订单状态应该更新为已支付
      const updatedOrder = wrapper.vm.orders.find(order => order.id === 'ORDER001')
      expect(updatedOrder.status).toBe('paid')
    })

    it('should update order status after successful cancellation', async () => {
      // 模拟取消成功
      wrapper.vm.handleCancel = vi.fn().mockResolvedValue(true)
      
      await wrapper.vm.handleCancel('ORDER001')

      // 订单状态应该更新为已取消
      const updatedOrder = wrapper.vm.orders.find(order => order.id === 'ORDER001')
      expect(updatedOrder.status).toBe('cancelled')
    })
  })

  describe('Data Loading', () => {
    it('should call loadOrders on component mount', () => {
      const loadOrdersSpy = vi.spyOn(wrapper.vm, 'loadOrders')
      wrapper.vm.$options.mounted.call(wrapper.vm)

      expect(loadOrdersSpy).toHaveBeenCalled()
    })

    it('should reload orders when filter changes', async () => {
      const loadOrdersSpy = vi.spyOn(wrapper.vm, 'loadOrders')
      
      const pendingTab = wrapper.find('[data-testid="filter-pending"]')
      await pendingTab.trigger('click')

      expect(loadOrdersSpy).toHaveBeenCalled()
    })
  })

  describe('Order Count Display', () => {
    it('should display order count for each filter tab', () => {
      wrapper.vm.orders = [
        { id: '1', status: 'pending' },
        { id: '2', status: 'pending' },
        { id: '3', status: 'paid' },
        { id: '4', status: 'cancelled' }
      ]

      // 验证各个标签页显示的订单数量
      const allTab = wrapper.find('[data-testid="filter-all"]')
      const pendingTab = wrapper.find('[data-testid="filter-pending"]')
      const paidTab = wrapper.find('[data-testid="filter-paid"]')
      const cancelledTab = wrapper.find('[data-testid="filter-cancelled"]')

      expect(allTab.text()).toContain('(4)')
      expect(pendingTab.text()).toContain('(2)')
      expect(paidTab.text()).toContain('(1)')
      expect(cancelledTab.text()).toContain('(1)')
    })
  })

  describe('Refresh Functionality', () => {
    it('should provide refresh button to reload orders', () => {
      const refreshButton = wrapper.find('[data-testid="refresh-button"]')
      expect(refreshButton.exists()).toBe(true)
    })

    it('should call loadOrders when refresh button is clicked', async () => {
      const loadOrdersSpy = vi.spyOn(wrapper.vm, 'loadOrders')
      
      const refreshButton = wrapper.find('[data-testid="refresh-button"]')
      await refreshButton.trigger('click')

      expect(loadOrdersSpy).toHaveBeenCalled()
    })

    it('should show loading state during refresh', async () => {
      wrapper.vm.isLoading = true

      const refreshButton = wrapper.find('[data-testid="refresh-button"]')
      expect(refreshButton.attributes('disabled')).toBeDefined()
    })
  })
})