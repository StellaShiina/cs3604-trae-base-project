<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import RegisterForm from '@/components/Auth/RegisterForm.vue';
import TopHeader from '@/components/Common/TopHeader.vue';

const router = useRouter();
const isRegistrationSuccess = ref(false);

const handleRegisterSuccess = (_data: any) => {
  isRegistrationSuccess.value = true;
  // In a real app, you might show a success page or redirect to login
  setTimeout(() => {
    router.push('/login');
  }, 3000);
};

const handleNavigateToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="register-page">
    <TopHeader />
    
    <div class="register-main">
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <router-link to="/search">首页</router-link>
        <span class="breadcrumb-separator">&gt;</span>
        <span>注册</span>
      </div>

      <!-- Register Container -->
      <div class="register-container">
        <!-- Header -->
        <div class="register-header">
          账户注册
        </div>

        <!-- Content -->
        <div class="register-content">
          <div v-if="isRegistrationSuccess" class="success-banner">
            <div class="success-icon">✓</div>
            <div class="success-text">
              <h3>注册成功！</h3>
              <p>3秒后自动跳转至登录页面...</p>
              <button @click="handleNavigateToLogin" class="login-link-btn">立即登录</button>
            </div>
          </div>
          
          <RegisterForm 
            v-else 
            @submit="handleRegisterSuccess" 
            @navigate-to-login="handleNavigateToLogin"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* RegisterPage Styles */

.register-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.register-main {
  flex: 1;
  padding: 20px 0;
}

/* Breadcrumb */
.breadcrumb {
  max-width: 1200px;
  margin: 0 auto 10px;
  padding: 0 20px;
  font-size: 12px;
  color: #666;
  line-height: 20px;
}

.breadcrumb a {
  color: #0066cc;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #999;
}

/* Register Container */
.register-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border: 1px solid #d0d0d0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Header */
.register-header {
  background: linear-gradient(to bottom, #3ba3e2 0%, #2a8bc7 100%);
  padding: 12px 20px;
  color: white;
  font-size: 17px;
  font-weight: bold;
  border-bottom: 2px solid #2180b0;
}

/* Content Area */
.register-content {
  padding: 30px 60px 40px;
  border-top: 2px solid #3ba3e2;
}

/* Success Banner */
.success-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
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
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 20px;
}

.success-text {
  text-align: center;
}

.success-text h3 {
  margin: 0 0 10px;
  color: #333;
  font-size: 24px;
}

.success-text p {
  color: #666;
  margin: 0 0 20px;
}

.login-link-btn {
  background: #ff8001;
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.login-link-btn:hover {
  background: #ff9933;
}

/* Responsive */
@media (max-width: 1024px) {
  .register-container {
    margin: 0 20px;
  }
}

@media (max-width: 768px) {
  .register-content {
    padding: 20px 30px;
  }
}

@media (max-width: 480px) {
  .register-content {
    padding: 15px 20px;
  }
}
</style>