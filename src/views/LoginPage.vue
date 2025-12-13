<template>
  <div class="login-page">
    <div class="header">
      <div class="logo-section" @click="goHome">
        <img src="/logo.png" alt="中国铁路12306" height="48" />
        <span class="logo-text">中国铁路12306</span>
      </div>
      <div class="welcome-text">欢迎登录12306</div>
    </div>
    
    <div class="login-content">
      <div class="login-banner"></div>
      <div class="login-form-container">
        <div class="form-header">
          <h3>账户登录</h3>
        </div>
        <el-form :model="form" @submit.prevent="handleLogin" size="large">
          <el-form-item>
            <el-input v-model="form.username" placeholder="用户名/邮箱/手机号">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" placeholder="密码">
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" native-type="submit" @click="handleLogin" class="submit-btn" :loading="loading">
              立即登录
            </el-button>
          </el-form-item>
          <div class="form-footer">
            <router-link to="/register">注册账户</router-link>
            <a href="#">忘记密码？</a>
          </div>
        </el-form>
      </div>
    </div>

    <div class="footer">
      <p>友情链接 | 关于我们 | 网站声明</p>
      <p>Copyright © 2025 中国铁路12306 版权所有</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import request from '../utils/request'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})
const loading = ref(false)

const goHome = () => {
  router.push('/')
}

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const res: any = await request.post('/auth/login', {
      username: form.username,
      password: form.password
    })
    
    if (res.token) {
      authStore.setToken(res.token)
      ElMessage.success('登录成功')
      router.push('/')
    } else {
       // Handle cases where token might be in a different property or response structure is different
       // Assuming standard response for now based on typical patterns
       if (res.code === 200 && res.data?.token) {
          authStore.setToken(res.data.token)
          ElMessage.success('登录成功')
          router.push('/')
       }
    }
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error.response?.data?.message || '登录失败，请检查用户名或密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.header {
  height: 80px;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  color: #0078d7;
}

.welcome-text {
  font-size: 18px;
  color: #666;
}

.login-content {
  flex: 1;
  background: linear-gradient(135deg, #0078d7 0%, #00b4d8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.login-banner {
  width: 500px;
  height: 400px;
  /* background-image: url('/login-bg.png'); */
  background-size: contain;
  background-repeat: no-repeat;
  margin-right: 40px;
}

.login-form-container {
  width: 400px;
  background: #fff;
  padding: 30px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.form-header {
  margin-bottom: 24px;
  text-align: center;
  color: #333;
}

.submit-btn {
  width: 100%;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.form-footer a {
  color: #0078d7;
  text-decoration: none;
}

.footer {
  height: 80px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
  gap: 8px;
}
</style>
