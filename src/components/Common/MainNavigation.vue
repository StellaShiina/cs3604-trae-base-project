<template>
  <nav class="main-navigation">
    <div class="nav-container">
      <router-link to="/" class="nav-item" :class="{ active: isHomePage }">首页</router-link>
      <router-link to="/search" class="nav-item" :class="{ active: isTrainsPage }">
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
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isHomePage = computed(() => route.path === '/');

const isTrainsPage = computed(() => {
  const path = route.path;
  return path === '/trains' 
    || path === '/search'
    || path === '/order' 
    || path === '/orders' 
    || path === '/personal-info' 
    || path === '/phone-verification' 
    || path === '/passengers';
});
</script>

<style lang="scss" scoped>
.main-navigation {
  width: 100%;
  background-color: #3b99fc;
  height: 40px;
}

.nav-container {
  width: 1200px; /* Standard 12306 width */
  margin: 0 auto;
  display: flex;
  height: 100%;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  height: 100%;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #2577e3;
  }
  
  &.active {
    background-color: #1a65c4; /* Darker blue for active state */
  }
}

.nav-arrow {
  font-size: 10px;
  margin-left: 4px;
  opacity: 0.8;
}

/* Responsive adjustment */
@media (max-width: 1200px) {
  .nav-container {
    width: 100%;
    padding: 0 20px;
  }
}
</style>
