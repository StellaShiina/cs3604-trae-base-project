<template>
  <nav class="main-navigation">
    <div class="nav-container">
      <router-link to="/" class="nav-item" :class="{ active: isHomePage }">首页</router-link>
      
      <!-- 车票 Dropdown -->
      <div class="nav-item-container">
        <router-link to="/search" class="nav-item" :class="{ active: isTrainsPage }">
          车票 <span class="nav-arrow">▼</span>
        </router-link>
        
        <div class="dropdown-menu">
          <div class="dropdown-content">
            <!-- 购买 Column -->
            <div class="dropdown-column">
              <div class="dropdown-header">购买</div>
              <ul class="dropdown-list">
                <li><router-link to="/search?tripType=single">单程</router-link></li>
                <li><router-link to="/search?tripType=round">往返</router-link></li>
                <li><a href="#">中转换乘</a></li>
                <li><a href="#">计次·定期票</a></li>
              </ul>
            </div>
            
            <!-- 变更 Column -->
            <div class="dropdown-column">
              <div class="dropdown-header">变更</div>
              <ul class="dropdown-list">
                <li><a href="#">退票</a></li>
                <li><a href="#">改签</a></li>
                <li><a href="#">变更到站</a></li>
              </ul>
            </div>
            
            <!-- 更多 Column -->
            <div class="dropdown-column">
              <div class="dropdown-header">更多</div>
              <ul class="dropdown-list">
                <li><a href="#">中铁银通卡</a></li>
                <li><a href="#">国际列车</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

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

.nav-item-container {
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;

  &:hover {
    .nav-item {
      background-color: #2577e3;
    }
    .dropdown-menu {
      display: block;
    }
  }
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 40px; /* Match navbar height */
  left: 0;
  background-color: #ffffff;
  border: 1px solid #d0d0d0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 380px;
  padding: 15px 0;
}

.dropdown-content {
  display: flex;
}

.dropdown-column {
  flex: 1;
  padding: 0 15px;
  border-right: 1px dashed #e0e0e0;
  min-width: 100px;

  &:last-child {
    border-right: none;
  }
}

.dropdown-header {
  color: #3b99fc;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}

.dropdown-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 8px;
    line-height: 1.5;

    a {
      color: #333333;
      text-decoration: none;
      font-size: 12px;
      display: block;

      &:hover {
        color: #3b99fc;
        text-decoration: underline;
      }
    }
  }
}

/* Responsive adjustment */
@media (max-width: 1200px) {
  .nav-container {
    width: 100%;
    padding: 0 20px;
  }
}
</style>
