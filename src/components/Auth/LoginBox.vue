<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isLoading?: boolean
  error?: string
}>()

const emit = defineEmits<{
  (e: 'submit', data: { identifier: string; password: string }): void
  (e: 'qrLogin'): void
  (e: 'register'): void
  (e: 'forgotPassword'): void
}>()

const username = ref('')
const password = ref('')
const loginType = ref<'account' | 'qr'>('account')
const validationError = ref('')

watch(() => props.error, (newError) => {
  if (newError) {
    password.value = ''
  }
})

const handleSubmit = () => {
  validationError.value = ''

  if (loginType.value === 'account') {
    if (!username.value || !username.value.trim()) {
      validationError.value = '请输入用户名！'
      return
    }

    if (!password.value || !password.value.trim()) {
      validationError.value = '请输入密码！'
      return
    }

    if (password.value.length < 6) {
      validationError.value = '密码长度不能少于6位！'
      return
    }

    emit('submit', { identifier: username.value, password: password.value })
  } else if (loginType.value === 'qr') {
    emit('qrLogin')
  }
}
</script>

<template>
  <div class="login-box">
    <div class="tabs-header">
      <button 
        class="tab-btn" 
        :class="{ active: loginType === 'account' }"
        @click="loginType = 'account'"
      >
        账号登录
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: loginType === 'qr' }"
        @click="loginType = 'qr'"
      >
        扫码登录
      </button>
    </div>

    <form class="form-body" @submit.prevent="handleSubmit">
      <div v-if="props.error || validationError" class="alert-msg">
        {{ validationError || props.error }}
      </div>
      
      <div v-if="loginType === 'account'">
        <div class="input-group">
          <input
            type="text"
            placeholder="用户名/邮箱/手机号"
            v-model="username"
            class="input-field"
            :disabled="props.isLoading"
          />
        </div>
        <div class="input-group">
          <input
            type="password"
            placeholder="密码"
            v-model="password"
            class="input-field"
            :disabled="props.isLoading"
          />
        </div>
        
        <div class="submit-row">
          <button type="submit" class="submit-btn" :disabled="props.isLoading">
            {{ props.isLoading ? '登录中...' : '立即登录' }}
          </button>
        </div>
        
        <div class="links-row">
          <button type="button" class="link-btn" @click="emit('register')">
            注册12306账户
          </button>
          <button type="button" class="link-btn" @click="emit('forgotPassword')">
            忘记密码？
          </button>
        </div>
      </div>

      <div v-else class="qr-placeholder">
        <div class="qr-code-container">
          <!-- Placeholder or actual image -->
          <div class="qr-mock">QR Code</div>
          <div class="qr-instructions">
            <p>打开铁路12306手机APP</p>
            <p>扫描二维码登录</p>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.login-box {
  width: 400px;
  background: #ffffff;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;

  .tabs-header {
    display: flex;
    background: #ffffff;
    border-bottom: none;

    .tab-btn {
      flex: 1;
      padding: 15px 20px;
      border: none;
      background: transparent;
      font-size: 18px;
      color: #333333;
      cursor: pointer;
      transition: all 0.3s ease;
      border-bottom: 3px solid transparent;

      &.active {
        background: #ffffff;
        color: #1890ff;
        font-weight: 600;
        border-bottom-color: transparent;
      }

      &:hover:not(.active) {
        background: transparent;
        color: #1890ff;
      }
    }
  }

  .form-body {
    padding: 30px;

    .alert-msg {
      background: #fff1f0; 
      border: 1px solid #ffa39e;
      color: #cf1322;
      padding: 10px 15px;
      border-radius: 0;
      margin-bottom: 20px;
      font-size: 14px;
      box-sizing: border-box;
      width: 100%; 
      text-align: center; 
    }

    .input-group {
      margin-bottom: 20px;

      .input-field {
        width: 100%;
        height: 50px;
        padding: 0 10px;
        border: 1px solid #d9d9d9;
        border-radius: 0;
        font-size: 14px;
        transition: border-color 0.3s ease;
        box-sizing: border-box;
        background: #ffffff;
        color: #333333;

        &:focus {
          outline: none;
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }

        &::placeholder {
          color: #bfbfbf;
        }
      }
    }

    .submit-row {
      margin-top: 30px;
      
      .submit-btn {
        width: 100%;
        height: 50px;
        background: #ff8c00; // Orange color
        color: #ffffff;
        border: none;
        border-radius: 4px;
        font-size: 18px;
        cursor: pointer;
        transition: background 0.3s;
        
        &:hover {
          background: #e67e00;
        }
        
        &:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
      }
    }

    .links-row {
      margin-top: 15px;
      display: flex;
      justify-content: space-between;
      
      .link-btn {
        background: none;
        border: none;
        color: #2196f3;
        font-size: 14px;
        cursor: pointer;
        padding: 0;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }

    .qr-placeholder {
      text-align: center;
      padding: 20px 0;
      
      .qr-mock {
          width: 150px;
          height: 150px;
          background: #eee;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
      }
      
      .qr-instructions {
          margin-top: 20px;
          color: #666;
          p { margin: 5px 0; }
      }
    }
  }
}
</style>
