<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isVisible: boolean;
  phoneNumber: string;
  isSuccess?: boolean;
  successMessage?: string;
  externalError?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'complete', code: string): void;
  (e: 'back'): void;
}>();

const verificationCode = ref('');
const error = ref('');

// Reset state when modal opens/closes
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    verificationCode.value = '';
    error.value = '';
  }
});

const handleCodeChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, ''); // Only allow digits
  verificationCode.value = value.slice(0, 6);
  error.value = '';
};

const handleSubmit = () => {
  if (verificationCode.value.length !== 6) {
    error.value = '请输入6位验证码';
    return;
  }
  emit('complete', verificationCode.value);
};

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="reg-verification-modal-backdrop" @click="handleBackdropClick">
      <div class="reg-verification-modal">
        <!-- Header -->
        <div class="reg-verification-modal-header">
          <h3>手机验证</h3>
          <button 
            class="close-button" 
            @click="emit('close')"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <!-- Content -->
        <div class="reg-verification-modal-content">
          <div v-if="isSuccess" class="success-content">
            <div class="success-icon">✓</div>
            <p class="success-message">{{ successMessage }}</p>
          </div>
          <div v-else>
            <!-- Verification Message -->
            <p class="verification-message">
              验证码已发送至{{ phoneNumber }}
            </p>

            <!-- Verification Form -->
            <div class="verification-form">
              <div class="form-row">
                <label class="form-label">验证码：</label>
                <input
                  type="text"
                  class="form-input"
                  :value="verificationCode"
                  @input="handleCodeChange"
                  maxlength="6"
                  placeholder="请输入6位验证码"
                />
              </div>
              
              <div v-if="error || externalError" class="reg-verification-error-message">
                {{ error || externalError }}
              </div>

              <div class="button-group">
                <button 
                  class="complete-button"
                  @click="handleSubmit"
                >
                  完成注册
                </button>
                <button 
                  class="back-button"
                  @click="emit('back')"
                >
                  返回修改
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Registration Verification Modal Styles */

.reg-verification-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.reg-verification-modal {
  background: white;
  border-radius: 0px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Header */
.reg-verification-modal-header {
  background: #3a93e6;
  color: white;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0px;
}

.reg-verification-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: normal;
}

.close-button {
  background: none !important;
  border: none !important;
  color: white !important;
  font-size: 28px !important;
  cursor: pointer !important;
  padding: 0 !important;
  width: 30px !important;
  height: 30px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  border-radius: 0 !important;
}

.close-button:hover {
  opacity: 0.8 !important;
  border-color: transparent !important;
}

/* Content Area */
.reg-verification-modal-content {
  padding: 30px 40px;
}

/* Verification Message */
.verification-message {
  font-size: 15px;
  color: #333;
  margin: 0 0 30px 0;
  text-align: center;
  line-height: 1.6;
  letter-spacing: 0.05em;
  font-weight: 500;
}

/* Verification Form */
.verification-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: flex-start !important;
  margin-bottom: 20px;
  padding-left: 20px;
}

.form-label {
  width: 120px;
  text-align: right;
  margin-right: 10px;
  font-size: 14px;
  color: #333;
  flex-shrink: 0;
}

.form-input {
  flex: 1 !important;
  max-width: 200px !important;
  height: 32px !important;
  padding: 0 10px !important;
  border: 1px solid #ccc !important;
  border-radius: 0px !important;
  font-size: 13px !important;
  outline: none !important;
  transition: border-color 0.3s !important;
  background: white !important;
  color: #000000 !important;
}

.form-input:focus {
  border-color: #5ca3e6 !important;
  box-shadow: 0 0 0 1px rgba(92, 163, 230, 0.2) !important;
}

.reg-verification-error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin: 0px 0 10px 0;
  text-align: left;
  padding-left: 120px;
}

/* Button Group */
.button-group {
  display: flex !important;
  justify-content: center !important;
  gap: 30px !important;
  margin-top: 20px !important;
  padding-top: 20px !important;
}

.complete-button,
.back-button {
  padding: 8px 20px !important;
  font-size: 14px !important;
  border-radius: 0px !important;
  cursor: pointer !important;
  transition: all 0.3s !important;
  font-weight: normal !important;
  width: 140px !important;
  min-width: 140px !important;
  max-width: 140px !important;
  box-sizing: border-box !important;
}

.complete-button {
  background: #ff8533 !important;
  color: white !important;
  border: none !important;
}

.complete-button:hover {
  background: #ff9547 !important;
}

.back-button {
  background: white !important;
  color: #2681d5 !important;
  border: none !important;
}

.back-button:hover {
  background: #f5f9ff !important;
  color: #5ca3e6 !important;
}

/* Responsive */
@media (max-width: 768px) {
  .reg-verification-modal {
    width: 95%;
    max-width: none;
  }

  .reg-verification-modal-content {
    padding: 20px;
  }

  .button-group {
    flex-direction: column;
    gap: 10px;
  }

  .complete-button,
  .back-button {
    width: 100% !important;
  }
}

/* Success State */
.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 200px;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #52c41a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
  font-weight: bold;
  margin-bottom: 20px;
  animation: scaleIn 0.3s ease-out;
}

.success-message {
  font-size: 16px;
  color: #333;
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>