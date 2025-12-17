<template>
  <div class="complete-step">
    <div class="success-icon">✓</div>
    <div class="success-message">
      新密码设置成功，您可以使用新密码
      <span class="login-link" @click="handleLoginClick">
        登录系统
      </span>
      ！
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const handleLoginClick = () => {
  router.push('/login');
};
</script>

<style lang="scss" scoped>
/* ==================== 完成步骤容器 ==================== */
.complete-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px; /* 减少最小高度，从400px改为300px */
  text-align: center;

  /* ==================== 成功图标 ==================== */
  .success-icon {
    width: 60px; /* 减小图标尺寸 */
    height: 60px;
    border-radius: 50%;
    background: #4caf50;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px; /* 减小字体 */
    margin-bottom: 15px; /* 减少下边距，从30px改为15px */
    animation: successPulse 0.6s ease-out;
  }

  @keyframes successPulse {
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

  /* ==================== 成功消息 ==================== */
  .success-message {
    font-size: 14px;
    color: #ff6f00;
    line-height: 1.8;
  }

  /* ==================== 登录链接 ==================== */
  .login-link {
    color: #1e88e5;
    cursor: pointer;
    text-decoration: none;
    font-weight: 500;
    font-size: 14px; /* 与橙色文字大小保持一致 */
    transition: all 0.3s ease;

    &:hover {
      text-decoration: underline;
      color: #1565c0;
    }
  }
}
</style>
