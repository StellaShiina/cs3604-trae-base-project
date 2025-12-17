<template>
  <div class="verification-code-step">
    <form @submit.prevent="handleSubmit">
      <div class="form-row">
        <label class="form-label">
          <span class="required-mark">*</span> 手机号：
        </label>
        <div class="phone-display">{{ formatPhone(phone) }}</div>
      </div>

      <div class="form-row">
        <label class="form-label">
          <span class="required-mark">*</span> 请填写手机验证码：
        </label>
        <div class="input-wrapper">
          <div class="code-input-group">
            <input
              type="text"
              class="form-input"
              v-model="code"
              @input="handleCodeInput"
              placeholder="请输入6位验证码"
              maxlength="6"
              :disabled="isLoading"
            />
            <button
              v-if="countdown === 0"
              type="button"
              class="send-code-button"
              @click="handleSendCode"
              :disabled="isLoading"
            >
              {{ isLoading ? '发送中...' : codeSent ? '重新获取验证码' : '获取手机验证码' }}
            </button>
            <div v-else class="countdown-text">
              验证码已发出，请注意查收短信，你可以在{{ countdown }}秒后重新发送
            </div>
          </div>
        </div>
        <div v-if="error" class="error-text">{{ error }}</div>
      </div>

      <div class="button-row">
        <button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? '验证中...' : '提交' }}
        </button>
      </div>

      <div class="help-link">
        手机号未通过核验？试试<a href="#email">邮箱找回</a>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import axios from 'axios';

const props = defineProps<{
  sessionId: string;
  phone: string;
}>();

const emit = defineEmits<{
  (e: 'success', resetToken: string): void
}>();

const code = ref('');
const countdown = ref(0);
const error = ref('');
const isLoading = ref(false);
const codeSent = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

// 倒计时效果
watch(countdown, (newVal) => {
  if (newVal > 0) {
    timer = setTimeout(() => {
      countdown.value = newVal - 1;
    }, 1000);
  }
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});

// 格式化手机号显示
const formatPhone = (phoneNumber: string) => {
  if (phoneNumber.length === 11) {
    return `(+86) ${phoneNumber.slice(0, 3)}${phoneNumber.slice(3, 7)}${phoneNumber.slice(7)}`;
  }
  return phoneNumber;
};

const handleCodeInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const value = target.value.replace(/\D/g, '').slice(0, 6);
  code.value = value;
  target.value = value;
  error.value = '';
};

// 发送验证码
const handleSendCode = async () => {
  if (countdown.value > 0) return;

  error.value = '';
  isLoading.value = true;

  try {
    const response = await axios.post('/api/v1/password-reset/send-code', {
      sessionId: props.sessionId
    });

    if (response.data.success) {
      countdown.value = 120; // 120秒倒计时
      codeSent.value = true;
      
      // 开发环境打印验证码
      if (response.data.verificationCode) {
        console.log('\n=================================');
        console.log('📱 密码重置验证码');
        console.log(`手机号: ${props.phone}`);
        console.log(`验证码: ${response.data.verificationCode}`);
        console.log('有效期: 120秒');
        console.log('=================================\n');
      }
    } else {
      error.value = response.data.error || '发送验证码失败';
    }
  } catch (err: any) {
    console.error('发送验证码失败:', err);
    error.value = err.response?.data?.error || '发送验证码失败，请重试';
  } finally {
    isLoading.value = false;
  }
};

