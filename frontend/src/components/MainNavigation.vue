<template>
  <nav class="main-navigation">
    <div class="nav-container">
      <router-link to="/" class="nav-item" :class="{ active: isHomePage }">首页</router-link>
      <router-link to="/trains" class="nav-item" :class="{ active: isTrainsPage }">
        车票 <span class="nav-arrow">▼</span>
      </router-link>
      <a href="#" class="nav-item">团购服务 <span class="nav-arrow">▼</span></a>
      <a href="#" class="nav-item">会员服务 <span class="nav-arrow">▼</span></a>
      <a href="#" class="nav-item">站车服务 <span class="nav-arrow">▼</span></a>
      <a href="#" class="nav-item">商旅服务 <span class="nav-arrow">▼</span></a>
      <a href="#" class="nav-item">出行指南 <span class="nav-arrow">▼</span></a>
      <a href="#" class="nav-item">信息查询 <span class="nav-arrow">▼</span></a>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isHomePage = computed(() => route.path === '/')

const isTrainsPage = computed(() => {
  const path = route.path
  return path === '/trains' || 
         path === '/order' || 
         path.startsWith('/order/') ||
         path === '/orders' || 
         path === '/personal-info' || 
         path === '/phone-verification' || 
         path === '/passengers'
})
</script>

<style>
/* 主导航栏样式 - 12306蓝色导航 */
.main-navigation {
  background: #3B99FC;
  border-bottom: 1px solid #2a88eb;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: stretch;
  height: 45px;
  padding: 0 40px;
}

/* 导航项目 */
.nav-item {
  color: white;
  text-decoration: none;
  padding: 0 24px;
  font-size: 16px;
  font-weight: normal;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  white-space: nowrap;
  flex: 1;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item:first-child {
  border-left: none;
}

.nav-item:hover {
  background: #2676E3;
  color: #ffffff;
}

.nav-item.active {
  background: #2676E3;
  font-weight: normal;
  color: #ffffff;
}

/* 导航箭头 */
.nav-arrow {
  margin-left: 4px;
  font-size: 10px;
  opacity: 0.8;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .nav-container {
    overflow-x: auto;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
    padding: 0 15px;
  }

  .nav-container::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  .nav-item {
    padding: 0 12px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 10px;
  }

  .nav-item {
    padding: 0 10px;
    font-size: 13px;
  }

  .nav-arrow {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .main-navigation {
    height: auto;
  }

  .nav-container {
    height: auto;
    flex-wrap: wrap;
    padding: 8px 10px;
  }

  .nav-item {
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style>