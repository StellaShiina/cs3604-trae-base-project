<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getPaymentInfo, cancelOrder, payOrder } from '@/api/order'
import TopHeader from '@/components/Common/TopHeader.vue'
import MainNavigation from '@/components/Common/MainNavigation.vue'
import PaymentCountdownTimer from '@/components/Payment/PaymentCountdownTimer.vue'
import OrderInfoDisplay from '@/components/Payment/OrderInfoDisplay.vue'
import ConfirmModal from '@/components/Train/ConfirmModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const orderId = route.params.orderId as string
const paymentData = ref<any>(null)
const isLoading = ref(true)
const error = ref('')
const isProcessing = ref(false)
const showCancelModal = ref(false)
const showTimeoutModal = ref(false)

const loadPaymentData = async () => {
  if (!orderId) return
  isLoading.value = true
  error.value = ''
  try {
    const res = await getPaymentInfo(orderId)
    paymentData.value = res.data
  } catch (err: any) {
    if (err.response?.status === 401) {
      authStore.logout()
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      })
      return
    }
    if (err.response?.status === 400 && err.response?.data?.error?.includes('过期')) {
      showTimeoutModal.value = true
    } else {
      error.value = err.response?.data?.error || '加载支付页面数据失败'
    }
  } finally {
    isLoading.value = false
  }
}

const handleTimeout = () => {
  showTimeoutModal.value = true
}

const handleTimeoutConfirm = () => {
  showTimeoutModal.value = false
  router.push('/train-list')
}

const handleCancelOrder = async () => {
  if (!orderId) return
  isProcessing.value = true
  try {
    await cancelOrder(orderId)
    router.push('/train-list')
  } catch (err: any) {
    if (err.response?.status === 401) {
      authStore.logout()
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      })
      return
    }
    alert(err.response?.data?.error || '取消订单失败')
  } finally {
    isProcessing.value = false
    showCancelModal.value = false
  }
}

const handleConfirmPayment = async () => {
  if (!orderId) return
  isProcessing.value = true
  try {
    await payOrder(orderId)
    router.push(`/purchase-success/${orderId}`)
  } catch (err: any) {
    if (err.response?.status === 401) {
      authStore.logout()
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      })
      return
    }
    if (err.response?.status === 400 && err.response?.data?.error?.includes('过期')) {
      showTimeoutModal.value = true
    } else {
      alert(err.response?.data?.error || '支付失败')
    }
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  loadPaymentData()
})
</script>

<template>
  <div class="payment-page">
    <TopHeader />
    <MainNavigation />
    
    <main class="main-content">
      <div v-if="isLoading" class="loading">加载中...</div>
      
      <div v-else-if="error" class="error-message">{{ error }}</div>
      
      <template v-else-if="paymentData">
        <PaymentCountdownTimer 
          :orderId="orderId"
          :initialTimeRemaining="paymentData.timeRemaining"
          @timeout="handleTimeout"
        />
        
        <OrderInfoDisplay 
          :trainInfo="paymentData.trainInfo"
          :passengers="paymentData.passengers"
          :totalPrice="paymentData.totalPrice"
          :isProcessing="isProcessing"
          @cancelOrder="showCancelModal = true"
          @confirmPayment="handleConfirmPayment"
        />
      </template>
    </main>
    
    <ConfirmModal 
      :isVisible="showCancelModal"
      title="取消订单"
      message="您确定要取消该订单吗？取消后将无法恢复。"
      confirmText="确定取消"
      cancelText="暂不取消"
      :onConfirm="handleCancelOrder"
      :onCancel="() => showCancelModal = false"
    />
    
    <ConfirmModal
      :isVisible="showTimeoutModal"
      title="订单已过期"
      message="您的订单已超过支付时限，已被自动取消。请重新预订。"
      confirmText="确定"
      :onConfirm="handleTimeoutConfirm"
      :onCancel="() => {}"
    />
  </div>
</template>

<style scoped lang="scss">
.payment-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.main-content {
  width: 1200px;
  margin: 20px auto;
  padding-bottom: 50px;
}

.loading, .error-message {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.error-message {
  color: #f56c6c;
}
</style>
