<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
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

const activeMenu = ref('orders') // Default to orders as per screenshot requirement? Or keep logic.

// Define menu structure
const menuGroups = ref([
  {
    id: 'center',
    label: '个人中心',
    type: 'header', // clickable header acting as a link
    path: '/personal',
    items: []
  },
  {
    id: 'order_center',
    label: '订单中心',
    type: 'group',
    expanded: true,
    items: [
      { id: 'orders', label: '火车票订单' },
      { id: 'waitlist', label: '候补订单', disabled: true },
      { id: 'card_ticket', label: '计次·定期票', disabled: true },
      { id: 'appointment', label: '约号订单', disabled: true },
      { id: 'snow_gear', label: '雪具快运订单', disabled: true },
      { id: 'food', label: '餐饮·特产', disabled: true },
      { id: 'insurance', label: '保险订单', disabled: true },
      { id: 'invoice', label: '电子发票', disabled: true }
    ]
  },
  {
    id: 'my_tickets',
    label: '本人车票',
    type: 'header',
    items: []
  },
  {
    id: 'member_center',
    label: '会员中心',
    type: 'header',
    items: []
  },
  {
    id: 'personal_info_group',
    label: '个人信息',
    type: 'group',
    expanded: true,
    items: [
      { id: 'userInfo', label: '查看个人信息' },
      { id: 'security', label: '账号安全' },
      { id: 'phone_verify', label: '手机核验', disabled: true },
      { id: 'account_delete', label: '账号注销', disabled: true }
    ]
  },
  {
    id: 'common_info_group',
    label: '常用信息管理',
    type: 'group',
    expanded: true,
    items: [
       { id: 'passengers', label: '乘车人管理' },
       { id: 'address', label: '地址管理', disabled: true }
    ]
  }
])

// Helper to find label
const currentLabel = computed(() => {
  for (const group of menuGroups.value) {
    if (group.id === activeMenu.value) return group.label
    if (group.items) {
      const item = group.items.find(i => i.id === activeMenu.value)
      if (item) return item.label
    }
  }
  return ''
})

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
        当前位置：个人中心 > {{ currentLabel }}
      </div>
      
      <div class="content-wrapper">
        <!-- Sidebar -->
        <div class="sidebar">
          <div v-for="group in menuGroups" :key="group.id" class="menu-group">
            <div 
              class="group-header" 
              :class="{ 'clickable': group.type === 'header' }"
            >
              <span class="group-title">{{ group.label }}</span>
              <span v-if="group.type === 'group'" class="expand-icon">▼</span>
            </div>
            
            <ul v-if="group.items.length > 0 && group.expanded" class="menu-list">
              <li 
                v-for="item in group.items" 
                :key="item.id"
                :class="{ active: activeMenu === item.id, disabled: item.disabled }"
                @click="!item.disabled && (activeMenu = item.id)"
              >
                {{ item.label }}
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Main Content Area -->
        <div class="main-content">
          <!-- User Info Panel -->
          <div v-if="activeMenu === 'userInfo'" class="panel user-info-panel">
            <!-- Content remains same -->
            <div class="panel-header">
              <h3>查看个人信息</h3>
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
            <!-- OrderList component handles tabs internally now -->
             <!-- We remove the header "我的订单" because tabs in OrderList will serve as header/nav -->
            <div class="panel-body no-padding">
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
          
          <!-- Security Panel -->
          <div v-if="activeMenu === 'security'" class="panel">
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
  font-size: 12px;
}

.content-wrapper {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.sidebar {
  width: 180px;
  background: transparent;
  
  .menu-group {
    margin-bottom: 10px;
    
    .group-header {
      padding: 8px 10px;
      font-weight: bold;
      color: #333;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      &.clickable {
        cursor: pointer;
        &:hover { color: #3b99fc; }
      }
      
      .expand-icon {
        font-size: 10px;
        color: #999;
      }
    }
    
    .menu-list {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        padding: 8px 10px 8px 25px;
        cursor: pointer;
        color: #666;
        font-size: 12px;
        
        &:hover {
          color: #3b99fc;
        }
        
        &.active {
          background-color: #3b99fc;
          color: #fff;
        }
        
        &.disabled {
          color: #ccc;
          cursor: not-allowed;
          &:hover { color: #ccc; background: none; }
        }
      }
    }
  }
}

.main-content {
  flex: 1;
  background: #fff;
  border: 1px solid #e0e0e0;
  min-height: 600px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  .panel-header {
    border-bottom: 1px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #333;
      font-size: 16px;
      font-weight: bold;
    }
  }
  
  .panel-body {
    &.no-padding {
      padding: 0;
    }
  }
  
  // Reused styles
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
        font-size: 14px;
      }
      
      .value {
        color: #333;
        font-weight: 500;
        font-size: 14px;
      }
    }
  }
  
  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    
    .label { font-size: 14px; }
    
    .status {
      font-size: 14px;
      &.secure { color: #28a745; }
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
  padding: 6px 20px;
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
  padding: 6px 20px;
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
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>
