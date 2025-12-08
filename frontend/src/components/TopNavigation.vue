<template>
  <div class="top-navigation">
    <div class="logo-section">
      <div class="logo-wrapper" @click="handleLogoClick">
        <img 
          src="/images/logo.png" 
          alt="中国铁路12306" 
          class="logo-image"
        />
        <div class="logo-text">
          <div class="logo-chinese">中国铁路12306</div>
          <div class="logo-english">12306 CHINA RAILWAY</div>
        </div>
        <div v-if="showWelcomeLogin" class="welcome-login-text">欢迎登录12306</div>
      </div>
      
      <div v-if="!showWelcomeLogin" class="welcome-section">
        <span class="welcome-text">
          您好，请<router-link to="/login" class="login-link">登录</router-link>
        </span>
        <router-link to="/register" class="register-link">注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  showWelcomeLogin?: boolean
}>()

const emit = defineEmits<{
  (e: 'logoClick'): void
}>()

const handleLogoClick = () => {
  emit('logoClick')
}
</script>

<style>
/* 顶部导航栏样式 */
.top-navigation {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 15px 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.top-navigation > .logo-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
}

/* Logo区域 */
.logo-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-chinese {
  font-size: 22px;
  font-weight: bold;
  color: #333333;
  letter-spacing: 1.3px;
  line-height: 1.2;
}

.logo-english {
  font-size: 15px;
  color: #999999;
  letter-spacing: 0.1px;
  line-height: 1.2;
}

/* 欢迎登录文字 */
.welcome-login-text {
  margin-left: 30px;
  font-size: 20px;
  font-weight: 500;
  color: #4f4f4f;
}

/* 欢迎信息区域（登录/注册页不显示） */
.welcome-section {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}

.welcome-text {
  font-size: 14px;
  color: #666666;
}

.login-link,
.register-link {
  font-size: 14px;
  color: #2196f3;
  text-decoration: none;
  padding: 0 4px;
  transition: all 0.3s;
}

.login-link:hover,
.register-link:hover {
  color: #1976d2;
  text-decoration: underline;
}

.login-link:active,
.register-link:active {
  color: #0d47a1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-navigation {
    padding: 12px 0;
  }

  .logo-section {
    padding: 0 15px;
    gap: 10px;
  }

  .logo-image {
    width: 40px;
    height: 40px;
  }

  .logo-chinese {
    font-size: 16px;
  }

  .logo-english {
    font-size: 10px;
  }

  .welcome-login-text {
    margin-left: 15px;
    font-size: 14px;
  }

  .welcome-text,
  .login-link,
  .register-link {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .top-navigation {
    padding: 10px 0;
  }

  .logo-section {
    padding: 0 10px;
    gap: 8px;
  }

  .logo-image {
    width: 36px;
    height: 36px;
  }

  .logo-chinese {
    font-size: 14px;
  }

  .logo-english {
    font-size: 9px;
  }

  .welcome-login-text {
    margin-left: 10px;
    font-size: 12px;
  }

  .welcome-section {
    gap: 5px;
  }

  .welcome-text {
    display: none;
  }

  .login-link,
  .register-link {
    font-size: 12px;
    padding: 3px 8px;
  }
}
</style>
