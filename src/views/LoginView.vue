<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { login } from '../services/authService'
import LoginVerificationModal from '../components/LoginVerificationModal.vue'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  identifier: '',
  password: ''
})

const errorMsg = ref('')
const showModal = ref(false)
const currentUserInfo = ref<{ id_no?: string; mobile?: string } | null>(null)

// Regex patterns
const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{5,29}$/ // Starts with letter, 6-30 chars
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const mobileRegex = /^1[3-9]\d{9}$/

const validateForm = (): boolean => {
  errorMsg.value = ''
  
  if (!form.identifier) {
    errorMsg.value = '请输入用户名！'
    return false
  }
  
  if (!form.password) {
    errorMsg.value = '请输入密码！'
    return false
  }
  
  if (form.password.length < 6) {
    errorMsg.value = '密码长度不能少于6位！'
    return false
  }

  // Check identifier format (Username OR Email OR Mobile)
  const isUsername = usernameRegex.test(form.identifier)
  const isEmail = emailRegex.test(form.identifier)
  const isMobile = mobileRegex.test(form.identifier)

  if (!isUsername && !isEmail && !isMobile) {
    errorMsg.value = '用户名或密码错误！'
    form.password = ''
    return false
  }

  return true
}

const handleLogin = async () => {
  if (!validateForm()) return

  try {
    const response = await login(form.identifier, form.password)
    // Login successful (Credentials valid)
    // Store user info temporarily
    userStore.setUser(response.user)
    currentUserInfo.value = response.user

    // Trigger SMS Verification Modal
    showModal.value = true
  } catch (error: any) {
    console.error('Login failed', error)
    errorMsg.value = '用户名或密码错误！'
    form.password = ''
  }
}

const onVerificationSuccess = () => {
  showModal.value = false
  // Redirect to home/dashboard
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Top Navigation -->
    <header class="bg-white shadow-sm">
      <div class="container mx-auto px-4 h-20 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <!-- Logo Placeholder -->
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">Logo</div>
            <div class="flex flex-col">
              <span class="text-black font-bold text-lg leading-none">中国铁路12306</span>
              <span class="text-gray-400 text-sm leading-none">12306 CHINA RAILWAY</span>
            </div>
          </div>
          <div class="h-8 w-px bg-gray-300 mx-4"></div>
          <span class="text-xl text-black font-medium">欢迎登录12306</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative bg-blue-50">
      <!-- Promotion Background Placeholder -->
      <div class="absolute inset-0 z-0 bg-cover bg-center" style="background-image: url('/placeholder-promotion-bg.png'); background-color: #ebf2f8;">
        <!-- In a real app, this would be the image -->
        <div class="container mx-auto h-full flex items-center">
           <div class="w-1/2 h-64 bg-blue-200 bg-opacity-20 rounded-lg ml-10 flex items-center justify-center text-blue-800 text-2xl font-bold border-4 border-blue-300 border-dashed">
             12306 官方APP推广背景
           </div>
        </div>
      </div>

      <div class="container mx-auto px-4 h-[600px] flex items-center justify-end relative z-10">
        <!-- Login Form -->
        <div class="bg-white w-[400px] p-0 shadow-lg rounded-sm overflow-hidden">
          <div class="flex border-b border-gray-200">
            <div class="flex-1 py-3 text-center text-blue-600 font-bold border-t-2 border-blue-600 bg-white cursor-pointer">
              账号登录
            </div>
            <div class="flex-1 py-3 text-center text-gray-600 bg-gray-50 cursor-pointer hover:bg-white">
              扫码登录
            </div>
          </div>
          
          <div class="p-8 space-y-6">
            <!-- Error Message Area -->
            <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm flex items-center">
              <span class="mr-2">⚠️</span> {{ errorMsg }}
            </div>
            <div v-else class="h-[38px]"></div> <!-- Placeholder to prevent jump -->

            <form @submit.prevent="handleLogin" class="space-y-4">
              <!-- Identifier Input -->
              <div class="relative">
                <input 
                  v-model="form.identifier"
                  type="text" 
                  placeholder="用户名/邮箱/手机号"
                  class="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder-gray-400"
                />
                <span class="absolute right-3 top-3 text-gray-400">👤</span>
              </div>

              <!-- Password Input -->
              <div class="relative">
                <input 
                  v-model="form.password"
                  type="password" 
                  placeholder="密码"
                  class="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder-gray-400"
                />
                <span class="absolute right-3 top-3 text-gray-400">🔒</span>
              </div>

              <!-- Login Button -->
              <button 
                type="submit"
                class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded shadow transition duration-200"
              >
                立即登录
              </button>

              <!-- Links -->
              <div class="flex justify-between text-sm mt-4">
                <router-link to="/register" class="text-blue-600 hover:underline">注册12306账户</router-link>
                <a href="#" class="text-gray-500 hover:text-gray-700">忘记密码？</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <footer class="bg-white border-t border-gray-200 py-8">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0 text-sm text-gray-500 space-x-4">
            <a href="#" class="hover:text-gray-700">关于我们</a>
            <a href="#" class="hover:text-gray-700">网站声明</a>
            <a href="#" class="hover:text-gray-700">隐私政策</a>
            <a href="#" class="hover:text-gray-700">帮助中心</a>
          </div>
          <div class="flex space-x-6">
             <div class="flex flex-col items-center">
               <div class="w-16 h-16 bg-gray-200 mb-2"></div>
               <span class="text-xs text-gray-500">官方微信</span>
             </div>
             <div class="flex flex-col items-center">
               <div class="w-16 h-16 bg-gray-200 mb-2"></div>
               <span class="text-xs text-gray-500">官方微博</span>
             </div>
             <div class="flex flex-col items-center">
               <div class="w-16 h-16 bg-gray-200 mb-2"></div>
               <span class="text-xs text-gray-500">12306公众号</span>
             </div>
             <div class="flex flex-col items-center">
               <div class="w-16 h-16 bg-gray-200 mb-2"></div>
               <span class="text-xs text-gray-500">铁路12306</span>
             </div>
          </div>
        </div>
        <div class="text-center text-xs text-gray-400 mt-8">
          版权所有 © 2025 中国铁路客户服务中心 | 京ICP备15003716号-3
        </div>
      </div>
    </footer>

    <!-- SMS Verification Modal -->
    <LoginVerificationModal 
      :is-open="showModal"
      :expected-id-last4="currentUserInfo?.id_no?.slice(-4) || '0000'"
      :mobile="currentUserInfo?.mobile || ''"
      @close="showModal = false"
      @success="onVerificationSuccess"
    />
  </div>
</template>
