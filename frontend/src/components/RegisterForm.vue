<template>
  <div class="register-container">
    <div class="register-form">
      <div class="form-header">
        <h2>注册12306</h2>
        <p class="subtitle">中国铁路客户服务中心</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form-content">
        <div class="form-row">
          <div class="form-group">
            <label for="username">用户名 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                id="username"
                v-model="registerData.username"
                type="text"
                placeholder="请输入用户名"
                required
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="email">邮箱 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                id="email"
                v-model="registerData.email"
                type="email"
                placeholder="请输入邮箱地址"
                required
                class="form-input"
              />
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="password">密码 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                id="password"
                v-model="registerData.password"
                type="password"
                placeholder="请输入密码"
                required
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">确认密码 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                id="confirmPassword"
                v-model="registerData.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                required
                class="form-input"
              />
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="phone">手机号</label>
            <div class="input-wrapper">
              <input
                id="phone"
                v-model="registerData.phone"
                type="tel"
                placeholder="请输入手机号"
                class="form-input"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="realName">真实姓名</label>
            <div class="input-wrapper">
              <input
                id="realName"
                v-model="registerData.realName"
                type="text"
                placeholder="请输入真实姓名"
                class="form-input"
              />
            </div>
          </div>
        </div>
        
        <div class="form-group full-width">
          <label for="idCard">身份证号</label>
          <div class="input-wrapper">
            <input
              id="idCard"
              v-model="registerData.idCard"
              type="text"
              placeholder="请输入身份证号"
              class="form-input"
            />
          </div>
        </div>
        
        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="agreeTerms" required>
            <span class="checkmark"></span>
            我已阅读并同意<a href="#" class="terms-link">《用户协议》</a>和<a href="#" class="terms-link">《隐私政策》</a>
          </label>
        </div>
        
        <button type="submit" :disabled="isLoading || !agreeTerms" class="register-btn">
          {{ isLoading ? '注册中...' : '立即注册' }}
        </button>
        
        <div class="login-link">
          已有账号？<a href="#" @click.prevent="$emit('switch-to-login')">立即登录</a>
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

interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  realName: string
  idCard: string
}

const registerData = ref<RegisterData>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  realName: '',
  idCard: ''
})

const isLoading = ref(false)
const errorMessage = ref('')
const agreeTerms = ref(false)

const emit = defineEmits<{
  'register-success': [user: any]
}>()

const handleRegister = async () => {
  // 表单验证
  if (!registerData.value.username || !registerData.value.email || !registerData.value.password) {
    errorMessage.value = '请填写所有必填字段'
    return
  }

  if (registerData.value.password !== registerData.value.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }

  if (registerData.value.password.length < 6) {
    errorMessage.value = '密码长度至少6位'
    return
  }

  if (!agreeTerms.value) {
    errorMessage.value = '请同意用户协议和隐私政策'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:8080/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: registerData.value.username,
        email: registerData.value.email,
        password: registerData.value.password,
        confirmPassword: registerData.value.confirmPassword,
        phoneNumber: registerData.value.phone,
        realName: registerData.value.realName,
        idType: '身份证',
        idNumber: registerData.value.idCard,
        passengerType: '成人',
        agreeTerms: agreeTerms.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      // 注册成功，自动登录
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      
      // 通知父组件注册成功
      emit('register-success', data.user || { username: registerData.value.username })
    } else {
      // 注册失败
      errorMessage.value = data.error || '注册失败，请稍后重试'
    }
  } catch (error) {
    console.error('Register error:', error)
    errorMessage.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 600px;
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

.register-form-content {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group.full-width {
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.required {
  color: #e74c3c;
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
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  color: #5a6c7d;
  line-height: 1.5;
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
  margin-top: 2px;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
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

.terms-link {
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

.register-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.register-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #229954, #1e8449);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
}

.register-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-link {
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.login-link a {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
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

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .form-row .form-group {
    margin-bottom: 1.5rem;
  }
  
  .register-form {
    padding: 2rem 1.5rem;
  }
}
</style>