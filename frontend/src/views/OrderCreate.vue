<template>
  <div class="order-page">
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
    
    <main class="order-main">
      <div v-if="isLoading" class="loading">加载中...</div>
      <div v-else-if="error" class="order-page-error-message">{{ error }}</div>
      <template v-else>
        <TrainInfoSection
          :trainInfo="trainInfo"
          :fareInfo="fareInfo"
          :availableSeats="availableSeats"
        />
        
        <PassengerInfoSection
          :passengers="passengers"
          :selectedPassengers="selectedPassengers"
          :availableSeatTypes="availableSeatTypes"
          :defaultSeatType="defaultSeatType"
          :purchaseInfo="purchaseInfo"
          :fareInfo="fareInfo"
          @passengerSelect="handlePassengerSelect"
          @searchPassenger="() => {}"
          @seatTypeChange="handleSeatTypeChange"
          @ticketTypeChange="handleTicketTypeChange"
          @deleteRow="handleDeleteRow"
        />
        
        <OrderSubmitSection
          :isSubmitting="isLoading"
          @submit="handleSubmit"
          @back="handleBack"
        />
        
        <WarmTipsSection @termsClick="() => {}" />
      </template>
    </main>
    
    <BottomNavigation />
    
    <OrderConfirmationModal
      v-if="showConfirmModal"
      :isVisible="showConfirmModal"
      :orderId="orderId"
      @close="showConfirmModal = false"
      @success="handleOrderSuccess"
    />
    
    <ConfirmModal
      :isVisible="showErrorModal"
      title="提示"
      :message="errorModalMessage"
      confirmText="确认"
      cancelText=""
      @confirm="showErrorModal = false"
      @cancel="showErrorModal = false"
    />
    
    <!-- Unpaid Order Modal -->
    <ConfirmModal
      :isVisible="showUnpaidOrderModal"
      title="提示"
      confirmText="确认"
      @confirm="handleUnpaidOrderConfirm"
      @cancel="showUnpaidOrderModal = false"
    >
      <span>
        您还有未处理的订单，请您到
        <a
          href="#"
          style="margin: 0 6px; color: #007bff; text-decoration: none;"
          @click.prevent="handleNavigateToUnpaid"
        >
          未完成订单
        </a>
        进行处理！
      </span>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TrainListTopBar from '../components/TrainListTopBar.vue';
import MainNavigation from '../components/MainNavigation.vue';
import TrainInfoSection from '../components/TrainInfoSection.vue';
import PassengerInfoSection from '../components/PassengerInfoSection.vue';
import OrderSubmitSection from '../components/OrderSubmitSection.vue';
import WarmTipsSection from '../components/WarmTipsSection.vue';
import BottomNavigation from '../components/BottomNavigation.vue';
import OrderConfirmationModal from '../components/OrderConfirmationModal.vue';
import ConfirmModal from '../components/ConfirmModal.vue';
import { getCityByStation } from '../api/station';
import { submitOrder, getOrderPageData } from '../api/order';

const route = useRoute();
const router = useRouter();

// State
const trainInfo = ref<any>(null);
const fareInfo = ref<any>(null);
const availableSeats = ref<any>(null);
const passengers = ref<any[]>([]);
const selectedPassengers = ref<string[]>([]);
const purchaseInfo = ref<any[]>([]);
const defaultSeatType = ref<string>('');
const isLoading = ref(false);
const error = ref('');
const showConfirmModal = ref(false);
const orderId = ref('');
const isLoggedIn = ref(false);
const showErrorModal = ref(false);
const errorModalMessage = ref('');
const showUnpaidOrderModal = ref(false);
const routeParams = ref({
  trainNo: '',
  departureStation: '',
  arrivalStation: '',
  departureDate: ''
});

// Computed properties
const availableSeatTypes = computed(() => {
  return fareInfo.value ? Object.keys(fareInfo.value).filter(key => fareInfo.value[key].available > 0) : [];
});

