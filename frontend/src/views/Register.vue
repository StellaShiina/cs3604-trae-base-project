<template>
  <div class="register-page">
    <TrainListTopBar 
      :isLoggedIn="userStore.isLoggedIn" 
      :username="userStore.username" 
      @my12306Click="handleMy12306Click"
      @logout="handleLogout"
    />
    <MainNavigation />
    
    <main class="register-main">
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        您现在的位置：<router-link to="/">客运首页</router-link>
        <span class="breadcrumb-separator">&gt;</span>
        <span>注册</span>
      </div>

      <!-- 注册表单容器 -->
      <div class="register-container">
        <!-- 页面标题 -->
        <div class="register-header">账户信息</div>
        
        <!-- 表单内容 -->
        <div class="register-content">
          <RegisterForm 
            @submit="handleSubmit"
            @navigate-to-login="handleNavigateToLogin"
          />
        </div>
      </div>
    </main>
    
    <BottomNavigation />

    <!-- 验证弹窗 -->
    <RegistrationVerificationModal
      v-if="showVerificationModal"
      :phone-number="registrationData?.phone || ''"
      :is-success="isRegistrationSuccess"
      :success-message="'恭喜您注册成功！正在跳转登录页...'"
      :external-error="verificationError"
      @close="handleVerificationClose"
      @complete="handleVerificationComplete"
      @back="handleVerificationBack"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { startRegistration, sendRegisterVerificationCode, completeRegistration } from '../api/register'
import TrainListTopBar from '../components/TrainListTopBar.vue'
import MainNavigation from '../components/MainNavigation.vue'
import BottomNavigation from '../components/BottomNavigation.vue'
import RegisterForm from '../components/RegisterForm.vue'
import RegistrationVerificationModal from '../components/RegistrationVerificationModal.vue'
import './Register.css'

const router = useRouter()
const userStore = useUserStore()

// State
const showVerificationModal = ref(false)
const isRegistrationSuccess = ref(false)
const verificationError = ref('')
const registrationData = ref<any>(null)
const sessionId = ref('')

// Check login status on mount (though TrainListTopBar handles this via props, we might want to know for other logic)
onMounted(() => {
  // Logic to check login status if needed, but userStore handles it.
})

// Handlers
const handleMy12306Click = () => {
  if (userStore.isLoggedIn) {
    router.push('/personal-info')
  } else {
    router.push('/login')
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const handleNavigateToLogin = () => {
  router.push('/login')
}

const handleSubmit = async (formData: any) => {
  console.log('Registration submitted:', formData)
  
  try {
    // 1. Start Registration to get session ID
    const res = await startRegistration(formData)
    const sid = res.sessionId
    
    if (!sid) {
      alert('注册失败：未获取到会话ID')
      return
    }
    
    // Save data and session ID
    registrationData.value = { ...formData, sessionId: sid }
    sessionId.value = sid

    // 2. Send SMS verification code
    try {
      const smsRes = await sendRegisterVerificationCode({ 
        sessionId: sid,
        phone: formData.phone 
      })
      
      // Get real code (Dev environment)
      const realCode = smsRes.verificationCode
      if (realCode) {
        console.log(`\n=================================`)
        console.log(`📱 注册验证码`)
        console.log(`手机号: ${formData.phone}`)
        console.log(`验证码: ${realCode}`)
        console.log(`有效期: 5分钟`)
        console.log(`=================================\n`)
      }
      
      showVerificationModal.value = true
      verificationError.value = ''
    } catch (verifyError: any) {
      console.error('Send verification code error:', verifyError)
      alert(verifyError.response?.data?.error || '发送验证码失败')
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    if (error.response?.data?.error) {
      alert(error.response.data.error)
    } else {
      alert('注册失败，请稍后重试')
    }
  }
}

const handleVerificationComplete = async (code: string) => {
  if (!registrationData.value) {
    verificationError.value = '注册信息丢失，请重新注册'
    return
  }
  
  const sid = registrationData.value.sessionId
  if (!sid) {
    verificationError.value = '会话信息丢失，请重新注册'
    return
  }
  
  try {
    verificationError.value = ''
    
    // 3. Complete Registration with verification code
    await completeRegistration({ 
      sessionId: sid, 
      smsCode: code 
    })
    
    // 4. Show success state
    isRegistrationSuccess.value = true
    
    // 5. Redirect after delay
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    
  } catch (error: any) {
    console.error('Verification error:', error)
    if (error.response?.data?.error) {
      verificationError.value = error.response.data.error
    } else {
      verificationError.value = '验证失败，请重试'
    }
  }
}

const handleVerificationBack = () => {
  showVerificationModal.value = false
  isRegistrationSuccess.value = false
  verificationError.value = ''
}

const handleVerificationClose = () => {
  if (isRegistrationSuccess.value) {
    showVerificationModal.value = false
    isRegistrationSuccess.value = false
    registrationData.value = null
    verificationError.value = ''
    return
  }
  
  if (confirm('确定要关闭验证弹窗吗？关闭后需要重新提交注册信息。')) {
    showVerificationModal.value = false
    registrationData.value = null
    verificationError.value = ''
  }
}
</script>
