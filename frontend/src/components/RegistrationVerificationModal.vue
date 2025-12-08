<script setup lang="ts">
import { ref } from 'vue';
import './RegistrationVerificationModal.css';

interface Props {
  phoneNumber: string;
  isSuccess?: boolean;
  successMessage?: string;
  externalError?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isSuccess: false,
  successMessage: '',
  externalError: ''
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'complete', code: string): void;
  (e: 'back'): void;
}>();

const verificationCode = ref('');
const error = ref('');

const handleSubmit = (e: Event) => {
  e.preventDefault();
  error.value = '';

  if (!verificationCode.value) {
    error.value = '请输入验证码';
    return;
  }

  if (verificationCode.value.length !== 6) {
    error.value = '验证码应为6位数字';
    return;
  }

  emit('complete', verificationCode.value);
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, ''); // 只允许数字
  verificationCode.value = value.slice(0, 6);
  error.value = '';
};

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close');
  }
};
</script>

<template>
  <Teleport to="body">
    <div class="reg-verification-modal-backdrop" @click="handleBackdropClick">
      <div class="reg-verification-modal">
        <!-- 标题栏 -->
        <div class="reg-verification-modal-header">
          <h3>手机验证</h3>
          <button 
            class="close-button" 
            @click="$emit('close')"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="reg-verification-modal-content">
          <div v-if="isSuccess" class="success-content">
            <!-- 成功消息 -->
            <div class="success-icon">✓</div>
            <p class="success-message">{{ successMessage }}</p>
          </div>
          <div v-else>
            <!-- 验证码发送提示 -->
            <p class="verification-message">
              验证码已发送至{{ phoneNumber }}
            </p>

            <!-- 验证码输入表单 -->
            <form class="verification-form" @submit="handleSubmit">
              <div class="form-row">
                <label class="form-label">验证码：</label>
                <input
                  type="text"
                  class="form-input"
                  :value="verificationCode"
                  @input="handleInput"
                  maxlength="6"
                  placeholder="请输入6位验证码"
                />
              </div>

              <div v-if="error || externalError" class="reg-verification-error-message">
                {{ externalError || error }}
              </div>

              <!-- 按钮区域 -->
              <div class="button-group">
                <button 
                  type="submit" 
                  class="complete-button"
                >
                  完成注册
                </button>
                <button 
                  type="button" 
                  class="back-button"
                  @click="$emit('back')"
                >
                  返回修改
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
