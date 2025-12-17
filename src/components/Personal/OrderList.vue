<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getOrders, cancelOrder, payOrder } from '@/api/order'

const router = useRouter()
const orders = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const activeTab = ref('all') // all, unpaid, paid

const tabs = [
  { id: 'all', label: '全部订单' },
  { id: 'unpaid', label: '未支付' },
  { id: 'paid', label: '已支付' },
  { id: 'completed', label: '已完成' } // backend might not distinguish paid vs completed well yet
]

const statusMap: Record<string, string> = {
  pending_payment: '待支付',
  confirmed_unpaid: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  canceled: '已取消',
  completed: '已完成',
  refunded: '已退票'
}

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') return orders.value
  if (activeTab.value === 'unpaid') {
    return orders.value.filter(o => ['pending_payment', 'confirmed_unpaid'].includes(o.status))
  }
  if (activeTab.value === 'paid') {
    return orders.value.filter(o => ['paid', 'completed'].includes(o.status))
  }
  if (activeTab.value === 'completed') {
    return orders.value.filter(o => o.status === 'completed')
  }
  return orders.value
})

const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getOrders()
    if (response.data) {
       orders.value = response.data
    }
  } catch (err: any) {
    console.error('Failed to fetch orders', err)
    error.value = '获取订单列表失败'
  } finally {
    loading.value = false
  }
}

const handlePay = (orderId: string) => {
  router.push(`/payment/${orderId}`)
}

const handleCancel = async (orderId: string) => {
  if (!confirm('确定要取消该订单吗？')) return
  try {
    await cancelOrder(orderId)
    alert('订单已取消')
    fetchOrders()
  } catch (err: any) {
    alert(err.response?.data?.error || '取消失败')
  }
}

const getStatusLabel = (status: string) => {
  return statusMap[status] || status
}

onMounted(() => {
  fetchOrders()
})
</script>

<template>
  <div class="order-list">
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="filteredOrders.length === 0" class="empty">暂无订单</div>
    
    <div v-else class="order-items">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="card-header">
          <span class="order-date">订票日期: {{ order.created_at?.substring(0, 10) }}</span>
          <span class="order-status" :class="order.status">{{ getStatusLabel(order.status) }}</span>
        </div>
        <div class="card-body">
          <div class="train-info">
             <div class="route">
               <span class="station">{{ order.departure_station }}</span>
               <span class="arrow">→</span>
               <span class="station">{{ order.arrival_station }}</span>
               <span class="train-no">{{ order.train_no }}</span>
             </div>
             <div class="time">
               {{ order.departure_date }} {{ order.departure_time }} 开
             </div>
          </div>
          
          <div class="passengers">
             <div v-for="(p, idx) in order.passengers" :key="idx" class="p-item">
               {{ p.passenger_name }} ({{ p.seat_type === 'second' ? '二等座' : p.seat_type }}) 
               <span v-if="p.seat_number">{{ p.car_number }}车 {{ p.seat_number }}</span>
             </div>
          </div>
          
          <div class="price-action">
             <div class="price">总额: <span class="amount">¥{{ order.total_price }}</span></div>
             <div class="actions">
               <button v-if="order.status === 'confirmed_unpaid' || order.status === 'pending_payment'" @click="handlePay(order.id)" class="btn-pay">去支付</button>
               <button v-if="order.status === 'confirmed_unpaid' || order.status === 'pending_payment'" @click="handleCancel(order.id)" class="btn-cancel">取消订单</button>
               <!-- Add refund button for paid orders if needed -->
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.order-list {
  padding: 10px;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #ddd;
  margin-bottom: 20px;
  
  .tab-btn {
    padding: 10px 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    
    &.active {
      color: #007bff;
      border-bottom: 2px solid #007bff;
      margin-bottom: -2px;
      font-weight: bold;
    }
  }
}

.order-card {
  border: 1px solid #ddd;
  margin-bottom: 20px;
  border-radius: 4px;
  
  .card-header {
    background: #f8f9fa;
    padding: 10px 15px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    
    .order-status {
      font-weight: bold;
      
      &.confirmed_unpaid, &.pending_payment { color: #ff9a00; }
      &.paid, &.completed { color: #28a745; }
      &.cancelled { color: #999; }
    }
  }
  
  .card-body {
    padding: 15px;
  }
}

.train-info {
  margin-bottom: 15px;
  
  .route {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
    
    .station { color: #333; }
    .arrow { margin: 0 10px; color: #999; }
    .train-no { margin-left: 20px; color: #007bff; }
  }
  
  .time {
    color: #666;
  }
}

.passengers {
  margin-bottom: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  
  .p-item {
    margin-bottom: 5px;
    &:last-child { margin-bottom: 0; }
  }
}

.price-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #ddd;
  padding-top: 15px;
  
  .price {
    font-size: 16px;
    .amount {
      color: #ff9a00;
      font-size: 20px;
      font-weight: bold;
    }
  }
  
  .actions {
    display: flex;
    gap: 10px;
    
    button {
      padding: 5px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .btn-pay {
      background: #ff9a00;
      color: #fff;
      border: none;
      
      &:hover { background: #e68a00; }
    }
    
    .btn-cancel {
      background: #fff;
      border: 1px solid #ddd;
      color: #666;
      
      &:hover { background: #f5f5f5; }
    }
  }
}

.loading, .error, .empty {
  text-align: center;
  padding: 40px;
  color: #999;
}
.error { color: red; }
</style>
