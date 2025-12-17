<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login, verifyLogin, sendSms } from '@/api/auth'
import TopHeader from '@/components/Common/TopHeader.vue'
import BottomFooter from '@/components/Common/BottomFooter.vue'
import LoginBox from '@/components/Auth/LoginBox.vue'
import SmsModal from '@/components/Auth/SmsModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)
const error = ref('')
const showSmsModal = ref(false)
const sessionId = ref('')
const smsError = ref('')
const smsSuccess = ref('')

const handleLoginSubmit = async (data: { identifier: string; password: string }) => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await login(data)
    if (response.data.success) {
      sessionId.value = response.data.sessionId
      
      // Send SMS code
      await sendSms({ sessionId: sessionId.value })
      
      showSmsModal.value = true
      console.log('Login session:', sessionId.value)
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.response?.data?.error || '登录失败，请重试'
  } finally {
    isLoading.value = false
  }
}

const handleSmsSubmit = async (data: { idCardLast4: string; code: string }) => {
  smsError.value = ''
  smsSuccess.value = ''
  
  try {
    const response = await verifyLogin({
      sessionId: sessionId.value,
      idCardLast4: data.idCardLast4,
      verificationCode: data.code
    })
    
    if (response.data.success || response.data.token) {
      console.log('SMS verified:', response.data)
      const token = response.data.token
      if (token) {
        const user = response.data.user || {
          id: response.data.userId,
          name: response.data.username || '用户'
        }
        authStore.login(token, user)
      }
      
      smsSuccess.value = '登录成功！正在跳转...'
      setTimeout(() => {
        showSmsModal.value = false
        router.push('/')
      }, 2000)
    }
  } catch (err: any) {
    console.error('Verify error:', err)
    smsError.value = err.response?.data?.error || '验证失败'
  }
}
</script>

<template>
  <div class="page-container">
    <TopHeader :show-welcome-login="true" />
    
    <div class="main-content">
      <div class="login-wrapper">
        <LoginBox 
          :is-loading="isLoading"
          :error="error"
          @submit="handleLoginSubmit"
          @register="router.push('/register')"
          @forgot-password="router.push('/forgot-password')"
        />
      </div>
    </div>
    
    <BottomFooter />
    
    <SmsModal 
      v-if="showSmsModal"
      :session-id="sessionId"
      :external-error="smsError"
      :external-success="smsSuccess"
      @close="showSmsModal = false"
      @submit="handleSmsSubmit"
    />
  </div>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  position: relative;
  background-color: #f8f9fa;
  /* Use the exact image path from public folder */
  background-image: url('/images/登录页-背景-新.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-wrapper {
  width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  justify-content: flex-end; 
  align-items: center;
  padding-right: 100px; 
}

@media (max-width: 1200px) {
  .login-wrapper {
    width: 100%;
    justify-content: center;
    padding-right: 0;
  }
}
</style>
