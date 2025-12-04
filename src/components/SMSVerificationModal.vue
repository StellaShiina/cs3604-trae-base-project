<script setup lang="ts">
import { ref, watch } from 'vue'
import { verifySMS } from '../services/authService'

const props = defineProps<{
  isOpen: boolean
  mobile: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const verificationCodeInput = ref('')
const errorMessage = ref('')

// Reset state when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    verificationCodeInput.value = ''
    errorMessage.value = ''
  }
})

const handleConfirm = async () => {
  errorMessage.value = ''
  
  if (!verificationCodeInput.value) {
    errorMessage.value = '请输入验证码'
    return
  }
  if (verificationCodeInput.value.length < 6) {
    errorMessage.value = '验证码错误'
    return
  }

  try {
    // Call Backend to Verify SMS
    await verifySMS(props.mobile, verificationCodeInput.value)
    emit('success')
  } catch (error: any) {
    console.error(error)
    errorMessage.value = '验证码错误'
  }
}

const handleBack = () => {
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-[400px] overflow-hidden border-t-4 border-blue-600">
      <!-- Top Bar -->
      <div class="bg-gray-50 px-4 py-2 flex justify-between items-center border-b border-gray-200">
        <span class="text-gray-700 font-medium">手机验证</span>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
      </div>

      <!-- Content -->
      <div class="p-6 flex flex-col space-y-6">
        
        <div class="text-center text-gray-700">
           验证码已发送至【{{ mobile }}】
        </div>
        
        <div class="flex items-center justify-center space-x-2">
           <label class="text-gray-700 font-medium w-20 text-right">验证码：</label>
           <input 
             v-model="verificationCodeInput"
             type="text" 
             maxlength="6"
             class="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
           />
        </div>

        <!-- Error Message -->
        <div class="h-6 flex justify-center items-center">
           <span v-if="errorMessage" class="text-red-500 text-sm">⚠️ {{ errorMessage }}</span>
        </div>

        <!-- Buttons -->
        <div class="flex justify-center space-x-4">
          <button 
            @click="handleConfirm"
            class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition duration-200"
          >
            完成注册
          </button>
          <button 
            @click="handleBack"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-6 rounded transition duration-200"
          >
            返回修改
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
