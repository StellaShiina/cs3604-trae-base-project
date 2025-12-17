<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getNewOrderInfo, createOrder } from '@/api/order'
import TopHeader from '@/components/Common/TopHeader.vue'
import BottomFooter from '@/components/Common/BottomFooter.vue'
import MainNavigation from '@/components/Common/MainNavigation.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const trainInfo = ref<any>(null)
const fareInfo = ref<Record<string, number>>({})
const availableSeats = ref<Record<string, number>>({})
const passengers = ref<any[]>([])
const selectedPassengerIds = ref<string[]>([])
const selectedSeatType = ref('')

const seatTypes = computed(() => {
  return Object.keys(fareInfo.value).map(type => ({
    type,
    label: getSeatTypeLabel(type),
    price: fareInfo.value[type],
    count: availableSeats.value[type] || 0
  }))
})

const selectedPassengers = computed(() => {
  return passengers.value.filter(p => selectedPassengerIds.value.includes(p.id))
})

const totalPrice = computed(() => {
  if (!selectedSeatType.value) return 0
  const pricePerSeat = fareInfo.value[selectedSeatType.value] || 0
  return pricePerSeat * selectedPassengerIds.value.length
})

const getSeatTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    business: '商务座',
    first: '一等座',
    second: '二等座',
    softSleeper: '软卧',
    hardSleeper: '硬卧',
    hardSeat: '硬座',
    noSeat: '无座'
  }
  return map[type] || type
}

const formatPrice = (cents: number) => {
  return (cents / 100).toFixed(1)
}

const getCardTypeName = (type: string) => {
  const map: Record<string, string> = {
    id_card: '身份证',
    passport: '护照'
  }
  return map[type] || '身份证'
}

const getPassengerTypeName = (type: string) => {
  const map: Record<string, string> = {
    adult: '成人票',
    student: '学生票',
    child: '儿童票',
    disability: '残军票'
  }
  return map[type] || '成人票'
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }

  const { trainNo, departureStation, arrivalStation, departureDate } = route.query

  if (!trainNo) {
    error.value = '缺少车次信息'
    return
  }

  try {
    loading.value = true
    const response = await getNewOrderInfo({
      trainNo: trainNo as string,
      departureStation: departureStation as string,
      arrivalStation: arrivalStation as string,
      departureDate: departureDate as string
    })
    
    if (response.data) {
      trainInfo.value = response.data.trainInfo
      fareInfo.value = response.data.fareInfo || {}
      availableSeats.value = response.data.availableSeats || {}
      passengers.value = response.data.passengers || []
      selectedSeatType.value = response.data.defaultSeatType || Object.keys(fareInfo.value)[0] || ''
    }
  } catch (err: any) {
    console.error('Failed to fetch order info', err)
    error.value = err.response?.data?.error || '获取订单信息失败'
  } finally {
    loading.value = false
  }
})

const handleSubmitOrder = async () => {
  if (selectedPassengerIds.value.length === 0) {
    alert('请选择乘客')
    return
  }
  if (!selectedSeatType.value) {
    alert('请选择席别')
    return
  }

  const orderData = {
    trainNo: trainInfo.value.trainNo,
    seatType: selectedSeatType.value,
    departureStation: trainInfo.value.departureStation,
    arrivalStation: trainInfo.value.arrivalStation,
    departureDate: trainInfo.value.departureDate,
    passengers: selectedPassengers.value.map(p => ({
        id: p.id,
        name: p.name,
        card_no: p.card_no,
        card_type: p.card_type,
        seat_type: selectedSeatType.value
      }))
  }

  try {
    const response = await createOrder(orderData)
    const orderId = response.data.orderId
    alert('订单提交成功！')
    router.push(`/payment/${orderId}`)
  } catch (err: any) {
    console.error('Failed to create order', err)
    alert(err.response?.data?.error || '订单提交失败')
  }
}
</script>

