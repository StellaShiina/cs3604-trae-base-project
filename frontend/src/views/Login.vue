<template>
  <div class="login-page">
    <TopNavigation @logoClick="handleNavigateToHome" :showWelcomeLogin="true" />
    
    <div class="login-content">
      <div class="login-promotion">
        <h1 class="promotion-title">
          铁路12306 - 中国铁路官方APP
        </h1>
        <h2 class="promotion-subtitle">
          尽享精彩出行服务
        </h2>
        
        <ul class="promotion-features">
          <li>个人行程提醒</li>
          <li>积分兑换</li>
          <li>餐饮·特产</li>
          <li>车站大屏</li>
        </ul>
        
        <div class="app-download">
          <div class="qr-code-section">
            <img src="/images/铁路12306二维码.png" alt="铁路12306二维码" />
            <div class="qr-code-text">
              扫描左侧二维码<br />
              安装 铁路12306
            </div>
          </div>
        </div>
      </div>
      
      <div class="login-form-container">
        <LoginForm
          :is-loading="isLoading"
          :error="error"
          @submit="handleLoginSubmit"
          @qr-login="handleQrLogin"
          @register-click="handleNavigateToRegister"
          @forgot-password-click="handleNavigateToForgotPassword"
        />
      </div>
    </div>
    
    <BottomNavigation />
    
    <SmsVerificationModal
      v-if="showSmsModal && sessionId"
      :session-id="sessionId"
      :external-error="smsError"
      :external-success="smsSuccess"
      @close="handleCloseSmsModal"
      @submit="handleSmsVerificationSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { login, verifyLogin } from '../api/auth'
import TopNavigation from '../components/TopNavigation.vue'
import BottomNavigation from '../components/BottomNavigation.vue'
import LoginForm from '../components/LoginForm.vue'
import SmsVerificationModal from '../components/SmsVerificationModal.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isLoading = ref(false)
const error = ref('')
const showSmsModal = ref(false)
const sessionId = ref('')
const smsError = ref('')
const smsSuccess = ref('')

const handleNavigateToHome = () => {
  router.push('/')
}

const handleNavigateToRegister = () => {
  router.push('/register')
}

const handleNavigateToForgotPassword = () => {
  router.push('/forgot-password')
}

const handleQrLogin = () => {
  console.log('QR login clicked')
}

const handleLoginSubmit = async (data: { identifier: string; password: string }) => {
  isLoading.value = true
  error.value = ''
  
  try {
    const res: any = await login(data)
    
    if (res.success) {
      // Save sessionId and show verification modal
      sessionId.value = res.sessionId
      showSmsModal.value = true
      console.log('Login data:', res.sessionId)
    } else {
       error.value = res.error || '登录失败，请重试'
    }
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.response?.data?.error || '登录失败，请重试'
  } finally {
    isLoading.value = false
  }
}

const handleCloseSmsModal = () => {
  showSmsModal.value = false
  smsError.value = ''
  smsSuccess.value = ''
}

const handleSmsVerificationSubmit = async (data: { idCardLast4: string; code: string }) => {
  smsError.value = ''
  smsSuccess.value = ''
  
  try {
    // Verify Login with SMS code
    const response: any = await verifyLogin({
      sessionId: sessionId.value,
      idCardLast4: data.idCardLast4,
      verificationCode: data.code
    })
    
    if (response.success || response.token) {
      console.log('SMS verification success:', response)
      
      // Save token to localStorage
      const token = response.token
      if (token) {
        localStorage.setItem('authToken', token)
        localStorage.setItem('userId', response.user?.id || response.userId || '')
        localStorage.setItem('username', response.user?.name || response.user?.username || '')
        
        // Also update user store if available
        if (response.user) {
           userStore.setUser(response.user)
        }
      }
      
      smsSuccess.value = '登录成功！正在跳转...'
      
      setTimeout(() => {
        showSmsModal.value = false
        const redirect = route.query.redirect as string
        router.push(redirect || '/')
      }, 2000)
    } else {
        smsError.value = response.error || '验证失败，请重试'
    }
    
  } catch (err: any) {
    console.error('SMS verification error:', err)
    console.log('错误响应数据:', err.response?.data)
    smsError.value = err.response?.data?.error || '验证失败，请重试'
  }
}
</script>

<style>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.login-content {
  flex: 1;
  display: flex;
  align-items: stretch;
  min-height: 500px;
  background-image: url('/images/登录页-背景-新.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  justify-content: center; /* Center content if needed, or stick to reference layout */
}

/* Reference layout adjustments */
.login-content {
  position: relative;
}

.login-promotion {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 60px 80px;
  color: white;
}

.promotion-title {
  font-size: 32px;
  margin-bottom: 20px;
  font-weight: bold;
}

.promotion-subtitle {
  font-size: 24px;
  margin-bottom: 40px;
  font-weight: normal;
}

.promotion-features {
  list-style: none;
  padding: 0;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.promotion-features li {
  font-size: 18px;
  display: flex;
  align-items: center;
}

.promotion-features li::before {
  content: '•';
  margin-right: 10px;
  color: #fff;
}

.app-download {
  background: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  color: #333;
  display: block;
}

.qr-code-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.qr-code-section img {
  width: 100px;
  height: 100px;
}

.qr-code-text {
  font-size: 14px;
  line-height: 1.5;
}

.login-form-container {
  /* Aligned with reference CSS from LoginPage.css */
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 40px 40px 40px 0;
  /* width: 300px; in reference css it was 300px but LoginForm.css override it to 400px! */
  /* We should let LoginForm handle its width or constrain it here */
  width: auto;
  align-self: center;
  margin-right: 15%; /* Approximate positioning based on visual */
}

/* Override styles to match reference specific layout */
@media (max-width: 768px) {
  .login-content {
    padding: 20px 10px;
    flex-direction: column;
    align-items: center;
  }
  
  .login-form-container {
    margin: 20px 0;
  }
  
  .login-promotion {
    display: none;
  }
}
</style>
