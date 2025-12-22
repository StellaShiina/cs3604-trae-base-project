<script setup lang="ts">
import { ref, watch } from 'vue'
import { sendSms } from '@/api/auth'

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

// Countdown logic
watch(countdown, (val) => {
  if (val > 0) {
    setTimeout(() => {
      countdown.value--
    }, 1000)
  }
})

const handleSendCode = async () => {
  if (!idCardLast4.value || idCardLast4.value.length !== 4) {
    validationError.value = '请输入证件号后4位'
    return
  }

  isLoading.value = true
  validationError.value = ''

  if (!props.sessionId) {
    // Local mock
    countdown.value = 60
    isLoading.value = false
    return
  }

  try {
    const response = await sendSms({
      sessionId: props.sessionId,
      idCardLast4: idCardLast4.value
    })
    
    if (response.data) {
        // Log for dev
        console.log('Verification Code:', response.data.verificationCode || response.data.code)
        countdown.value = 60
    }
  } catch (error: any) {
    validationError.value = error.response?.data?.error || '发送验证码失败'
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = () => {
  validationError.value = ''
  
  if (!idCardLast4.value) {
    validationError.value = '请输入证件号后4位'
    return
  }
  
  if (!code.value) {
    validationError.value = '请输入验证码'
    return
  }
  
  emit('submit', { idCardLast4: idCardLast4.value, code: code.value })
}
</script>

<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-header">
        <span class="title">提示</span>
        <button class="close-btn" @click="emit('close')">&times;</button>
      </div>
      
      <div class="modal-content">
        <h3 class="verify-title">短信验证</h3>
        
        <form @submit.prevent="handleSubmit">
          <div v-if="validationError || props.externalError" class="error-text">
            {{ validationError || props.externalError }}
          </div>
           <div v-if="props.externalSuccess" class="success-text">
            {{ props.externalSuccess }}
          </div>
          
          <div class="form-row">
            <input 
              type="text" 
              class="input-control" 
              placeholder="请输入登录账号绑定的证件号后4位" 
              :value="idCardLast4"
              @input="(e) => {
                const target = e.target as HTMLInputElement;
                const value = target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 4).toUpperCase();
                idCardLast4 = value;
                // Force update if needed (though v-model usually handles it, :value + @input gives more control)
                target.value = value;
              }"
              maxlength="4"
            />
          </div>
          
          <div class="form-row code-row">
             <input 
              type="text" 
              class="input-control" 
              placeholder="短信验证码" 
              :value="code"
              @input="(e) => {
                 const target = e.target as HTMLInputElement;
                 code = target.value.replace(/\D/g, '').slice(0, 6);
                 target.value = code;
              }"
              maxlength="6"
            />
            <button 
              type="button" 
              class="send-btn" 
              :disabled="countdown > 0 || isLoading"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
            </button>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="confirm-btn">确定</button>
            <button type="button" class="cancel-btn" @click="emit('close')">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #ffffff;
  border-radius: 6px;
  width: 440px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideIn 0.25s ease-out;
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background-color: #ffffff;
    border-bottom: 1px solid #f0f0f0;
    
    .title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #888;
      cursor: pointer;
      padding: 0;
      
      &:hover { color: #333; }
    }
  }

  .modal-content {
    padding: 0 40px 32px 40px;
    
    .verify-title {
      text-align: center;
      padding: 24px 0;
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: #1890ff;
    }
    
    .error-text {
      color: #ff4d4f;
      margin-bottom: 15px;
      font-size: 14px;
    }
    .success-text {
      color: #52c41a;
      margin-bottom: 15px;
      font-size: 14px;
    }
    
    .form-row {
      margin-bottom: 20px;
      
      &.code-row {
        display: flex;
        gap: 10px;
      }
      
      .input-control {
        width: 100%;
        height: 40px;
        padding: 0 10px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
        
        &:focus {
          outline: none;
          border-color: #1890ff;
        }
      }
      
      .send-btn {
        width: 120px;
        height: 40px;
        background: #f5f5f5;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        cursor: pointer;
        
        &:disabled {
          color: #999;
          cursor: not-allowed;
        }
        
        &:not(:disabled):hover {
          color: #1890ff;
          border-color: #1890ff;
        }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 30px;
      
      button {
        padding: 8px 30px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        border: 1px solid transparent;
        
        &.confirm-btn {
          background: #ff8c00; // Orange for confirm
          color: white;
          
          &:hover { background: #e67e00; }
        }
        
        &.cancel-btn {
          background: #f5f5f5;
          border-color: #d9d9d9;
          color: #666;
          
          &:hover { background: #e8e8e8; }
        }
      }
    }
  }
}
</style>
