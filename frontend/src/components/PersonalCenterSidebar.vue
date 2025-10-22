<template>
  <div class="sidebar">
    <div class="user-info">
      <div class="avatar">
        {{ userInitial }}
      </div>
      <div class="user-details">
        <div class="username">{{ username || '用户' }}</div>
        <div class="user-status">已认证用户</div>
      </div>
    </div>
    
    <nav class="nav-menu">
      <ul>
        <li>
          <a 
            href="#" 
            :class="{ active: activeItem === 'profile' }"
            @click="setActive('profile')"
          >
            <span class="menu-icon">👤</span>
            <span class="menu-text">个人信息</span>
          </a>
        </li>
        <li>
          <a 
            href="#" 
            :class="{ active: activeItem === 'passengers' }"
            @click="setActive('passengers')"
          >
            <span class="menu-icon">👥</span>
            <span class="menu-text">乘客管理</span>
          </a>
        </li>
        <li>
          <a 
            href="#" 
            :class="{ active: activeItem === 'orders' }"
            @click="setActive('orders')"
          >
            <span class="menu-icon">📋</span>
            <span class="menu-text">订单管理</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  username?: string
}>()

const emit = defineEmits<{
  menuSelect: [item: string]
}>()

const activeItem = ref('profile')

const userInitial = computed(() => {
  // TODO: Get user initial from actual user data
  return props.username ? props.username.charAt(0).toUpperCase() : 'U'
})

const setActive = (item: string) => {
  activeItem.value = item
  emit('menuSelect', item)
  
  // TODO: Implement navigation logic
  console.log(`Navigate to ${item} - not implemented yet`)
}
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  border-right: 1px solid #dee2e6;
  padding: 0;
  height: 100%;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.user-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid #dee2e6;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 1rem;
  border: 3px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.user-details {
  text-align: center;
}

.username {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.user-status {
  font-size: 0.9rem;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  display: inline-block;
}

.nav-menu {
  padding: 1.5rem 0;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-menu li {
  margin-bottom: 0.5rem;
}

.nav-menu a {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: #495057;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  font-weight: 500;
}

.nav-menu a:hover {
  background-color: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-left-color: #667eea;
  transform: translateX(5px);
}

.nav-menu a.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
  border-left-color: #667eea;
  font-weight: 600;
}

.menu-icon {
  font-size: 1.2rem;
  margin-right: 1rem;
  width: 24px;
  text-align: center;
}

.menu-text {
  font-size: 1rem;
}

/* 添加一些动画效果 */
.nav-menu a {
  position: relative;
  overflow: hidden;
}

.nav-menu a::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-menu a:hover::before {
  left: 100%;
}
</style>