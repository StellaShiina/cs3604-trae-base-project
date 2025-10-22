<template>
  <div class="order-management">
    <div class="header">
      <h2>订单管理</h2>
      <div class="filter-controls">
        <select v-model="statusFilter" class="status-filter">
          <option value="">全部状态</option>
          <option value="1">待支付</option>
          <option value="2">已支付</option>
          <option value="3">已出票</option>
          <option value="4">已取消</option>
          <option value="5">已退票</option>
        </select>
      </div>
    </div>

    <div class="order-list">
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <p>暂无订单记录</p>
        <p class="empty-tip">您还没有任何订单，快去购买车票吧！</p>
      </div>

      <div v-else class="order-cards">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="order-card"
        >
          <div class="card-header">
            <div class="order-info">
              <h3>订单号：{{ order.orderNumber }}</h3>
              <span class="order-status" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </div>
            <div class="order-date">
              {{ formatDate(order.createTime) }}
            </div>
          </div>
          
          <div class="card-body">
            <div class="train-info">
              <div class="route">
                <div class="station">
                  <div class="station-name">{{ order.fromStation }}</div>
                  <div class="time">{{ order.departTime }}</div>
                </div>
                <div class="arrow">→</div>
                <div class="station">
                  <div class="station-name">{{ order.toStation }}</div>
                  <div class="time">{{ order.arriveTime }}</div>
                </div>
              </div>
              
              <div class="train-details">
                <span class="train-number">{{ order.trainNumber }}</span>
                <span class="seat-type">{{ order.seatType }}</span>
                <span class="travel-date">{{ formatDate(order.travelDate) }}</span>
              </div>
            </div>
            
            <div class="passenger-info">
              <div class="passenger-list">
                <span v-for="(passenger, index) in order.passengers" :key="index" class="passenger-tag">
                  {{ passenger.name }}
                </span>
              </div>
              <div class="price-info">
                <span class="total-price">¥{{ order.totalPrice }}</span>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="order-actions">
              <button 
                v-if="order.status === '1'" 
                class="pay-btn"
                @click="payOrder(order.id)"
              >
                立即支付
              </button>
              <button 
                v-if="order.status === '2' || order.status === '3'" 
                class="refund-btn"
                @click="refundOrder(order.id)"
              >
                申请退票
              </button>
              <button 
                v-if="order.status === '1'" 
                class="cancel-btn"
                @click="cancelOrder(order.id)"
              >
                取消订单
              </button>
              <button class="detail-btn" @click="viewOrderDetail(order)">
                查看详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单详情模态框 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>订单详情</h3>
          <button class="close-btn" @click="closeDetailModal">✕</button>
        </div>
        
        <div class="modal-body" v-if="selectedOrder">
          <div class="detail-section">
            <h4>订单信息</h4>
            <div class="detail-row">
              <span class="label">订单号：</span>
              <span class="value">{{ selectedOrder.orderNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="label">订单状态：</span>
              <span class="value status" :class="getStatusClass(selectedOrder.status)">
                {{ getStatusText(selectedOrder.status) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">创建时间：</span>
              <span class="value">{{ formatDateTime(selectedOrder.createTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">总金额：</span>
              <span class="value price">¥{{ selectedOrder.totalPrice }}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>行程信息</h4>
            <div class="detail-row">
              <span class="label">车次：</span>
              <span class="value">{{ selectedOrder.trainNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="label">出发站：</span>
              <span class="value">{{ selectedOrder.fromStation }}</span>
            </div>
            <div class="detail-row">
              <span class="label">到达站：</span>
              <span class="value">{{ selectedOrder.toStation }}</span>
            </div>
            <div class="detail-row">
              <span class="label">出发时间：</span>
              <span class="value">{{ formatDateTime(selectedOrder.travelDate + ' ' + selectedOrder.departTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">到达时间：</span>
              <span class="value">{{ formatDateTime(selectedOrder.travelDate + ' ' + selectedOrder.arriveTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">座位类型：</span>
              <span class="value">{{ selectedOrder.seatType }}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>乘客信息</h4>
            <div class="passenger-details">
              <div v-for="(passenger, index) in selectedOrder.passengers" :key="index" class="passenger-detail">
                <div class="passenger-name">{{ passenger.name }}</div>
                <div class="passenger-id">{{ passenger.idType }} {{ passenger.idNumber }}</div>
                <div class="seat-number">{{ passenger.seatNumber }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'OrderManagement',
  setup() {
    const orders = ref([])
    const statusFilter = ref('')
    const showDetailModal = ref(false)
    const selectedOrder = ref(null)
    
    const filteredOrders = computed(() => {
      if (!statusFilter.value) {
        return orders.value
      }
      return orders.value.filter(order => order.status === statusFilter.value)
    })
    
    const getStatusText = (status) => {
      const statusMap = {
        '1': '待支付',
        '2': '已支付',
        '3': '已出票',
        '4': '已取消',
        '5': '已退票'
      }
      return statusMap[status] || '未知状态'
    }
    
    const getStatusClass = (status) => {
      const classMap = {
        '1': 'status-unpaid',
        '2': 'status-paid',
        '3': 'status-issued',
        '4': 'status-cancelled',
        '5': 'status-refunded'
      }
      return classMap[status] || ''
    }
    
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN')
    }
    
    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr) return ''
      const date = new Date(dateTimeStr)
      return date.toLocaleString('zh-CN')
    }
    
    const payOrder = (orderId) => {
      console.log('支付订单:', orderId)
      // TODO: 实现支付逻辑
      alert('支付功能开发中...')
    }
    
    const refundOrder = (orderId) => {
      if (confirm('确定要申请退票吗？')) {
        console.log('申请退票:', orderId)
        // TODO: 实现退票逻辑
        alert('退票申请已提交')
      }
    }
    
    const cancelOrder = (orderId) => {
      if (confirm('确定要取消订单吗？')) {
        console.log('取消订单:', orderId)
        // TODO: 实现取消订单逻辑
        const order = orders.value.find(o => o.id === orderId)
        if (order) {
          order.status = '4'
        }
        alert('订单已取消')
      }
    }
    
    const viewOrderDetail = (order) => {
      selectedOrder.value = order
      showDetailModal.value = true
    }
    
    const closeDetailModal = () => {
      showDetailModal.value = false
      selectedOrder.value = null
    }
    
    const loadOrders = async () => {
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模拟订单数据
        orders.value = [
          {
            id: 1,
            orderNumber: 'E202401150001',
            trainNumber: 'G123',
            fromStation: '北京南',
            toStation: '上海虹桥',
            departTime: '08:00',
            arriveTime: '12:30',
            travelDate: '2024-01-15',
            seatType: '二等座',
            passengers: [
              { name: '张三', idType: '身份证', idNumber: '110101199001011234', seatNumber: '05车06A' },
              { name: '李四', idType: '身份证', idNumber: '110101199002022345', seatNumber: '05车06B' }
            ],
            totalPrice: 1068,
            status: '2',
            createTime: '2024-01-10T10:30:00'
          },
          {
            id: 2,
            orderNumber: 'E202401160002',
            trainNumber: 'D456',
            fromStation: '上海虹桥',
            toStation: '杭州东',
            departTime: '14:30',
            arriveTime: '15:45',
            travelDate: '2024-01-16',
            seatType: '一等座',
            passengers: [
              { name: '王五', idType: '身份证', idNumber: '110101199003033456', seatNumber: '03车02A' }
            ],
            totalPrice: 146,
            status: '1',
            createTime: '2024-01-11T15:20:00'
          },
          {
            id: 3,
            orderNumber: 'E202401170003',
            trainNumber: 'G789',
            fromStation: '广州南',
            toStation: '深圳北',
            departTime: '16:20',
            arriveTime: '17:05',
            travelDate: '2024-01-17',
            seatType: '二等座',
            passengers: [
              { name: '赵六', idType: '身份证', idNumber: '110101199004044567', seatNumber: '08车15C' }
            ],
            totalPrice: 74.5,
            status: '3',
            createTime: '2024-01-12T09:15:00'
          }
        ]
      } catch (error) {
        console.error('加载订单失败:', error)
      }
    }
    
    onMounted(() => {
      loadOrders()
    })
    
    return {
      orders,
      statusFilter,
      filteredOrders,
      showDetailModal,
      selectedOrder,
      getStatusText,
      getStatusClass,
      formatDate,
      formatDateTime,
      payOrder,
      refundOrder,
      cancelOrder,
      viewOrderDetail,
      closeDetailModal
    }
  }
}
</script>

<style scoped>
.order-management {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.status-filter {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.status-filter:focus {
  outline: none;
  border-color: #1890ff;
}

.order-list {
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 8px 0;
  color: #666;
}

.empty-tip {
  font-size: 14px;
  color: #999;
}

.order-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.order-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.order-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-unpaid {
  background: #fff2e8;
  color: #fa8c16;
}

.status-paid {
  background: #f6ffed;
  color: #52c41a;
}

.status-issued {
  background: #e6f7ff;
  color: #1890ff;
}

.status-cancelled {
  background: #fff1f0;
  color: #ff4d4f;
}

.status-refunded {
  background: #f9f0ff;
  color: #722ed1;
}

.order-date {
  color: #666;
  font-size: 14px;
}

.card-body {
  padding: 20px;
}

.train-info {
  margin-bottom: 16px;
}

.route {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.station {
  flex: 1;
  text-align: center;
}

.station-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.time {
  font-size: 14px;
  color: #666;
}

.arrow {
  margin: 0 20px;
  font-size: 20px;
  color: #1890ff;
  font-weight: bold;
}

.train-details {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.train-number {
  font-weight: 600;
  color: #1890ff;
}

.passenger-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.passenger-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.passenger-tag {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.price-info {
  text-align: right;
}

.total-price {
  font-size: 20px;
  font-weight: 600;
  color: #ff4d4f;
}

.card-footer {
  padding: 16px 20px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.order-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.order-actions button {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.pay-btn {
  background: #1890ff !important;
  color: white !important;
  border-color: #1890ff !important;
}

.pay-btn:hover {
  background: #40a9ff !important;
  border-color: #40a9ff !important;
}

.refund-btn {
  color: #fa8c16;
  border-color: #fa8c16;
}

.refund-btn:hover {
  background: #fa8c16;
  color: white;
}

.cancel-btn {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.cancel-btn:hover {
  background: #ff4d4f;
  color: white;
}

.detail-btn:hover {
  color: #1890ff;
  border-color: #1890ff;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
  align-items: center;
}

.detail-row .label {
  width: 100px;
  color: #666;
  font-size: 14px;
}

.detail-row .value {
  flex: 1;
  color: #333;
  font-size: 14px;
}

.detail-row .value.status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.detail-row .value.price {
  font-size: 16px;
  font-weight: 600;
  color: #ff4d4f;
}

.passenger-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.passenger-detail {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.passenger-name {
  font-weight: 600;
  color: #333;
}

.passenger-id {
  color: #666;
  font-size: 14px;
}

.seat-number {
  color: #1890ff;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-management {
    padding: 10px;
  }
  
  .header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .route {
    flex-direction: column;
    gap: 8px;
  }
  
  .arrow {
    transform: rotate(90deg);
    margin: 8px 0;
  }
  
  .passenger-info {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .order-actions {
    flex-wrap: wrap;
  }
  
  .passenger-detail {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }
}
</style>