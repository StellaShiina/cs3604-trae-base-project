<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DatePicker from '@/components/Train/DatePicker.vue'
import { useRouter } from 'vue-router'
import { getOrders, cancelOrder } from '@/api/order'

const router = useRouter()
const orders = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const activeTab = ref('incomplete') // incomplete, upcoming, history

const tabs = [
  { id: 'incomplete', label: '未完成订单' },
  { id: 'upcoming', label: '未出行订单' },
  { id: 'history', label: '历史订单' }
]

const searchForm = ref({
  dateType: '1', // 1: 订票日期, 2: 乘车日期
  startDate: '',
  endDate: '',
  keyword: ''
})

const statusMap: Record<string, string> = {
  pending_payment: '待支付',
  confirmed_unpaid: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  canceled: '已取消',
  completed: '已完成',
  refunded: '已退票'
}

const seatTypeMap: Record<string, string> = {
  business: '商务座',
  first: '一等座',
  second: '二等座',
  hard_seat: '硬座',
  hard_sleeper: '硬卧',
  soft_sleeper: '软卧',
  no_seat: '无座'
}

const getSeatLabel = (type: string) => {
  return seatTypeMap[type] || type
}

const isFuture = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return false
  const now = new Date()
  const trainDate = new Date(`${dateStr} ${timeStr}`)
  return trainDate > now
}

const filteredOrders = computed(() => {
  // 1. Tab Filtering
  let result = orders.value.filter(o => {
    if (activeTab.value === 'incomplete') {
      return ['pending_payment', 'confirmed_unpaid'].includes(o.status)
    }
    
    if (activeTab.value === 'upcoming') {
      // 已支付且未发车
      return ['paid', 'completed'].includes(o.status) && isFuture(o.departure_date, o.departure_time)
    }
    
    if (activeTab.value === 'history') {
      // 已支付且已发车，或者已取消/已退票
      const isPaidAndDeparted = ['paid', 'completed'].includes(o.status) && !isFuture(o.departure_date, o.departure_time)
      const isCancelledOrRefunded = ['cancelled', 'canceled', 'refunded'].includes(o.status)
      return isPaidAndDeparted || isCancelledOrRefunded
    }
    
    return true
  })

  // 2. Search Form Filtering
  if (['upcoming', 'history'].includes(activeTab.value)) {
    const { dateType, startDate, endDate, keyword } = searchForm.value
    
    // Filter by date range
    if (startDate || endDate) {
      result = result.filter(o => {
        let dateToCheck = ''
        if (dateType === '1') {
          // Booking date (created_at)
          dateToCheck = o.created_at ? o.created_at.substring(0, 10) : ''
        } else {
          // Departure date
          dateToCheck = o.departure_date || ''
        }
        
        if (!dateToCheck) return false
        
        const startOk = startDate ? dateToCheck >= startDate : true
        const endOk = endDate ? dateToCheck <= endDate : true
        
        return startOk && endOk
      })
    }
    
    // Filter by keyword
    if (keyword && keyword.trim()) {
      const k = keyword.trim().toLowerCase()
      result = result.filter(o => {
        const trainMatch = o.train_no && o.train_no.toLowerCase().includes(k)
        const passengerMatch = o.passengers && Array.isArray(o.passengers) && o.passengers.some((p: any) => 
          p.passenger_name && p.passenger_name.toLowerCase().includes(k)
        )
        const orderIdMatch = (o.id && String(o.id).toLowerCase().includes(k))
        
        return trainMatch || passengerMatch || orderIdMatch
      })
    }
  }

  return result
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

    <!-- 查询表单 - 仅在未出行订单和历史订单显示 -->
    <div class="search-panel" v-if="['upcoming', 'history'].includes(activeTab)">
      <div class="search-row">
        <select v-model="searchForm.dateType" class="form-select">
          <option value="1">按订票日期查询</option>
          <option value="2">按乘车日期查询</option>
        </select>
        
        <div class="date-range">
          <div class="date-picker-wrapper">
            <DatePicker 
              :value="searchForm.startDate" 
              @update:value="val => searchForm.startDate = val"
              min-date="2000-01-01"
              max-date="2030-12-31"
            />
          </div>
          <span class="separator">-</span>
          <div class="date-picker-wrapper">
            <DatePicker 
              :value="searchForm.endDate" 
              @update:value="val => searchForm.endDate = val"
              min-date="2000-01-01"
              max-date="2030-12-31"
            />
          </div>
        </div>
        
        <div class="keyword-search">
          <input type="text" v-model="searchForm.keyword" placeholder="订单号/车次/姓名" class="form-input keyword-input" />
          <button class="btn-clear" v-if="searchForm.keyword" @click="searchForm.keyword = ''">×</button>
        </div>
        
        <button class="btn-search" @click="fetchOrders">查询</button>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <!-- 空状态 -->
    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <div class="empty-content">
        <img src="/images/车票预订提示.png" alt="No Orders" class="empty-img" />
        <div class="empty-text">
          <p class="main-msg">您没有对应的订单内容哦 ～</p>
          <p class="sub-msg">
            您可以通过<router-link to="/search" class="link">车票预订</router-link>功能，来制定出行计划。
          </p>
        </div>
      </div>
    </div>
    
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
               {{ p.passenger_name }} ({{ getSeatLabel(p.seat_type) }}) 
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

.search-panel {
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;

  .search-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .form-select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-width: 140px;
    outline: none;
    
    &:focus { border-color: #007bff; }
  }

  .date-range {
      display: flex;
      align-items: center;
      gap: 5px;
      
      .date-picker-wrapper {
        width: 160px;
      }
      
      .separator { color: #999; }
    }

  .keyword-search {
    position: relative;
    
    .keyword-input {
      padding: 8px 30px 8px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 200px;
      outline: none;
      
      &:focus { border-color: #007bff; }
    }
    
    .btn-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      font-size: 16px;
      
      &:hover { color: #666; }
    }
  }

  .btn-search {
    padding: 8px 20px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover {
      background: #f5f5f5;
      color: #007bff;
      border-color: #007bff;
    }
  }
}

.empty-state {
  padding: 60px 0;
  display: flex;
  justify-content: center;
  
  .empty-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .empty-img {
    width: 80px; /* Adjusted for icon size */
    height: auto;
  }
  
  .empty-text {
    text-align: left;
    
    .main-msg {
      font-size: 16px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .sub-msg {
      font-size: 16px;
      color: #666;
    }
    
    .link {
      color: #007bff;
      text-decoration: underline;
      margin: 0 4px;
      
      &:hover { color: #0056b3; }
    }
  }
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: #999;
}
.error { color: red; }
</style>
