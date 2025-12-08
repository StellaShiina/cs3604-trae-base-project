<template>
  <Teleport to="body">
    <div class="sms-modal-backdrop" @click.self="handleBackdropClick">
      <div class="sms-modal">
        <div class="sms-modal-header">
          <span class="modal-title">选择验证方式</span>
          <button class="close-button" @click="handleClose" type="button">
            ×
          </button>
        </div>
        
        <div class="verification-type">
          短信验证
        </div>
        
        <form class="sms-modal-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <input
              type="text"
              placeholder="请输入登录账号绑定的证件号后4位"
              v-model="idCardLast4"
              @input="handleIdCardInput"
              maxlength="4"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <div class="code-input-group">
              <input
                type="text"
                placeholder="输入验证码"
                v-model="code"
                @input="handleCodeInput"
                maxlength="6"
                class="form-input code-input"
              />
              <button
                type="button"
                class="send-code-button"
                :class="{ 'disabled': isSendButtonDisabled }"
                @click="handleSendCode"
                :disabled="isSendButtonDisabled"
              >
                {{ sendButtonText }}
              </button>
            </div>
          </div>
          
          <div v-if="validationError || externalError" class="sms-verification-error-message">
            {{ externalError || validationError }}
          </div>
          
          <div v-if="externalSuccess" class="success-message">
            {{ externalSuccess }}
          </div>
          
          <button type="submit" class="confirm-button">
            确定
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { sendVerificationCode } from '../api/auth'
import './SmsVerificationModal.css'

const props = defineProps<{
  sessionId?: string
  externalError?: string
  externalSuccess?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: { idCardLast4: string; code: string }): void
}>()

const idCardLast4 = ref('')
const code = ref('')
const countdown = ref(0)
const isLoading = ref(false)
const validationError = ref('')
let timer: ReturnType<typeof setTimeout> | null = null

const sendButtonText = computed(() => {
  if (countdown.value > 0) {
    return `重新发送(${countdown.value}s)`
  }
  if (isLoading.value) {
    return '发送中...'
  }
  return '获取验证码'
})

const isSendButtonDisabled = computed(() => {
  return idCardLast4.value.length < 4 || countdown.value > 0 || isLoading.value
})

watch(countdown, (newVal) => {
  if (newVal > 0) {
    timer = setTimeout(() => {
      countdown.value = newVal - 1
    }, 1000)
  }
})

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

const handleIdCardInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  // Allow only numbers and letters (last digit of ID might be X), convert to uppercase
  const value = target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 4).toUpperCase()
  idCardLast4.value = value
  validationError.value = ''
}

const handleCodeInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '').slice(0, 6)
  code.value = value
  validationError.value = ''
}

const handleSendCode = async () => {
  console.log('Sending SMS for ID card last 4:', idCardLast4.value)
  
  if (!idCardLast4.value || idCardLast4.value.length !== 4) {
    validationError.value = '请输入证件号后4位'
    return
  }

  isLoading.value = true
  validationError.value = ''
  
  // If no sessionId, just do local countdown (for testing)
  if (!props.sessionId) {
    countdown.value = 60
    isLoading.value = false
    return
  }
  
  try {
    // Call send verification code API
    const response: any = await sendVerificationCode({
      sessionId: props.sessionId,
      idCardLast4: idCardLast4.value
    })
    
    if (response.success) {
      // Get real code and phone from backend (dev environment)
      const realCode = response.verificationCode
      const phone = response.phone
      if (realCode) {
        console.log(`\n=================================`)
        console.log(`📱 登录验证码`)
        console.log(`手机号: ${phone || '未知'}`)
        console.log(`验证码: ${realCode}`)
        console.log(`有效期: 5分钟`)
        console.log(`=================================\n`)
      }
      
      // Start countdown
      countdown.value = 60
    } else {
      // API call succeeded but returned failure status
      validationError.value = '发送验证码失败'
    }
  } catch (error: any) {
    console.error('Failed to send SMS:', error)
    // Show error message
    const errorMsg = error.response?.data?.error || '发送验证码失败，请重试'
    validationError.value = errorMsg
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = () => {
  // Clear previous errors
  validationError.value = ''
  
  // Client-side validation
  if (!idCardLast4.value || idCardLast4.value.trim() === '') {
    validationError.value = '请输入登录账号绑定的证件号后4位'
    return
  }
  
  if (idCardLast4.value.length !== 4) {
    validationError.value = '请输入登录账号绑定的证件号后4位'
    return
  }
  
  if (!code.value || code.value.trim() === '') {
    validationError.value = '请输入验证码'
    return
  }
  
  if (code.value.length < 6) {
    validationError.value = '请输入正确的验证码'
    return
  }
  
  emit('submit', { idCardLast4: idCardLast4.value, code: code.value })
}

const handleBackdropClick = (e: Event) => {
  // Check if click was on backdrop
  if ((e.target as HTMLElement).classList.contains('sms-modal-backdrop')) {
    emit('close')
  }
}

const handleClose = () => {
  emit('close')
}
</script>
