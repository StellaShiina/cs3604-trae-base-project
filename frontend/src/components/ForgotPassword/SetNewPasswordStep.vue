<template>
  <div class="set-new-password-step">
    <form @submit.prevent="handleSubmit">
      <div class="form-row">
        <label class="form-label">
          <span class="required-mark">*</span> 新密码：
        </label>
        <div class="input-wrapper">
          <input
            type="password"
            class="form-input"
            v-model="newPassword"
            @input="handlePasswordChange"
            placeholder="请输入新密码"
            :disabled="isLoading"
          />
          <span class="hint-text">需包含字母、数字、下划线中不少于两种且长度不少于6</span>
        </div>
        <div v-if="errors.newPassword" class="error-text">{{ errors.newPassword }}</div>
      </div>

      <div class="form-row">
        <label class="form-label">
          <span class="required-mark">*</span> 密码确认：
        </label>
        <div class="input-wrapper">
          <input
            type="password"
            class="form-input"
            v-model="confirmPassword"
            @input="handleConfirmPasswordChange"
            placeholder="请再次输入新密码"
            :disabled="isLoading"
          />
          <span class="hint-text">请再次输入密码</span>
        </div>
        <div v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</div>
      </div>

      <div v-if="errors.general" class="error-text general-error">{{ errors.general }}</div>

      <div class="button-row">
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? '提交中...' : '提交' }}
        </button>
      </div>
      <div class="help-link">
        手机号未通过核验？试试<a href="#email">邮箱找回</a>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import axios from 'axios';

const props = defineProps<{
  resetToken: string;
}>();

const emit = defineEmits<{
  (e: 'success'): void
}>();

const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);

const errors = reactive({
  newPassword: '',
  confirmPassword: '',
  general: ''
});

// 验证密码格式
const validatePassword = (password: string): string => {
  if (!password) {
    return '';
  }

  if (password.length < 6) {
    return '密码长度不能少于6位';
  }

  // 检查密码是否包含字母、数字、下划线中的至少两种
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasUnderscore = /_/.test(password);
  const typesCount = [hasLetter, hasNumber, hasUnderscore].filter(Boolean).length;

  if (typesCount < 2) {
    return '需包含字母、数字、下划线中不少于两种';
  }

  return '';
};

// 验证确认密码
const validateConfirmPassword = (password: string, confirm: string): string => {
  if (!confirm) {
    return '';
  }

  if (password !== confirm) {
    return '两次密码输入不一致';
  }

  return '';
};

const handlePasswordChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  newPassword.value = target.value;
  // 只清除错误，不进行实时验证
  errors.newPassword = '';
  errors.confirmPassword = '';
  errors.general = '';
};

const handleConfirmPasswordChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  confirmPassword.value = target.value;
  // 只清除错误，不进行实时验证
  errors.confirmPassword = '';
  errors.general = '';
};

const handleSubmit = async () => {
  // 清除之前的错误
  errors.newPassword = '';
  errors.confirmPassword = '';
  errors.general = '';

  // 验证新密码
  const passwordError = validatePassword(newPassword.value);
  if (passwordError) {
    errors.newPassword = passwordError;
    return;
  }

  // 验证确认密码
  const confirmError = validateConfirmPassword(newPassword.value, confirmPassword.value);
  if (confirmError) {
    errors.confirmPassword = confirmError;
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.post('/api/v1/password-reset/reset-password', {
      resetToken: props.resetToken,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value
    });

    if (response.data.success) {
      // 密码重置成功，进入完成步骤
      emit('success');
    } else {
      errors.general = response.data.error || '密码重置失败';
    }
  } catch (error: any) {
    console.error('重置密码失败:', error);
    errors.general = error.response?.data?.error || '密码重置失败，请重试';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
/* ==================== 设置新密码步骤容器 ==================== */
.set-new-password-step {
  max-width: 900px;
  margin: 0 auto;

  form {
    display: flex;
    flex-direction: column;
  }

  /* ==================== 表单行布局 ==================== */
  .form-row {
    display: flex;
    align-items: center;
    margin-bottom: 20px; /* 减少间距，从35px改为20px */
    margin-left: 80px; /* 整体向右移动 */
    position: relative;
  }

  .form-label {
    width: 120px;
    text-align: right;
    padding-right: 8px; /* 减小标签与输入框之间的距离，从15px改为8px */
    font-size: 14px;
    color: #333;
    flex-shrink: 0;
  }

  .required-mark {
    color: #ff4d4f;
    margin-right: 2px;
  }

  /* ==================== 输入框容器 ==================== */
  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-left: 20px; /* 减小标签与输入框之间的距离，从40px改为20px */
  }

  /* ==================== 输入框 ==================== */
  .form-input {
    width: 260px; /* 宽度260px */
    height: 30px; /* 高度30px */
    padding: 4px 10px; /* padding 4px 10px */
    border: 1px solid #dedede;
    border-radius: 0px;
    font-size: 14px;
    transition: border-color 0.3s;
    background: white;
    box-sizing: border-box;
    flex-shrink: 0;
    line-height: 20px;

    &:focus {
      outline: none;
      border-color: #1890ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
    }

    &:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }
  }

  /* ==================== 提示文字 ==================== */
  .hint-text {
    color: #ff6600;
    font-size: 13px;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ==================== 错误提示 ==================== */
  .error-text {
    position: absolute;
    left: 135px;
    bottom: -22px;
    color: #ff4d4f;
    font-size: 13px;
  }

  .general-error {
    text-align: center;
    padding: 10px 15px;
    background: #fff2f0;
    border: 1px solid #ffccc7;
    border-radius: 2px;
    margin-left: 135px;
    margin-bottom: 20px;
    position: static;
  }

  /* ==================== 按钮行 ==================== */
  .button-row {
    display: flex;
    justify-content: center;
    margin-top: 15px; /* 减少上边距，从30px改为15px */
    margin-bottom: 10px; /* 减少下边距，从20px改为10px */
  }

  /* ==================== 提交按钮 ==================== */
  .submit-button {
    padding: 4px 10px; /* 与获取验证码页面一致 */
    background: #ff6602; /* 与获取验证码页面一致 */
    color: white;
    border: 1px solid #dedede; /* 与获取验证码页面一致 */
    border-radius: 6px; /* 与获取验证码页面一致 */
    font-size: 14px; /* 与获取验证码页面一致 */
    cursor: pointer;
    transition: background 0.3s;
    min-width: 120px; /* 与获取验证码页面一致 */
    height: 30px; /* 与获取验证码页面一致 */
    line-height: 20px; /* 与获取验证码页面一致 */

    &:hover:not(:disabled) {
      background: #ffa151; /* 与获取验证码页面一致 */
    }

    &:disabled {
      background: #d9d9d9;
      cursor: not-allowed;
    }
  }

  /* ==================== 帮助链接 ==================== */
  .help-link {
    text-align: center; /* 与获取验证码页面一致 */
    font-size: 14px; /* 与获取验证码页面一致 */
    color: #666; /* 与获取验证码页面一致 */
    margin-top: 10px; /* 与获取验证码页面一致 */

    a {
      color: #1890ff; /* 与获取验证码页面一致 */
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  /* ==================== 响应式设计 ==================== */
  @media (max-width: 900px) {
    .hint-text {
      font-size: 12px;
    }
    
    .form-input {
      width: 300px;
    }
  }
}
</style>
