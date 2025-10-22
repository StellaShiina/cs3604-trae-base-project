<template>
  <div class="login-container">
    <div class="login-form">
      <div class="form-header">
        <h2>登录12306</h2>
        <p class="subtitle">中国铁路客户服务中心</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form-content">
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-wrapper">
            <input
              id="username"
              v-model="loginData.username"
              type="text"
              placeholder="邮箱/用户名/手机号"
              required
              class="form-input"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="loginData.password"
              type="password"
              placeholder="请输入登录密码"
              required
              class="form-input"
            />
          </div>
        </div>
        
        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="rememberMe">
            <span class="checkmark"></span>
            记住用户名
          </label>
          <a href="#" class="forgot-password">忘记密码？</a>
        </div>
        
        <button type="submit" :disabled="isLoading" class="login-btn">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
        
        <div class="register-link">
          还没有账号？<a href="#" @click.prevent="$emit('switch-to-register')">立即注册</a>
        </div>
      </form>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface LoginData {
  username: string
  password: string
}

const loginData = ref<LoginData>({
  username: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const rememberMe = ref(false)

const emit = defineEmits<{
  'login-success': [user: any]
}>()

const handleLogin = async () => {
  if (!loginData.value.username || !loginData.value.password) {
    errorMessage.value = '请填写用户名和密码'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: loginData.value.username,
        password: loginData.value.password
      })
    })

    const data = await response.json()

    if (response.ok) {
      // 登录成功
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.userInfo))
      
      // 通知父组件登录成功
      emit('login-success', data.userInfo)
    } else {
      // 登录失败
      errorMessage.value = data.error || '登录失败，请检查用户名和密码'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 420px;
}

.form-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.form-header h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
}

.login-form-content {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #5a6c7d;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #bdc3c7;
  border-radius: 3px;
  margin-right: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark {
  background-color: #3498db;
  border-color: #3498db;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.forgot-password {
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #2980b9;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2980b9, #21618c);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.login-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.register-link {
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.register-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #fee;
  color: #c0392b;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  font-size: 0.9rem;
  border-left: 4px solid #e74c3c;
}
</style>