const username = computed(() => {
  return isLoggedIn.value ? (localStorage.getItem('username') || localStorage.getItem('userId') || '用户') : '';
});

// Check login status
const checkLoginStatus = () => {
  isLoggedIn.value = !!localStorage.getItem('authToken');
};

// Lifecycle
onMounted(() => {
  checkLoginStatus();
  window.addEventListener('storage', checkLoginStatus);

  const { trainNo, departureStation, arrivalStation, departureDate } = history.state || route.query;
  
  if (trainNo && departureStation && arrivalStation && departureDate) {
    routeParams.value = {
      trainNo: trainNo as string,
      departureStation: departureStation as string,
      arrivalStation: arrivalStation as string,
      departureDate: departureDate as string
    };
    fetchOrderPageData(trainNo as string, departureStation as string, arrivalStation as string, departureDate as string);
  } else {
    // Try to get from route query if not in history state
    const { trainNo: qTrainNo, departureStation: qFrom, arrivalStation: qTo, departureDate: qDate } = route.query;
    if (qTrainNo && qFrom && qTo && qDate) {
      routeParams.value = {
        trainNo: qTrainNo as string,
        departureStation: qFrom as string,
        arrivalStation: qTo as string,
        departureDate: qDate as string
      };
      fetchOrderPageData(qTrainNo as string, qFrom as string, qTo as string, qDate as string);
    } else {
      error.value = '缺少必要的车次信息';
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('storage', checkLoginStatus);
});

// Fetch data
const fetchOrderPageData = async (trainNo: string, departureStation: string, arrivalStation: string, departureDate: string) => {
  isLoading.value = true;
  error.value = '';
  
  try {
      // Note: getOrderPageData needs to be implemented in api/order.ts to match /api/orders/new
      // Assuming getOrderPageData accepts params object
      const params = {
        trainNo,
        departureStation,
        arrivalStation,
        departureDate,
      };

    console.log('Fetching order page data with params:', params);

    const response: any = await getOrderPageData(params);
    // Note: existing request utility usually returns response.data directly or throws error
    // If response structure matches reference:
    // { trainInfo, fareInfo, availableSeats, passengers, defaultSeatType }
    
    // Need to handle different response structures if my mock/backend is different
    // For now assume it matches reference expectations
    
    // Wait, request utility usually returns data. If status is error, it throws.
    // However, reference handled 401 and 403 manually.
    // My request utility probably intercepts 401.
    // If I need to handle 403 for unpaid orders specifically, I might need to catch it.
    
    trainInfo.value = response.trainInfo;
    fareInfo.value = response.fareInfo;
    availableSeats.value = response.availableSeats;
    passengers.value = response.passengers || [];
    defaultSeatType.value = response.defaultSeatType;
    
    // Initialize purchase info (empty row logic is in React, but here purchaseInfo starts empty)
    // React: setPurchaseInfo([]) - effectively empty.
    purchaseInfo.value = [];
    
  } catch (err: any) {
    console.error('Error fetching order page data:', err);
    if (err.response?.status === 401) {
      error.value = '请先登录';
      router.push('/login');
      return;
    }
    if (err.response?.status === 403 && err.response?.data?.hasUnpaidOrder) {
      showUnpaidOrderModal.value = true;
      return;
    }
    error.value = err.response?.data?.error || err.message || '加载订单页失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

// Event Handlers
const handlePassengerSelect = (passengerId: string, selected: boolean) => {
  const passenger = passengers.value.find(p => p.id === passengerId);
  if (!passenger) return;
  
  if (selected) {
    // Add
    selectedPassengers.value.push(passengerId);
    purchaseInfo.value.push({
      passenger: passenger,
      ticketType: '成人票',
      seatType: defaultSeatType.value,
    });
  } else {
    // Remove
    selectedPassengers.value = selectedPassengers.value.filter(id => id !== passengerId);
    purchaseInfo.value = purchaseInfo.value.filter(info => info.passenger.id !== passengerId);
  }
};

const handleSeatTypeChange = (index: number, seatType: string) => {
  if (index >= 0 && index < purchaseInfo.value.length) {
    purchaseInfo.value[index].seatType = seatType;
  }
};

const handleTicketTypeChange = (index: number, ticketType: string) => {
  if (index >= 0 && index < purchaseInfo.value.length) {
    purchaseInfo.value[index].ticketType = ticketType;
  }
};

const handleDeleteRow = (index: number) => {
  if (index >= 0 && index < purchaseInfo.value.length) {
    const deletedInfo = purchaseInfo.value[index];
    purchaseInfo.value.splice(index, 1);
    selectedPassengers.value = selectedPassengers.value.filter(id => id !== deletedInfo.passenger.id);
  }
};

const handleBack = async () => {
  if (trainInfo.value) {
    const departureCity = await getCityByStation(trainInfo.value.departureStation) || trainInfo.value.departureStation;
    const arrivalCity = await getCityByStation(trainInfo.value.arrivalStation) || trainInfo.value.arrivalStation;
    
    router.push({
      path: '/trains',
      state: {
        departureStation: departureCity,
        arrivalStation: arrivalCity,
        departureDate: trainInfo.value.departureDate
      }
    });
  } else {
    router.back();
  }
};

const handleSubmit = async () => {
  if (selectedPassengers.value.length === 0) {
    errorModalMessage.value = '请选择乘车人！';
    showErrorModal.value = true;
    return;
  }
  
  isLoading.value = true;
  error.value = '';
  
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      error.value = '请先登录';
      router.push('/login');
      return;
    }
    
    const passengersData = purchaseInfo.value.map(info => ({
      passengerId: info.passenger.id,
      ticketType: info.ticketType,
      seatType: info.seatType,
    }));
    
    const payload = {
      trainNo: trainInfo.value.trainNo,
      departureStation: trainInfo.value.departureStation,
      arrivalStation: trainInfo.value.arrivalStation,
      departureDate: trainInfo.value.departureDate,
      passengers: passengersData,
    };
    
    const response: any = await submitOrder(payload);
    
    // Check for success (request utility usually returns data on success)
    if (response && response.orderId) {
      orderId.value = response.orderId;
      showConfirmModal.value = true;
    } else {
      throw new Error('提交订单失败');
    }
    
  } catch (err: any) {
    const errorMessage = err.message || '网络忙，请稍后再试。';
    
    if (errorMessage === '手慢了，该车次车票已售罄！') {
      errorModalMessage.value = errorMessage;
      showErrorModal.value = true;
      setTimeout(() => {
        showErrorModal.value = false;
        router.push('/trains');
      }, 1500);
      return;
    }
    
    errorModalMessage.value = errorMessage;
    showErrorModal.value = true;
  } finally {
    isLoading.value = false;
  }
};

const handleOrderSuccess = () => {
  showConfirmModal.value = false;
  router.push('/');
};

const handleNavigateToLogin = () => router.push('/login');
const handleNavigateToRegister = () => router.push('/register');
const handleNavigateToPersonalCenter = () => {
  if (isLoggedIn.value) router.push('/personal-info');
  else router.push('/login');
};
const handleMy12306Click = handleNavigateToPersonalCenter;

const handleNavigateToUnpaid = () => {
  showUnpaidOrderModal.value = false;
  router.push({
    path: '/personal-info',
    state: { defaultTab: 'order', defaultSubTab: 'pending' }
  });
};

const handleUnpaidOrderConfirm = async () => {
  showUnpaidOrderModal.value = false;
  
  const departureCity = await getCityByStation(routeParams.value.departureStation) || routeParams.value.departureStation;
  const arrivalCity = await getCityByStation(routeParams.value.arrivalStation) || routeParams.value.arrivalStation;
  
  router.push({
    path: '/trains',
    state: {
      departureStation: departureCity,
      arrivalStation: arrivalCity,
      departureDate: routeParams.value.departureDate
    }
  });
};

</script>

<style>
@import './OrderCreate.css';
</style>
