<template>
  <div class="login-form-container">
    <div class="login-tabs">
      <button 
        class="tab-button"
        :class="{ 'active': loginType === 'account' }"
        @click="loginType = 'account'"
      >
        账号登录
      </button>
      <button 
        class="tab-button"
        :class="{ 'active': loginType === 'qr' }"
        @click="loginType = 'qr'"
      >
        扫码登录
      </button>
    </div>

    <form class="login-form" @submit.prevent="handleSubmit">
      <div v-if="error || validationError" class="error-message">
        {{ validationError || error }}
      </div>
      
      <div v-if="loginType === 'account'">
        <div class="form-group">
          <input
            type="text"
            placeholder="用户名/邮箱/手机号"
            v-model="username"
            class="form-input"
            :disabled="isLoading"
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            placeholder="密码"
            v-model="password"
            class="form-input"
            :disabled="isLoading"
          />
        </div>
      </div>

      <div v-if="loginType === 'qr'" class="qr-login-area">
        <div class="qr-code-container">
          <img 
            src="/images/铁路12306二维码.png" 
            alt="扫码登录" 
            class="qr-code-image"
          />
          <div class="qr-instructions">
            <p>打开铁路12306手机APP</p>
            <p>扫描二维码登录</p>
          </div>
        </div>
      </div>

      <button 
        v-if="loginType !== 'qr'"
        type="submit" 
        class="login-button"
        :disabled="isLoading"
      >
        {{ isLoading ? '登录中...' : '立即登录' }}
      </button>

      <div class="form-links">
        <button type="button" class="link-button" @click="$emit('register-click')">
          注册12306账户
        </button>
        <button type="button" class="link-button forgot-password-link" @click="$emit('forgot-password-click')">
          忘记密码？
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import './LoginForm.css'

const props = defineProps<{
  isLoading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  (e: 'submit', data: { identifier: string; password: string }): void
  (e: 'qr-login'): void
  (e: 'register-click'): void
  (e: 'forgot-password-click'): void
}>()

const username = ref('')
const password = ref('')
const loginType = ref<'account' | 'qr'>('account')
const validationError = ref('')

// Clear password on error
watch(() => props.error, (newVal) => {
  if (newVal) {
    password.value = ''
  }
})

const handleSubmit = () => {
  validationError.value = ''
  
  if (loginType.value === 'account') {
    if (!username.value || username.value.trim() === '') {
      validationError.value = '请输入用户名！'
      return
    }
    
    if (!password.value || password.value.trim() === '') {
      validationError.value = '请输入密码！'
      return
    }
    
    if (password.value.length < 6) {
      validationError.value = '密码长度不能少于6位！'
      return
    }
    
    emit('submit', { identifier: username.value, password: password.value })
  } else if (loginType.value === 'qr') {
    emit('qr-login')
  }
}
</script>
