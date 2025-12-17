<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getOrderTimeRemaining } from '@/api/order'

const props = defineProps<{
  orderId: string
  initialTimeRemaining?: number
}>()

const emit = defineEmits(['timeout'])

const timeRemaining = ref(props.initialTimeRemaining || 0)
const isExpired = ref(false)
let intervalId: any = null
let syncIntervalId: any = null

const fetchTime = async () => {
  try {
    const res = await getOrderTimeRemaining(props.orderId)
    if (res.data && res.data.timeRemaining !== undefined) {
      timeRemaining.value = res.data.timeRemaining
    }
  } catch (err) {
    console.error('Failed to fetch time remaining', err)
  }
}

const startTimer = () => {
  if (intervalId) clearInterval(intervalId)
  intervalId = setInterval(() => {
    if (timeRemaining.value <= 0) {
      isExpired.value = true
      emit('timeout')
      clearInterval(intervalId)
      return
    }
    timeRemaining.value--
  }, 1000)
}

watch(() => props.initialTimeRemaining, (val) => {
  if (val !== undefined) {
    timeRemaining.value = val
  } else {
    fetchTime()
  }
})

onMounted(() => {
  if (props.initialTimeRemaining === undefined) {
    fetchTime()
  }
  startTimer()
  
  syncIntervalId = setInterval(fetchTime, 30000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (syncIntervalId) clearInterval(syncIntervalId)
})

const formatTime = (seconds: number) => {
  if (seconds <= 0) return '00分00秒'
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(minutes).padStart(2, '0')}分${String(secs).padStart(2, '0')}秒`
}
</script>

<template>
  <div class="payment-countdown-timer" :class="{ expired: isExpired, warning: timeRemaining < 300 }">
    <div class="icon">
       🔒
    </div>
    <div class="content">
      <div class="label">席位已锁定，请在30分钟内进行支付，完成购票。</div>
      <div class="timer">剩余支付时间：<strong>{{ formatTime(timeRemaining) }}</strong></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.payment-countdown-timer {
  background: #eef1f6;
  border: 1px solid #dcdfe6;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  &.warning {
    background: #fdf6ec;
    border-color: #faecd8;
    .timer strong { color: #e6a23c; }
  }
  
  &.expired {
    background: #fef0f0;
    border-color: #fde2e2;
    .timer strong { color: #f56c6c; }
  }

  .icon {
    font-size: 24px;
    margin-right: 15px;
  }
  
  .content {
    .label {
      font-size: 14px;
      color: #606266;
      margin-bottom: 5px;
    }
    .timer {
      font-size: 16px;
      color: #303133;
      strong {
        font-size: 20px;
        color: #f56c6c;
        margin-left: 5px;
      }
    }
  }
}
</style>
