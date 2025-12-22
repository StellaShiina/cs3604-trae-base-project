<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login, verifyLogin } from '@/api/auth'
import LoginBox from './LoginBox.vue'
import SmsModal from './SmsModal.vue'

const props = defineProps<{
  isVisible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

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
      
      // Show SMS modal to collect ID card last 4 digits and send SMS
      showSmsModal.value = true
      // Hide the login modal content visually or keep it? 
      // Since SmsModal has a backdrop, it will cover this modal. 
      // But having two backdrops might look dark.
      // However, for simplicity, let's keep it.
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
      
      smsSuccess.value = '登录成功！'
      setTimeout(() => {
        showSmsModal.value = false
        emit('success')
        emit('close')
      }, 1000)
    }
  } catch (err: any) {
    console.error('Verify error:', err)
    smsError.value = err.response?.data?.error || '验证失败'
  }
}

const handleQrLogin = () => {
  // Placeholder for QR login logic
  console.log('QR Login requested')
}

const handleRegister = () => {
  emit('close')
  router.push('/register')
}

const handleForgotPassword = () => {
  emit('close')
  router.push('/forgot-password')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="login-modal-backdrop">
      <div class="login-modal-card">
        <div class="modal-header">
          <span class="title">您尚未登录</span>
          <button class="close-btn" @click="emit('close')">&times;</button>
        </div>
        
        <div class="modal-body">
          <LoginBox 
            :is-loading="isLoading"
            :error="error"
            @submit="handleLoginSubmit"
            @qrLogin="handleQrLogin"
            @register="handleRegister"
            @forgot-password="handleForgotPassword"
          />
        </div>
      </div>
      
      <!-- SmsModal is already teleported or fixed position? 
           SmsModal in source code has .modal-backdrop { position: fixed ... }
           It does NOT use Teleport in the source I read, so it will be rendered inside this div.
           Since this div has fixed position, SmsModal will be fixed relative to viewport if it uses fixed.
           Let's check SmsModal again. It uses fixed position.
           It should work fine.
      -->
      <SmsModal 
        v-if="showSmsModal"
        :session-id="sessionId"
        :external-error="smsError"
        :external-success="smsSuccess"
        @close="showSmsModal = false"
        @submit="handleSmsSubmit"
      />
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.login-modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* High z-index to be on top of everything */
}

.login-modal-card {
  background: #ffffff;
  border-radius: 4px;
  width: 440px; /* Slightly wider than LoginBox (400px) */
  max-width: 95%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: fadeIn 0.3s ease;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #eee;
  
  .title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: #999;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    
    &:hover {
      color: #333;
    }
  }
}

.modal-body {
  padding: 0; /* LoginBox has its own padding */
  display: flex;
  justify-content: center;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
