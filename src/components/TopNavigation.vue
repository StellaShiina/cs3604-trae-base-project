<template>
  <div class="top-nav">
    <div class="nav-content">
      <div class="logo-section" @click="$router.push('/')">
        <img src="/logo.png" alt="12306" height="40" />
        <span>中国铁路12306</span>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link" :class="{ active: currentRoute === '/' }">首页</router-link>
        <router-link to="/trains" class="nav-link" :class="{ active: currentRoute === '/trains' }">车票</router-link>
        <span class="divider">|</span>
        <template v-if="authStore.token">
           <span class="user-info">欢迎您</span>
           <a href="#" @click.prevent="logout" class="nav-link">退出</a>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">登录</router-link>
          <router-link to="/register" class="nav-link">注册</router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const currentRoute = computed(() => route.path)

const logout = () => {
  authStore.clearToken()
  router.push('/login')
}
</script>

<style scoped>
.top-nav {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.nav-content {
  width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
  color: #0078d7;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-size: 14px;
}

.nav-link:hover {
  color: #0078d7;
}

.nav-link.active {
  color: #0078d7;
  font-weight: bold;
}

.divider {
  color: #ddd;
}

.user-info {
  color: #666;
  font-size: 14px;
}
</style>
