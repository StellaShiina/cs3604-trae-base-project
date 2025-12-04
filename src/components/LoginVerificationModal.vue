<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { sendSMS, verifySMS } from '../services/authService'

const props = defineProps<{
  isOpen: boolean
  mobile: string
  expectedIdLast4: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const idLast4Input = ref('')
const verificationCodeInput = ref('')
const errorMessage = ref('')
const countdown = ref(0)
let timer: any = null

// Reset state when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    idLast4Input.value = ''
    verificationCodeInput.value = ''
    errorMessage.value = ''
    // Don't reset countdown if it's still running? 
    // Requirement says "1 minute limit", usually per session. 
    // For simplicity, we reset or keep it. Let's keep if running.
  }
})

const getCodeButtonState = computed(() => {
  // State 3: Countdown
  if (countdown.value > 0) return 3
  // State 2: ID input has 4 chars -> Active
  if (idLast4Input.value.length === 4) return 2
  // State 1: Default -> Disabled
  return 1
})

const handleGetCode = async () => {
  errorMessage.value = ''
  
  if (idLast4Input.value !== props.expectedIdLast4) {
    errorMessage.value = '请输入正确的用户信息！'
    return
  }

  // TODO: Check if sent within 1 minute (Frontend check).
  // Since we have countdown, that serves as the check.
  
  try {
    await sendSMS(props.mobile)
    errorMessage.value = '获取短信验证码成功！'
    
    // Start Countdown
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    
  } catch (error: any) {
    console.error(error)
    // If 429 or similar
    errorMessage.value = '验证码发送失败，请稍后重试'
  }
}

const handleConfirm = async () => {
  errorMessage.value = ''
  
  if (!idLast4Input.value) {
    errorMessage.value = '请输入登录账号绑定的证件号后4位'
    return
  }
  
  if (!verificationCodeInput.value) {
    // Requirement 2.3.2 Scenario says if empty...
    // But let's just check it.
    errorMessage.value = '请输入验证码'
    return
  }

  try {
    await verifySMS(props.mobile, verificationCodeInput.value)
    emit('success')
  } catch (error: any) {
    console.error(error)
    errorMessage.value = '验证码错误'
  }
}

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-[450px] overflow-hidden border-t-4 border-blue-600">
      <!-- Top Bar -->
      <div class="bg-gray-50 px-4 py-2 flex justify-between items-center border-b border-gray-200">
        <span class="text-gray-700 font-medium">选择验证方式</span>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
      </div>

      <!-- Content -->
      <div class="p-8 flex flex-col space-y-6">
        
        <div class="text-center text-blue-600 text-lg font-bold">
           短信验证
        </div>
        
        <!-- ID Last 4 Input -->
        <div class="flex items-center space-x-2">
           <label class="text-gray-700 w-24 text-right text-sm">证件号后4位：</label>
           <input 
             v-model="idLast4Input"
             type="text" 
             maxlength="4"
             placeholder="请输入登录账号绑定的证件号后4位"
             class="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
           />
        </div>

        <!-- Verification Code Input & Button -->
        <div class="flex items-center space-x-2">
           <label class="text-gray-700 w-24 text-right text-sm">验证码：</label>
           <div class="flex-1 flex space-x-2">
             <input 
               v-model="verificationCodeInput"
               type="text" 
               maxlength="6"
               placeholder="输入验证码"
               class="w-32 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
             />
             <button 
               @click="handleGetCode"
               :disabled="getCodeButtonState !== 2"
               class="flex-1 border rounded text-sm font-medium transition-colors duration-200"
               :class="{
                 'bg-gray-200 text-gray-500 cursor-not-allowed': getCodeButtonState === 1,
                 'bg-white text-black hover:bg-gray-50 border-gray-300': getCodeButtonState === 2,
                 'bg-gray-200 text-gray-500 cursor-not-allowed': getCodeButtonState === 3
               }"
             >
               {{ getCodeButtonState === 3 ? `重新发送(${countdown})` : '获取验证码' }}
             </button>
           </div>
        </div>

        <!-- Error Message -->
        <div class="h-6 flex justify-center items-center">
           <span v-if="errorMessage" class="text-red-500 text-sm">⚠️ {{ errorMessage }}</span>
        </div>

        <!-- Confirm Button -->
        <div class="flex justify-center">
          <button 
            @click="handleConfirm"
            class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-10 rounded transition duration-200"
          >
            确定
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
