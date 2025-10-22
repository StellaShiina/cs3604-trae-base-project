<template>
  <div id="app">
    <header class="app-header">
      <h1>12306 铁路订票系统</h1>
      <nav v-if="isLoggedIn" class="nav-menu">
        <button 
          @click="activeView = 'search'" 
          :class="{ active: activeView === 'search' }"
          class="nav-btn"
        >
          车票查询
        </button>
        <button 
          @click="activeView = 'profile'" 
          :class="{ active: activeView !== 'search' }"
          class="nav-btn"
        >
          个人中心
        </button>
        <button @click="logout" class="logout-btn">退出登录</button>
      </nav>
    </header>
    
    <main class="app-main">
      <!-- Login/Register View -->
      <div v-if="!isLoggedIn" class="auth-container">
        <div class="auth-tabs">
          <button 
            :class="{ active: authMode === 'login' }"
            @click="authMode = 'login'"
          >
            登录
          </button>
          <button 
            :class="{ active: authMode === 'register' }"
            @click="authMode = 'register'"
          >
            注册
          </button>
        </div>
        
        <LoginForm v-if="authMode === 'login'" @login-success="handleLoginSuccess" />
        <RegisterForm v-else @register-success="handleRegisterSuccess" />
      </div>
      
      <!-- Main Application View -->
      <div v-else class="main-app">
        <!-- Ticket Search (Home) -->
        <TicketSearch v-if="activeView === 'search'" />
        
        <!-- Personal Center -->
        <div v-else class="personal-center">
          <PersonalCenterSidebar 
            :username="currentUser?.username"
            @menu-select="activeView = $event" 
          />
          
          <div class="content-area">
            <UserProfileView v-if="activeView === 'profile'" :user="currentUser" />
            <PassengerManagement v-else-if="activeView === 'passengers'" />
            <OrderManagement v-else-if="activeView === 'orders'" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'
import TicketSearch from './components/TicketSearch.vue'
import PersonalCenterSidebar from './components/PersonalCenterSidebar.vue'
import UserProfileView from './components/UserProfileView.vue'
import PassengerManagement from './components/PassengerManagement.vue'
import OrderManagement from './components/OrderManagement.vue'

interface User {
  id: number
  username: string
  email: string
}

const isLoggedIn = ref(false)
const authMode = ref<'login' | 'register'>('login')
const activeView = ref('search')
const currentUser = ref<User | null>(null)

// 检查本地存储中是否有用户信息
const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  
  if (token && userStr && userStr !== 'undefined') {
    try {
      const user = JSON.parse(userStr)
      currentUser.value = user
      isLoggedIn.value = true
    } catch (error) {
      console.error('Failed to parse user data:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}

// 页面加载时检查登录状态
checkLoginStatus()

const handleLoginSuccess = (user: User) => {
  currentUser.value = user
  isLoggedIn.value = true
  activeView.value = 'search'
}

const handleRegisterSuccess = (user: User) => {
  currentUser.value = user
  isLoggedIn.value = true
  activeView.value = 'search'
}

const handleMenuSelect = (view: string) => {
  activeView.value = view
}

const logout = () => {
  // 清除本地存储
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  
  // 重置应用状态
  isLoggedIn.value = false
  currentUser.value = null
  activeView.value = 'search'
  authMode.value = 'login'
}

// TODO: Implement authentication state management
// - Check for existing session on app load
// - Handle login/register success
// - Manage user state
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #007bff;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  font-size: 1.5rem;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-btn.active {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.app-main {
  flex: 1;
  display: flex;
}

.auth-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-tabs button {
  padding: 1rem 2rem;
  border: none;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-tabs button.active {
  background-color: #007bff;
  color: white;
}

.personal-center {
  flex: 1;
  display: flex;
  min-height: calc(100vh - 80px);
}

.content-area {
  flex: 1;
  background-color: white;
  overflow-y: auto;
}
</style>