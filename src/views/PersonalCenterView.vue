<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getUserInfo } from '@/api/user'
import TopHeader from '@/components/Common/TopHeader.vue'
import MainNavigation from '@/components/Common/MainNavigation.vue'
import BottomFooter from '@/components/Common/BottomFooter.vue'
import OrderList from '@/components/Personal/OrderList.vue'
import PassengerManagement from '@/components/Personal/PassengerManagement.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeMenu = ref('userInfo')

const menuItems = [
  { id: 'userInfo', label: '个人信息' },
  { id: 'orders', label: '我的订单' },
  { id: 'passengers', label: '乘车人管理' },
  { id: 'security', label: '账号安全' }
]

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  if (route.query.tab) {
    activeMenu.value = route.query.tab as string
  }

  try {
    const response = await getUserInfo()
    if (response.data) {
      authStore.user = { ...authStore.user, ...response.data }
      // Update local storage to keep it in sync
      localStorage.setItem('userInfo', JSON.stringify(authStore.user))
    }
  } catch (error: any) {
    console.error('Failed to fetch user info', error)
    if (error.response?.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  }
})

watch(() => route.query.tab, (newTab) => {
  if (newTab) activeMenu.value = newTab as string
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="personal-center-page">
    <TopHeader />
    <MainNavigation />
    
    <div class="main-container">
      <div class="breadcrumb">
        首页 > 个人中心 > {{ menuItems.find(item => item.id === activeMenu)?.label }}
      </div>
      
      <div class="content-wrapper">
        <!-- Sidebar -->
        <div class="sidebar">
          <div class="sidebar-title">我的12306</div>
          <ul class="sidebar-menu">
            <li 
              v-for="item in menuItems" 
              :key="item.id"
              :class="{ active: activeMenu === item.id }"
              @click="activeMenu = item.id"
            >
              {{ item.label }}
            </li>
          </ul>
        </div>
        
        <!-- Main Content Area -->
        <div class="main-content">
          <!-- User Info Panel -->
          <div v-if="activeMenu === 'userInfo'" class="panel user-info-panel">
            <div class="panel-header">
              <h3>个人信息</h3>
            </div>
            <div class="panel-body">
              <div class="info-group">
                <div class="info-item">
                  <span class="label">用户名：</span>
                  <span class="value">{{ authStore.user?.username || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">姓名：</span>
                  <span class="value">{{ authStore.user?.name || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">证件类型：</span>
                  <span class="value">{{ authStore.user?.id_type === 'id_card' ? '居民身份证' : (authStore.user?.id_type === 'passport' ? '护照' : '其他') }}</span>
                </div>
                <div class="info-item">
                  <span class="label">证件号码：</span>
                  <span class="value">{{ authStore.user?.id_no || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">手机号：</span>
                  <span class="value">{{ authStore.user?.mobile || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">邮箱：</span>
                  <span class="value">{{ authStore.user?.email || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">旅客类型：</span>
                  <span class="value">成人</span>
                </div>
              </div>
              
              <div class="action-buttons">
                <button class="btn-primary">修改基本信息</button>
              </div>
            </div>
          </div>
          
          <!-- Orders Panel -->
          <div v-if="activeMenu === 'orders'" class="panel">
            <div class="panel-header">
              <h3>我的订单</h3>
            </div>
            <div class="panel-body">
              <OrderList />
            </div>
          </div>
          
          <!-- Passengers Panel -->
          <div v-if="activeMenu === 'passengers'" class="panel">
            <div class="panel-header">
              <h3>乘车人管理</h3>
            </div>
            <div class="panel-body">
              <PassengerManagement />
            </div>
          </div>
          
          <!-- Security Panel (Placeholder) -->
          <div v-else class="panel">
            <div class="panel-header">
              <h3>账号安全</h3>
            </div>
            <div class="panel-body">
              <div class="security-item">
                <span class="label">登录密码</span>
                <span class="status secure">已设置</span>
                <button class="btn-link">修改</button>
              </div>
              <div class="security-item">
                <span class="label">手机核验</span>
                <span class="status secure">已通过</span>
                <button class="btn-link">查看</button>
              </div>
              <div class="logout-section">
                <button class="btn-danger" @click="handleLogout">退出登录</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <BottomFooter />
  </div>
</template>

<style scoped lang="scss">
.personal-center-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.main-container {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.breadcrumb {
  padding: 15px 0;
  color: #666;
  font-size: 14px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.sidebar {
  width: 200px;
  background: #fff;
  border: 1px solid #ddd;
  
  .sidebar-title {
    background: #3b99fc;
    color: #fff;
    padding: 15px;
    font-size: 16px;
    font-weight: bold;
  }
  
  .sidebar-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      padding: 12px 20px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
      color: #333;
      font-size: 14px;
      
      &:hover {
        background-color: #f9f9f9;
        color: #3b99fc;
      }
      
      &.active {
        background-color: #3b99fc;
        color: #fff;
      }
    }
  }
}

.main-content {
  flex: 1;
  background: #fff;
  border: 1px solid #ddd;
  min-height: 500px;
  padding: 20px;
  
  .panel-header {
    border-bottom: 2px solid #3b99fc;
    padding-bottom: 10px;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #3b99fc;
      font-size: 18px;
    }
  }
  
  .info-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 30px;
    
    .info-item {
      display: flex;
      align-items: center;
      
      .label {
        width: 100px;
        color: #666;
        text-align: right;
        margin-right: 15px;
      }
      
      .value {
        color: #333;
        font-weight: 500;
      }
    }
  }
  
  .empty-state {
    text-align: center;
    padding: 50px 0;
    color: #999;
    
    p {
      margin-bottom: 20px;
    }
  }
  
  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    
    .status {
      &.secure {
        color: #28a745;
      }
    }
  }
  
  .logout-section {
    margin-top: 40px;
    border-top: 1px solid #eee;
    padding-top: 20px;
    text-align: center;
  }
}

.btn-primary {
  background-color: #ff9a00;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #e68a00;
  }
}

.btn-danger {
  background-color: #dc3545;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #c82333;
  }
}

.btn-link {
  background: none;
  border: none;
  color: #3b99fc;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>
