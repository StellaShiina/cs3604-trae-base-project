<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Passenger {
  sequence: number
  name: string
  idCardType: string
  idCardNumber: string
  ticketType: string
  seatType: string
  carNumber?: string
  seatNumber?: string
  price: number
}

interface TrainInfo {
  trainNo: string
  departureStation: string
  arrivalStation: string
  departureDate: string
  departureTime: string
  arrivalTime: string
}

const props = defineProps<{
  trainInfo: TrainInfo
  passengers: Passenger[]
  totalPrice: number
  isProcessing: boolean
}>()

const emit = defineEmits(['cancelOrder', 'confirmPayment'])

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} (${weekday})`
}

const maskIdCard = (idCard: string) => {
  if (!idCard || idCard.length < 8) return idCard
  const start = idCard.substring(0, 4)
  const end = idCard.substring(idCard.length - 3)
  const middle = '*'.repeat(idCard.length - 7)
  return `${start}${middle}${end}`
}
</script>

<template>
  <div class="order-info-display">
    <div class="section header">
      <h3>订单信息</h3>
      <div class="train-info">
        <strong>{{ trainInfo.departureDate }}</strong>
        <strong>{{ trainInfo.trainNo }}</strong> 次
        <span>{{ trainInfo.departureStation }}</span>
        <span>{{ trainInfo.departureTime }}</span>
        <span class="arrow">→</span>
        <span>{{ trainInfo.arrivalStation }}</span>
        <span>{{ trainInfo.arrivalTime }}</span>
      </div>
    </div>
    
    <div class="section passengers">
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>姓名</th>
            <th>证件类型</th>
            <th>证件号码</th>
            <th>票种</th>
            <th>席别</th>
            <th>车厢</th>
            <th>席位号</th>
            <th>票价（元）</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in passengers" :key="p.sequence">
            <td>{{ p.sequence }}</td>
            <td>{{ p.name }}</td>
            <td>{{ p.idCardType }}</td>
            <td>{{ maskIdCard(p.idCardNumber) }}</td>
            <td>{{ p.ticketType }}</td>
            <td>{{ p.seatType }}</td>
            <td>{{ p.carNumber || '--' }}</td>
            <td>{{ p.seatNumber || '--' }}</td>
            <td class="price">¥{{ p.price }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="section total">
      <div class="amount">
        总张数：<strong>{{ passengers.length }}</strong> 张，
        应付金额：<strong class="price">¥{{ totalPrice }}</strong> 元
      </div>
    </div>
    
    <div class="section warm-tips">
      <h3>温馨提示：</h3>
      <ol>
        <li>请在指定时间内完成网上支付。</li>
        <li>逾期未支付，系统将取消本次交易。</li>
        <li>在完成支付或取消本订单之前，您将无法购买其他车票。</li>
      </ol>
    </div>
    
    <div class="actions">
      <button class="btn cancel" @click="emit('cancelOrder')" :disabled="isProcessing">取消订单</button>
      <button class="btn pay" @click="emit('confirmPayment')" :disabled="isProcessing">
        {{ isProcessing ? '处理中...' : '网上支付' }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.order-info-display {
  background: #fff;
  border: 1px solid #ddd;
  padding: 20px;
  
  .section {
    margin-bottom: 20px;
    
    &.header {
      border-bottom: 1px solid #eee;
      padding-bottom: 15px;
      h3 { margin: 0 0 10px; font-size: 16px; border-left: 4px solid #0078d7; padding-left: 10px; }
      .train-info {
        font-size: 14px;
        strong { margin-right: 10px; }
        span { margin-right: 10px; }
        .arrow { color: #999; }
      }
    }
    
    &.passengers {
      table {
        width: 100%;
        border-collapse: collapse;
        th, td {
          border: 1px solid #eee;
          padding: 8px;
          text-align: center;
          font-size: 14px;
        }
        th { background: #f8f8f8; font-weight: normal; color: #666; }
        .price { color: #f60; }
      }
    }
    
    &.total {
      text-align: right;
      font-size: 14px;
      .price { color: #f60; font-size: 20px; }
    }
    
    &.warm-tips {
      background: #fffbf5;
      border: 1px solid #faecd8;
      padding: 15px;
      font-size: 13px;
      color: #666;
      h3 { margin: 0 0 5px; font-size: 14px; color: #e6a23c; }
      ol { padding-left: 20px; margin: 0; li { line-height: 1.8; } }
    }
  }
  
  .actions {
    text-align: center;
    margin-top: 30px;
    
    .btn {
      padding: 10px 30px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
      margin: 0 10px;
      
      &.cancel {
        background: #f5f5f5;
        border: 1px solid #ddd;
        color: #666;
        &:hover { background: #e8e8e8; }
      }
      
      &.pay {
        background: #f60;
        border: 1px solid #f60;
        color: #fff;
        &:hover { background: #f50; }
        &:disabled { opacity: 0.6; cursor: not-allowed; }
      }
    }
  }
}
</style>
