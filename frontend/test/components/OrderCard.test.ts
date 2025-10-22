import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderCard from '../../src/components/OrderCard.vue'

describe('OrderCard', () => {
  let wrapper: any
  const mockOrder = {
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

  beforeEach(() => {
    wrapper = mount(OrderCard, {
      props: {
        order: mockOrder
      }
    })
  })

  describe('Order Information Display', () => {
    it('should display order number', () => {
      // 验收标准：显示订单号
      const orderNumber = wrapper.find('[data-testid="order-number"]')
      expect(orderNumber.exists()).toBe(true)
      expect(orderNumber.text()).toContain('ORDER001')
    })

    it('should display order status with appropriate styling', () => {
      // 验收标准：显示订单状态，不同状态有不同的颜色标识
      const orderStatus = wrapper.find('[data-testid="order-status"]')
      expect(orderStatus.exists()).toBe(true)
      expect(orderStatus.text()).toContain('待支付')
      expect(orderStatus.classes()).toContain('status-pending')
    })

    it('should display train information', () => {
      // 验收标准：显示车次信息
      const trainNumber = wrapper.find('[data-testid="train-number"]')
      expect(trainNumber.exists()).toBe(true)
      expect(trainNumber.text()).toContain('G123')
    })

    it('should display departure and arrival stations', () => {
      // 验收标准：显示出发站和到达站
      const departureStation = wrapper.find('[data-testid="departure-station"]')
      const arrivalStation = wrapper.find('[data-testid="arrival-station"]')

      expect(departureStation.exists()).toBe(true)
      expect(arrivalStation.exists()).toBe(true)
      expect(departureStation.text()).toContain('北京南')
      expect(arrivalStation.text()).toContain('上海虹桥')
    })

    it('should display departure and arrival times', () => {
      // 验收标准：显示出发时间和到达时间
      const departureTime = wrapper.find('[data-testid="departure-time"]')
      const arrivalTime = wrapper.find('[data-testid="arrival-time"]')

      expect(departureTime.exists()).toBe(true)
      expect(arrivalTime.exists()).toBe(true)
      expect(departureTime.text()).toContain('08:00')
      expect(arrivalTime.text()).toContain('12:30')
    })

    it('should display travel duration', () => {
      // 验收标准：显示行程时长
      const duration = wrapper.find('[data-testid="travel-duration"]')
      expect(duration.exists()).toBe(true)
      expect(duration.text()).toContain('4小时30分')
    })

    it('should display seat information', () => {
      // 验收标准：显示座位信息（座位类型和座位号）
      const seatType = wrapper.find('[data-testid="seat-type"]')
      const seatNumber = wrapper.find('[data-testid="seat-number"]')

      expect(seatType.exists()).toBe(true)
      expect(seatNumber.exists()).toBe(true)
      expect(seatType.text()).toContain('二等座')
      expect(seatNumber.text()).toContain('05车06A')
    })

    it('should display order price', () => {
      // 验收标准：显示订单金额
      const price = wrapper.find('[data-testid="order-price"]')
      expect(price.exists()).toBe(true)
      expect(price.text()).toContain('¥553.0')
    })

    it('should display order creation time', () => {
      // 验收标准：显示下单时间
      const createTime = wrapper.find('[data-testid="create-time"]')
      expect(createTime.exists()).toBe(true)
      expect(createTime.text()).toContain('2024-01-10 10:30')
    })
  })

  describe('Status-based Action Buttons', () => {
    it('should show pay and cancel buttons for pending orders', () => {
      // 验收标准：待支付订单显示"支付"和"取消"按钮
      const payButton = wrapper.find('[data-testid="pay-button"]')
      const cancelButton = wrapper.find('[data-testid="cancel-button"]')

      expect(payButton.exists()).toBe(true)
      expect(cancelButton.exists()).toBe(true)
      expect(payButton.text()).toContain('支付')
      expect(cancelButton.text()).toContain('取消')
    })

    it('should show view details button for paid orders', async () => {
      // 验收标准：已支付订单显示"查看详情"按钮
      const paidOrder = { ...mockOrder, status: 'paid' }
      wrapper.setProps({ order: paidOrder })

      const viewDetailsButton = wrapper.find('[data-testid="view-details-button"]')
      expect(viewDetailsButton.exists()).toBe(true)
      expect(viewDetailsButton.text()).toContain('查看详情')

      // 支付和取消按钮应该不显示
      expect(wrapper.find('[data-testid="pay-button"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="cancel-button"]').exists()).toBe(false)
    })

    it('should show view details button for cancelled orders', async () => {
      // 验收标准：已取消订单显示"查看详情"按钮
      const cancelledOrder = { ...mockOrder, status: 'cancelled' }
      wrapper.setProps({ order: cancelledOrder })

      const viewDetailsButton = wrapper.find('[data-testid="view-details-button"]')
      expect(viewDetailsButton.exists()).toBe(true)
      expect(viewDetailsButton.text()).toContain('查看详情')
    })
  })

  describe('Status Styling', () => {
    it('should apply correct CSS class for pending status', () => {
      const statusElement = wrapper.find('[data-testid="order-status"]')
      expect(statusElement.classes()).toContain('status-pending')
    })

    it('should apply correct CSS class for paid status', async () => {
      const paidOrder = { ...mockOrder, status: 'paid' }
      wrapper.setProps({ order: paidOrder })

      const statusElement = wrapper.find('[data-testid="order-status"]')
      expect(statusElement.classes()).toContain('status-paid')
      expect(statusElement.text()).toContain('已支付')
    })

    it('should apply correct CSS class for cancelled status', async () => {
      const cancelledOrder = { ...mockOrder, status: 'cancelled' }
      wrapper.setProps({ order: cancelledOrder })

      const statusElement = wrapper.find('[data-testid="order-status"]')
      expect(statusElement.classes()).toContain('status-cancelled')
      expect(statusElement.text()).toContain('已取消')
    })
  })

  describe('Event Emission', () => {
    it('should emit pay event when pay button is clicked', async () => {
      const payButton = wrapper.find('[data-testid="pay-button"]')
      await payButton.trigger('click')

      expect(wrapper.emitted('pay')).toBeTruthy()
      expect(wrapper.emitted('pay')[0]).toEqual(['ORDER001'])
    })

    it('should emit cancel event when cancel button is clicked', async () => {
      const cancelButton = wrapper.find('[data-testid="cancel-button"]')
      await cancelButton.trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
      expect(wrapper.emitted('cancel')[0]).toEqual(['ORDER001'])
    })

    it('should emit view-details event when view details button is clicked', async () => {
      const paidOrder = { ...mockOrder, status: 'paid' }
      wrapper.setProps({ order: paidOrder })

      const viewDetailsButton = wrapper.find('[data-testid="view-details-button"]')
      await viewDetailsButton.trigger('click')

      expect(wrapper.emitted('view-details')).toBeTruthy()
      expect(wrapper.emitted('view-details')[0]).toEqual(['ORDER001'])
    })
  })

  describe('Data Formatting', () => {
    it('should format time correctly', () => {
      // 验收标准：时间格式化显示
      const departureTime = wrapper.find('[data-testid="departure-time"]')
      const arrivalTime = wrapper.find('[data-testid="arrival-time"]')

      expect(departureTime.text()).toMatch(/\d{2}:\d{2}/)
      expect(arrivalTime.text()).toMatch(/\d{2}:\d{2}/)
    })

    it('should format price with currency symbol', () => {
      // 验收标准：价格格式化显示
      const price = wrapper.find('[data-testid="order-price"]')
      expect(price.text()).toMatch(/¥\d+\.?\d*/)
    })

    it('should calculate and display travel duration correctly', () => {
      // 验收标准：正确计算并显示行程时长
      const duration = wrapper.find('[data-testid="travel-duration"]')
      expect(duration.text()).toContain('4小时30分')
    })

    it('should format creation time correctly', () => {
      // 验收标准：创建时间格式化显示
      const createTime = wrapper.find('[data-testid="create-time"]')
      expect(createTime.text()).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)
    })
  })

  describe('Card Layout', () => {
    it('should have proper card structure with header, body, and footer', () => {
      // 验收标准：卡片布局包含头部、主体和底部
      const cardHeader = wrapper.find('[data-testid="card-header"]')
      const cardBody = wrapper.find('[data-testid="card-body"]')
      const cardFooter = wrapper.find('[data-testid="card-footer"]')

      expect(cardHeader.exists()).toBe(true)
      expect(cardBody.exists()).toBe(true)
      expect(cardFooter.exists()).toBe(true)
    })

    it('should display order number and status in header', () => {
      const cardHeader = wrapper.find('[data-testid="card-header"]')
      expect(cardHeader.text()).toContain('ORDER001')
      expect(cardHeader.text()).toContain('待支付')
    })

    it('should display train and travel information in body', () => {
      const cardBody = wrapper.find('[data-testid="card-body"]')
      expect(cardBody.text()).toContain('G123')
      expect(cardBody.text()).toContain('北京南')
      expect(cardBody.text()).toContain('上海虹桥')
    })

    it('should display action buttons in footer', () => {
      const cardFooter = wrapper.find('[data-testid="card-footer"]')
      expect(cardFooter.find('[data-testid="pay-button"]').exists()).toBe(true)
      expect(cardFooter.find('[data-testid="cancel-button"]').exists()).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive CSS classes', () => {
      const cardElement = wrapper.find('[data-testid="order-card"]')
      expect(cardElement.classes()).toContain('order-card')
    })

    it('should adapt layout for mobile screens', () => {
      // 验收标准：响应式设计，适配移动端显示
      const cardElement = wrapper.find('[data-testid="order-card"]')
      expect(cardElement.classes()).toContain('responsive')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for buttons', () => {
      const payButton = wrapper.find('[data-testid="pay-button"]')
      const cancelButton = wrapper.find('[data-testid="cancel-button"]')

      expect(payButton.attributes('aria-label')).toBeTruthy()
      expect(cancelButton.attributes('aria-label')).toBeTruthy()
    })

    it('should have proper role attributes', () => {
      const cardElement = wrapper.find('[data-testid="order-card"]')
      expect(cardElement.attributes('role')).toBe('article')
    })
  })
})