<template>
  <div class="payment-countdown-timer" :class="{ 'payment-countdown-expired': isExpired, 'payment-countdown-warning': isWarning }">
    <div class="payment-countdown-icon">
      <img src="/images/lock.png" alt="锁定" />
    </div>
    <span class="payment-countdown-text">
      席位已锁定，请在提示时间内尽快完成支付，完成网上购票。支付剩余时间：<span class="payment-countdown-time">{{ formatTime(timeRemaining) }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { getTimeRemaining } from '../api/order';
import './PaymentCountdownTimer.css';

const props = defineProps<{
  orderId: string;
  initialTimeRemaining?: number;
  onTimeout?: () => void;
}>();

const emit = defineEmits<{
  (e: 'timeout'): void;
}>();

const timeRemaining = ref(props.initialTimeRemaining || 0);
const isExpired = ref(false);

const isWarning = computed(() => timeRemaining.value < 300);

let intervalId: number | null = null;
let syncIntervalId: number | null = null;

const fetchTimeRemaining = async () => {
  try {
    const response = await getTimeRemaining(props.orderId);
    if (response && (response as any).timeRemaining !== undefined) {
      timeRemaining.value = (response as any).timeRemaining;
    }
  } catch (error) {
    console.error('获取剩余时间失败:', error);
  }
};

onMounted(() => {
  if (props.initialTimeRemaining === undefined) {
    fetchTimeRemaining();
  }

  intervalId = window.setInterval(() => {
    if (timeRemaining.value <= 1) {
      isExpired.value = true;
      if (props.onTimeout) {
        props.onTimeout();
      }
      emit('timeout');
      timeRemaining.value = 0;
      if (intervalId) clearInterval(intervalId);
    } else {
      timeRemaining.value -= 1;
    }
  }, 1000);

  // Sync every 30 seconds
  syncIntervalId = window.setInterval(() => {
    fetchTimeRemaining();
  }, 30000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
  if (syncIntervalId) clearInterval(syncIntervalId);
});

watch(() => props.initialTimeRemaining, (newVal) => {
  if (newVal !== undefined) {
    timeRemaining.value = newVal;
  }
});

const formatTime = (seconds: number): string => {
  if (seconds <= 0) return '00分00秒';
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${String(minutes).padStart(2, '0')}分${String(secs).padStart(2, '0')}秒`;
};
</script>