// 提交验证码
const handleSubmit = async () => {
  if (!code.value) {
    error.value = '请输入手机验证码！';
    return;
  }

  if (code.value.length !== 6) {
    error.value = '请输入6位验证码';
    return;
  }

  isLoading.value = true;
  error.value = '';

  try {
    const response = await axios.post('/api/v1/password-reset/verify-code', {
      sessionId: props.sessionId,
      code: code.value
    });

    if (response.data.success) {
      // 验证成功，进入下一步
      emit('success', response.data.resetToken);
    } else {
      error.value = response.data.error || '验证码验证失败';
    }
  } catch (err: any) {
    console.error('验证验证码失败:', err);
    error.value = err.response?.data?.error || '很抱歉，您输入的短信验证码有误。';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
/* ==================== 密码找回验证码步骤容器 ==================== */
.verification-code-step {
  max-width: 900px;
  margin: 0 auto;

  form {
    display: flex;
    flex-direction: column;
  }

  /* ==================== 表单行布局 ==================== */
  .form-row {
    display: flex;
    align-items: center; /* 改为center，使标签与输入框垂直居中对齐 */
    margin-bottom: 20px; /* 减少间距，从35px改为20px */
    margin-left: 80px; /* 整体向右移动 */
    position: relative;
  }

  .form-label {
    width: 120px;
    text-align: right;
    padding-right: 15px;
    padding-top: 0px; /* 移除顶部padding */
    padding-bottom: 0; /* 移除底部padding */
    font-size: 14px;
    color: #333333;
    flex-shrink: 0;
    white-space: nowrap; /* 确保标签文字不换行 */
    display: flex;
    align-items: center; /* 标签内容垂直居中 */
    height: 30px; /* 与输入框高度一致，便于对齐 */
  }

  .required-mark {
    color: #ff4d4f;
    margin-right: 2px;
  }

  /* ==================== 手机号显示 ==================== */
  .phone-display {
    padding: 0; /* 移除padding，使用margin来控制位置 */
    background: transparent;
    border: none;
    border-radius: 0;
    font-size: 16px;
    color: #ffa151;
    font-weight: 500;
    width: 400px;
    box-sizing: border-box;
    margin-left: 40px; /* 进一步向右移动，与输入框对齐 */
    display: flex;
    align-items: center; /* 垂直居中 */
    height: 30px; /* 与输入框高度一致 */
  }

  /* ==================== 输入框容器 ==================== */
  .input-wrapper {
    width: 600px;
    flex-shrink: 0;
    margin-left: 40px; /* 进一步向右移动，使输入框更居中 */
  }

  /* ==================== 验证码输入区域 ==================== */
  .code-input-group {
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;
    flex-wrap: nowrap;
  }

  /* ==================== 验证码输入框 ==================== */
  .form-input {
    width: 230px; /* 宽度230px */
    height: 30px; /* 高度30px */
    padding: 4px 10px; /* padding 4px 10px */
    border: 1px solid #e4e7ed;
    border-radius: 0px;
    font-size: 14px;
    transition: border-color 0.3s;
    background: white;
    box-sizing: border-box;
    line-height: 20px;
    flex-shrink: 0;

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

  /* ==================== 发送验证码按钮 ==================== */
  .send-code-button {
    flex-shrink: 0;
    padding: 4px 10px;
    background: #f5f7fa;
    color: #606266;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    white-space: nowrap;
    box-sizing: border-box;
    height: 30px;
    width: 122px;
    line-height: 20px;
    min-width: 120px;
    text-align: center;

    &:hover:not(:disabled) {
      color: #1890ff;
      border-color: #1890ff;
    }

    &:disabled {
      background: #ffffff;
      color: #606266;
      border: 1px solid #dcdfe6;
      cursor: not-allowed;
    }
  }

  /* ==================== 倒计时文字 ==================== */
  .countdown-text {
    flex-shrink: 0;
    padding: 0;
    background: transparent;
    color: #ff8000;
    font-size: 13px;
    line-height: 1.6;
    white-space: nowrap;
    margin-left: 0;
  }

  /* ==================== 错误提示 ==================== */
  .error-text {
    position: absolute;
    left: 135px;
    bottom: -22px;
    color: #FF2626;
    font-size: 13px;
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
    padding: 4px 10px;
    background: #ff6602;
    color: white;
    border: 1px solid #dedede;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s;
    min-width: 120px;
    height: 30px;
    line-height: 20px;

    &:hover:not(:disabled) {
      background: #ffa151;
    }

    &:disabled {
      background: #d9d9d9;
      cursor: not-allowed;
    }
  }

  /* ==================== 帮助链接 ==================== */
  .help-link {
    text-align: center;
    font-size: 14px;
    color: #666;
    margin-top: 10px;

    a {
      color: #1890ff;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
