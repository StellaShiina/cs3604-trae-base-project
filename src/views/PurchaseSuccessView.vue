<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopHeader from '@/components/Common/TopHeader.vue'
import MainNavigation from '@/components/Common/MainNavigation.vue'
import { getPaymentInfo } from '@/api/order'

const route = useRoute()
const router = useRouter()
const orderId = route.params.orderId as string
const orderData = ref<any>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const res = await getPaymentInfo(orderId)
    orderData.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})

const goHome = () => router.push('/')
const goOrders = () => router.push('/personal-center')
</script>

<template>
  <div class="purchase-success">
    <TopHeader />
    <MainNavigation />
    <div class="content">
      <div class="banner">
        <h2>🎉 订票成功！</h2>
        <p>您的订单已支付成功，祝您旅途愉快！</p>
      </div>
      
      <div class="actions">
        <button @click="goOrders" class="btn primary">查看订单</button>
        <button @click="goHome" class="btn">返回首页</button>
      </div>
      
      <div v-if="orderData" class="details">
         <h3>订单详情</h3>
         <div class="info-row">
           <span class="label">订单号：</span>
           <span class="value">{{ orderId }}</span>
         </div>
         <div class="info-row" v-if="orderData.trainInfo">
           <span class="label">车次信息：</span>
           <span class="value">
             {{ orderData.trainInfo.departureDate }} {{ orderData.trainInfo.trainNo }}次 
             {{ orderData.trainInfo.departureStation }} -> {{ orderData.trainInfo.arrivalStation }}
           </span>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content { width: 1200px; margin: 40px auto; text-align: center; }
.banner { background: #f0f9eb; padding: 40px; border-radius: 8px; color: #67c23a; margin-bottom: 30px; border: 1px solid #e1f3d8; }
.banner h2 { margin: 0 0 10px; font-size: 30px; }
.actions button { margin: 0 10px; padding: 10px 25px; cursor: pointer; border-radius: 4px; font-size: 16px; }
.btn { background: #fff; border: 1px solid #dcdfe6; color: #606266; }
.btn:hover { color: #409eff; border-color: #c6e2ff; background-color: #ecf5ff; }
.btn.primary { background: #409eff; border-color: #409eff; color: #fff; }
.btn.primary:hover { background: #66b1ff; border-color: #66b1ff; }
.details { margin-top: 30px; text-align: left; background: #fff; padding: 30px; border: 1px solid #eee; border-radius: 4px; }
.details h3 { border-left: 4px solid #409eff; padding-left: 10px; margin-top: 0; }
.info-row { margin-bottom: 10px; font-size: 14px; }
.info-row .label { color: #999; width: 100px; display: inline-block; }
</style>
