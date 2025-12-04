<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useUserStore } from './stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-blue-600 text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <RouterLink to="/" class="text-xl font-bold hover:text-blue-100">12306 Demo</RouterLink>
        <nav class="flex items-center space-x-4">
          <RouterLink to="/" class="hover:text-blue-100">首页</RouterLink>
          
          <template v-if="userStore.isLoggedIn">
            <span class="text-blue-100">欢迎, {{ userStore.user?.name || userStore.user?.username }}</span>
            <button @click="handleLogout" class="hover:text-blue-100">退出</button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="hover:text-blue-100">登录</RouterLink>
            <RouterLink to="/register" class="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-50">注册</RouterLink>
          </template>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>
