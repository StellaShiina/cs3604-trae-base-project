<template>
  <div class="order-card">
    <div class="order-header">
      <div class="order-number">订单号：{{ order.orderNumber }}</div>
      <div class="order-status" :class="statusClass">
        {{ getStatusText(order.status) }}
      </div>
    </div>
    
    <div class="order-content">
      <div class="train-info">
        <div class="train-number">{{ order.trainNumber }}</div>
        <div class="route">
          <span class="departure">{{ order.departure }}</span>
          <span class="arrow">→</span>
          <span class="destination">{{ order.destination }}</span>
        </div>
      </div>
      
      <div class="time-info">
        <div class="departure-time">
          <div class="time">{{ formatTime(order.departureTime) }}</div>
          <div class="date">{{ formatDate(order.departureTime) }}</div>
        </div>
        <div class="duration">
          {{ calculateDuration(order.departureTime, order.arrivalTime) }}
        </div>
        <div class="arrival-time">
          <div class="time">{{ formatTime(order.arrivalTime) }}</div>
          <div class="date">{{ formatDate(order.arrivalTime) }}</div>
        </div>
      </div>
      
      <div class="seat-info">
        <div class="seat-type">{{ order.seatType }}</div>
        <div v-if="order.seatNumber" class="seat-number">
          座位：{{ order.seatNumber }}
        </div>
      </div>
      
      <div class="price-info">
        <div class="price">¥{{ order.price.toFixed(2) }}</div>
      </div>
    </div>
    
    <div class="order-actions">
      <div class="order-time">
        下单时间：{{ formatDateTime(order.createdAt) }}
      </div>
      
      <div class="action-buttons">
        <button 
          v-if="order.status === 'pending'"
          @click="$emit('pay', order.id)"
          class="pay-btn"
        >
          立即支付
        </button>
        
        <button 
          v-if="order.status === 'pending'"
          @click="$emit('cancel', order.id)"
          class="cancel-btn"
        >
          取消订单
        </button>
        
        <button 
          v-if="order.status === 'paid'"
          class="detail-btn"
        >
          查看详情
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Order {
  id: number
  orderNumber: string
  trainNumber: string
  departure: string
  destination: string
  departureTime: string
  arrivalTime: string
  seatType: string
  seatNumber?: string
  price: number
  status: 'pending' | 'paid' | 'cancelled'
  createdAt: string
}

const props = defineProps<{
  order: Order
}>()

defineEmits<{
  pay: [orderId: number]
  cancel: [orderId: number]
}>()

const statusClass = computed(() => {
  const classMap = {
    pending: 'status-pending',
    paid: 'status-paid',
    cancelled: 'status-cancelled'
  }
  return classMap[props.order.status]
})

const getStatusText = (status: string) => {
  const textMap = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消'
  }
  return textMap[status as keyof typeof textMap] || status
}

const formatTime = (dateString: string) => {
  // TODO: Implement proper time formatting
  return new Date(dateString).toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const formatDate = (dateString: string) => {
  // TODO: Implement proper date formatting
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const formatDateTime = (dateString: string) => {
  // TODO: Implement proper datetime formatting
  return new Date(dateString).toLocaleString('zh-CN')
}

const calculateDuration = (departure: string, arrival: string) => {
  // TODO: Implement duration calculation
  const diff = new Date(arrival).getTime() - new Date(departure).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}小时${minutes}分钟`
}
</script>

<style scoped>
.order-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.order-number {
  font-weight: bold;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: bold;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-paid {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.order-content {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
}

.train-info .train-number {
  font-size: 1.25rem;
  font-weight: bold;
  color: #007bff;
}

.route {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.arrow {
  color: #666;
}

.time-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.departure-time, .arrival-time {
  text-align: center;
}

.time {
  font-size: 1.1rem;
  font-weight: bold;
}

.date {
  font-size: 0.875rem;
  color: #666;
}

.duration {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
}

.seat-info {
  text-align: center;
}

.seat-type {
  font-weight: bold;
}

.seat-number {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

.price-info {
  text-align: center;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #dc3545;
}

.order-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-top: 1px solid #ddd;
}

.order-time {
  font-size: 0.875rem;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.pay-btn {
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.detail-btn {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>