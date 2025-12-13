<template>
  <div class="home-page">
    <!-- 顶部导航栏 -->
    <TopNavigation />

    <!-- Banner 区域 -->
    <div class="banner">
      <div class="search-box-placeholder">
        <h2>车票查询</h2>
        <div class="search-form">
          <el-button type="primary" size="large" @click="goToSearch">查询车票</el-button>
        </div>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="main-content">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>铁路旅游</span>
          </div>
        </template>
        <div class="card-body">
          <p>热门线路推荐...</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import TopNavigation from '../components/TopNavigation.vue'

const authStore = useAuthStore()
const router = useRouter()

const goToSearch = () => {
  router.push('/trains')
}
</script>

<style scoped>
.home-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}



.banner {
  height: 400px;
  background: linear-gradient(135deg, #0078d7 0%, #00b4d8 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.search-box-placeholder {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
  color: #333;
}

.main-content {
  width: 1200px;
  margin: 20px auto;
}

.info-card {
  min-height: 200px;
}
</style>