<template>
  <div class="order-page">
    <TopHeader />
    <MainNavigation />
    
    <div class="main-content">
      <div v-if="loading" class="loading">正在加载订单信息...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="order-container">
        <!-- 列车信息 -->
        <div class="panel">
          <div class="panel-header">列车信息</div>
          <div class="panel-body" v-if="trainInfo">
             <div class="train-info-row">
               <span class="train-date">{{ trainInfo.departureDate }}</span>
               <span class="train-no">{{ trainInfo.trainNo }}</span>
               <div class="station-info">
                 <span class="station from">{{ trainInfo.departureStation }}</span>
                 <span class="time">{{ trainInfo.departureTime }}</span>
                 <span class="arrow">→</span>
                 <span class="station to">{{ trainInfo.arrivalStation }}</span>
                 <span class="time">{{ trainInfo.arrivalTime }}</span>
               </div>
             </div>
          </div>
        </div>
        
        <!-- 席别选择 -->
        <div class="panel">
          <div class="panel-header">选择席别</div>
          <div class="panel-body seat-types">
             <label 
               v-for="seat in seatTypes" 
               :key="seat.type" 
               class="seat-type-item"
               :class="{ active: selectedSeatType === seat.type, disabled: seat.count === 0 }"
             >
               <input 
                 type="radio" 
                 v-model="selectedSeatType" 
                 :value="seat.type" 
                 :disabled="seat.count === 0"
               />
               <div class="seat-content">
                 <span class="seat-name">{{ seat.label }}</span>
                 <span class="seat-price">¥{{ formatPrice(seat.price) }}</span>
                 <span class="seat-count" v-if="seat.count > 0">有票</span>
                 <span class="seat-count none" v-else>无票</span>
               </div>
             </label>
          </div>
        </div>

        <!-- 乘客选择 -->
        <div class="panel">
          <div class="panel-header">
            <span>选择乘客</span>
          </div>
          <div class="panel-body">
             <div v-if="passengers.length === 0" class="no-passengers">
               暂无常用联系人，请先添加
             </div>
             <div v-else class="passenger-list">
               <label v-for="p in passengers" :key="p.id" class="passenger-item">
                 <input type="checkbox" :value="p.id" v-model="selectedPassengerIds" />
                 <span class="p-name">{{ p.name }}</span>
                 <span class="p-card">{{ getCardTypeName(p.card_type) }} {{ p.card_no }}</span>
               </label>
             </div>
          </div>
        </div>
        
        <!-- 票务汇总 -->
        <div class="ticket-summary" v-if="selectedPassengers.length > 0">
           <div class="summary-item" v-for="p in selectedPassengers" :key="p.id">
             <span class="s-name">{{ p.name }}</span>
             <span class="s-type">{{ getPassengerTypeName(p.passenger_type) }}</span>
             <span class="s-seat">{{ getSeatTypeLabel(selectedSeatType) }}</span>
             <span class="s-price">¥{{ formatPrice(fareInfo[selectedSeatType] || 0) }}</span>
           </div>
        </div>

        <div class="action-bar">
           <div class="total-price">
             订单总额：<span class="price-num">¥{{ formatPrice(totalPrice) }}</span>
           </div>
           <button class="btn-submit" @click="handleSubmitOrder">提交订单</button>
        </div>
      </div>
    </div>
    
    <BottomFooter />
  </div>
</template>

<style scoped lang="scss">
.order-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.panel {
  background: #fff;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  border-radius: 4px;
  
  .panel-header {
    background: #f8f9fa;
    padding: 10px 15px;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
  }
  
  .panel-body {
    padding: 20px;
  }
}

.train-info-row {
  display: flex;
  align-items: center;
  font-size: 16px;
  
  .train-date, .train-no {
    font-weight: bold;
    margin-right: 30px;
  }
  
  .station-info {
    display: flex;
    align-items: center;
    gap: 10px;
    
    .station {
      font-weight: bold;
      font-size: 18px;
    }
    .arrow {
      color: #999;
    }
  }
}

.seat-types {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.seat-type-item {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  min-width: 150px;
  position: relative;
  
  &.active {
    border-color: #ff9a00;
    background-color: #fff8e6;
  }
  
  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #f9f9f9;
  }
  
  input {
    margin-right: 10px;
  }
  
  .seat-content {
    display: flex;
    flex-direction: column;
    
    .seat-name {
      font-weight: bold;
    }
    .seat-price {
      color: #ff9a00;
      font-weight: bold;
    }
    .seat-count {
      font-size: 12px;
      color: #28a745;
      &.none {
        color: #dc3545;
      }
    }
  }
}

.passenger-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.passenger-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #f9f9f9;
  }
  
  input {
    margin-right: 10px;
  }
  
  .p-name {
    font-weight: bold;
    margin-right: 10px;
    min-width: 60px;
  }
  
  .p-card {
    color: #666;
    font-size: 14px;
  }
}

.ticket-summary {
  background: #fff7e6;
  border: 1px solid #ffcc80;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px dashed #ffdcb3;
    
    &:last-child {
      border-bottom: none;
    }
    
    span {
      flex: 1;
      text-align: center;
    }
    .s-price {
      color: #ff9a00;
      font-weight: bold;
      text-align: right;
    }
    .s-name {
      text-align: left;
      font-weight: bold;
    }
  }
}

.action-bar {
  background: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  
  .total-price {
    font-size: 18px;
    
    .price-num {
      color: #ff9a00;
      font-size: 28px;
      font-weight: bold;
    }
  }
  
  .btn-submit {
    background: #ff9a00;
    color: #fff;
    border: none;
    padding: 12px 50px;
    font-size: 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    
    &:hover {
      background: #e68a00;
    }
  }
}

.loading, .error {
  text-align: center;
  padding: 50px;
  font-size: 18px;
}
.error {
  color: red;
}
</style>
