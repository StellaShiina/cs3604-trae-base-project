<template>
  <div class="successful-purchase-page">
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
    
    <div v-else-if="error && !orderData" class="error-message">{{ error }}</div>

    <main v-else class="successful-purchase-main">
      <!-- 成功提示区域 -->
      <SuccessBanner
        v-if="orderData"
        :orderNumber="orderData.orderNumber"
        :passengers="orderData.passengers"
      />

      <!-- 订单信息区（包含所有内容） -->
      <SuccessOrderInfo
        v-if="orderData"
        :trainInfo="orderData.trainInfo"
        :passengers="orderData.passengers"
        :totalPrice="orderData.totalPrice"
        @foodClick="handleFoodClick"
        @continuePurchase="handleContinuePurchase"
        @viewDetails="handleViewOrderDetails"
      />
    </main>

    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOrderConfirmation } from '../api/order';
import TrainListTopBar from '../components/TrainListTopBar.vue';
import MainNavigation from '../components/MainNavigation.vue';
import BottomNavigation from '../components/BottomNavigation.vue';
import SuccessBanner from '../components/SuccessBanner.vue';
import SuccessOrderInfo from '../components/SuccessOrderInfo.vue';
import './SuccessfulPurchase.css';

const route = useRoute();
const router = useRouter();
const orderId = computed(() => route.params.orderId as string);

const orderData = ref<any>(null);
const isLoading = ref(true);
const error = ref('');
const isLoggedIn = ref(false);

const username = computed(() => {
  if (!isLoggedIn.value) return '';
  return localStorage.getItem('username') || localStorage.getItem('userId') || '用户';
});

const checkLoginStatus = () => {
  const token = localStorage.getItem('authToken');
  isLoggedIn.value = !!token;
};

const fetchData = async () => {
  if (!orderId.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    const response = await getOrderConfirmation(orderId.value);
    // Ensure response is valid (axios interceptor might return data directly)
    const detailData = response as any; 
    
    // 生成订单号（EA + 8位字符）
    const orderNumber = 'EA' + orderId.value.substring(0, 8).toUpperCase().replace(/-/g, '');
    
    // 构造成功页数据
    orderData.value = {
      orderNumber,
      trainInfo: detailData.trainInfo,
      passengers: detailData.passengers.map((p: any) => ({
        sequence: p.sequence,
        name: p.name,
        idCardType: p.idCardType,
        idCardNumber: p.idCardNumber,
        ticketType: p.ticketType,
        seatType: p.seatType,
        carNumber: p.carNumber,
        seatNumber: p.seatNumber,
        price: p.price || 0
      })),
      totalPrice: detailData.totalPrice
    };
  } catch (err: any) {
    error.value = err.message || '加载失败';
    console.error('加载订单数据失败:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkLoginStatus();
  fetchData();
  window.addEventListener('storage', checkLoginStatus);
});

watch(orderId, () => {
  if (orderId.value) {
    fetchData();
  }
});

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

const handleContinuePurchase = () => {
  router.push('/trains');
};

const handleViewOrderDetails = () => {
  // Pass orderId via query or params depending on OrderList implementation
  // Reference says: navigate('/orders', { state: { orderId } });
  // Vue Router doesn't support state in the same way for history, usually query or params.
  // Assuming /orders is a list page, maybe filter by ID?
  // Or navigate to /personal-info which has order history?
  // I'll push to /orders for now.
  router.push('/orders');
};

const handleFoodClick = () => {
  // 餐饮特产功能
  console.log('餐饮特产功能待实现');
};
</script>
