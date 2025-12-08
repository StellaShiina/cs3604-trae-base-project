<template>
  <div class="payment-page">
    <TrainListTopBar 
      :isLoggedIn="isLoggedIn" 
      :username="username" 
      @my12306Click="handleMy12306Click" 
    />
    <MainNavigation
      :isLoggedIn="isLoggedIn"
      @loginClick="handleNavigateToLogin"
      @registerClick="handleNavigateToRegister"
      @personalCenterClick="handleNavigateToPersonalCenter"
    />

    <div v-if="isLoading" class="loading">加载中...</div>
    
    <div v-else-if="error && !paymentData" class="error-message">{{ error }}</div>

    <main v-else class="payment-main">
      <!-- 席位锁定时效倒计时区域 -->
      <PaymentCountdownTimer
        v-if="paymentData"
        :orderId="orderId"
        :initialTimeRemaining="paymentData.timeRemaining"
        @timeout="handleTimeout"
      />

      <!-- 订单信息与确认支付区（包含按钮和温馨提示） -->
      <OrderInfoDisplay
        v-if="paymentData"
        :trainInfo="paymentData.trainInfo"
        :passengers="paymentData.passengers"
        :totalPrice="paymentData.totalPrice"
        :isProcessing="isProcessing"
        @cancelOrder="showCancelModal = true"
        @confirmPayment="handleConfirmPayment"
      />

      <div v-if="error" class="error-message">{{ error }}</div>
    </main>

    <BottomNavigation />

    <!-- 取消订单确认弹窗 -->
    <CancelOrderModal
      :isVisible="showCancelModal"
      @confirm="handleCancelOrder"
      @cancel="showCancelModal = false"
    />

    <!-- 超时提示弹窗 -->
    <TimeoutModal
      :isVisible="showTimeoutModal"
      @confirm="handleTimeoutConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPaymentData, cancelOrder, confirmPayment } from '../api/order';
import TrainListTopBar from '../components/TrainListTopBar.vue';
import MainNavigation from '../components/MainNavigation.vue';
import BottomNavigation from '../components/BottomNavigation.vue';
import PaymentCountdownTimer from '../components/PaymentCountdownTimer.vue';
import OrderInfoDisplay from '../components/OrderInfoDisplay.vue';
import CancelOrderModal from '../components/CancelOrderModal.vue';
import TimeoutModal from '../components/TimeoutModal.vue';
import './Payment.css';

const route = useRoute();
const router = useRouter();
const orderId = computed(() => route.params.orderId as string);

const paymentData = ref<any>(null);
const isLoading = ref(true);
const error = ref('');
const isLoggedIn = ref(false);
const showCancelModal = ref(false);
const showTimeoutModal = ref(false);
const isProcessing = ref(false);

const username = computed(() => {
  if (!isLoggedIn.value) return '';
  return localStorage.getItem('username') || localStorage.getItem('userId') || '用户';
});

const checkLoginStatus = () => {
  const token = localStorage.getItem('authToken');
  isLoggedIn.value = !!token;
  if (!token) {
    router.push('/login');
  }
};

const fetchData = async () => {
  if (!orderId.value || !isLoggedIn.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    const response = await getPaymentData(orderId.value);
    paymentData.value = response;
  } catch (err: any) {
    if (err.response && err.response.status === 400 && err.response.data?.error?.includes('过期')) {
      showTimeoutModal.value = true;
      return;
    }
    error.value = err.message || '获取支付页面数据失败';
    console.error('加载支付页面数据失败:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkLoginStatus();
  fetchData();
  window.addEventListener('storage', checkLoginStatus);
});

// Watch for route changes to reload data if orderId changes
watch(orderId, () => {
  if (orderId.value) {
    fetchData();
  }
});

const handleCancelOrder = async () => {
  if (!orderId.value) return;

  isProcessing.value = true;
  try {
    await cancelOrder(orderId.value);
    // 取消成功，跳转到车次列表页
    router.push('/trains');
  } catch (err: any) {
    error.value = err.message || '取消订单失败';
    console.error('取消订单失败:', err);
  } finally {
    isProcessing.value = false;
    showCancelModal.value = false;
  }
};

const handleConfirmPayment = async () => {
  if (!orderId.value) return;

  isProcessing.value = true;
  try {
    await confirmPayment(orderId.value);
    // 支付成功，跳转到购票成功页
    router.push(`/purchase-success/${orderId.value}`);
  } catch (err: any) {
    if (err.response && err.response.status === 400 && err.response.data?.error?.includes('过期')) {
      showTimeoutModal.value = true;
      return;
    }
    error.value = err.message || '支付失败';
    console.error('支付失败:', err);
  } finally {
    isProcessing.value = false;
  }
};

const handleTimeout = () => {
  showTimeoutModal.value = true;
};

const handleTimeoutConfirm = () => {
  showTimeoutModal.value = false;
  router.push('/trains');
};

const handleNavigateToLogin = () => {
  router.push('/login');
};

const handleNavigateToRegister = () => {
  router.push('/register');
};

const handleNavigateToPersonalCenter = () => {
  if (isLoggedIn.value) {
    router.push('/personal-info');
  } else {
    router.push('/login');
  }
};

const handleMy12306Click = () => {
  if (isLoggedIn.value) {
    router.push('/personal-info');
  } else {
    router.push('/login');
  }
};
</script>
