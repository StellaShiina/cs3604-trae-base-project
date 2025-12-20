<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  showWelcomeLogin?: boolean
}>()

const emit = defineEmits<{
  (e: 'logoClick'): void
}>()

const authStore = useAuthStore()
const router = useRouter()
const searchText = ref('')

const handleLogoClick = () => {
  emit('logoClick')
  router.push('/')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const handleMy12306Click = () => {
  if (authStore.isAuthenticated) {
    router.push('/personal-center')
  } else {
    router.push('/login')
  }
}

const handleSearch = () => {
  if (searchText.value.trim()) {
    console.log('搜索:', searchText.value)
    // Implement search functionality here if needed
  }
}

const handleSearchKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch()
  }
}
</script>

<template>
  <div class="top-header">
    <div class="header-content">
      <div class="logo-wrapper" @click="handleLogoClick">
        <img src="/images/logo.png" alt="China Railway 12306" class="logo-img" />
        <div class="logo-texts">
          <div class="logo-cn">中国铁路12306</div>
          <div class="logo-en">12306 CHINA RAILWAY</div>
        </div>
        <div v-if="props.showWelcomeLogin" class="welcome-msg">欢迎登录12306</div>
      </div>
      
      <div v-if="!props.showWelcomeLogin" class="right-section">
        <!-- Search Box -->
        <div class="search-box">
          <input
            type="text"
            class="search-input"
            placeholder="搜索车票、餐饮、常旅客、相关规章"
            v-model="searchText"
            @keypress="handleSearchKeyPress"
          />
          <button class="search-button" @click="handleSearch">
            <img src="/images/search.svg" alt="搜索" class="search-icon" />
          </button>
        </div>

        <!-- Links -->
        <div class="top-links">
          <a href="#" class="top-link">无障碍</a>
          <a href="#" class="top-link">敬老版</a>
          <a href="#" class="top-link">English</a>
          <a href="#" class="top-link" @click.prevent="handleMy12306Click">我的12306</a>
          
          <template v-if="authStore.isAuthenticated">
            <span class="greeting">
              您好，<span class="username">{{ authStore.user?.name || authStore.user?.username || '用户' }}</span>
            </span>
            <span class="separator">|</span>
            <a href="#" class="link-btn logout-btn" @click.prevent="handleLogout">退出</a>
          </template>
          <template v-else>
            <router-link to="/login" class="link-btn auth-btn">登录</router-link>
            <router-link to="/register" class="link-btn auth-btn">注册</router-link>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.top-header {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: 84px;
  display: flex;
  align-items: center;

  .header-content {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: 2px;
      cursor: pointer;
      flex-shrink: 0;

      .logo-img {
        width: 60px;
        height: 60px;
        object-fit: contain;
      }

      .logo-texts {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .logo-cn {
          font-size: 22px;
          font-weight: bold;
          color: #333333;
          letter-spacing: 1.3px;
          line-height: 1.2;
        }

        .logo-en {
          font-size: 15px;
          color: #999999;
          letter-spacing: 0.1px;
          line-height: 1.2;
        }
      }

      .welcome-msg {
        margin-left: 30px;
        font-size: 20px;
        font-weight: 500;
        color: #4f4f4f;
      }
    }

    .right-section {
      display: flex;
      align-items: center;
      gap: 20px;
      flex: 1;
      justify-content: flex-end;
    }

    .search-box {
      flex: 1;
      max-width: 480px;
      display: flex;
      align-items: center;
      position: relative;
      margin-right: 20px;

      .search-input {
        width: 100%;
        height: 36px;
        padding: 0 50px 0 16px;
        border: 1px solid #d0d0d0;
        border-radius: 0px;
        font-size: 13px;
        color: #333333;
        outline: none;
        transition: all 0.3s;

        &::placeholder {
          color: #999999;
          font-size: 13px;
        }

        &:focus {
          border-color: #3B99FC;
          box-shadow: 0 0 0 2px rgba(59, 153, 252, 0.1);
        }
      }

      .search-button {
        position: absolute;
        right: 0;
        top: 0;
        width: 42px;
        height: 36px;
        background: #3B99FC;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        border-radius: 0;

        &:hover {
          background: #0082fc;
        }

        &:active {
          background: #2a88eb;
        }

        .search-icon {
          width: 30px;
          height: 30px;
          object-fit: contain;
        }
      }
    }

    .top-links {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;

      .top-link {
        color: #3B99FC;
        text-decoration: none;
        font-size: 14px;
        transition: color 0.3s;
        white-space: nowrap;
        padding: 0 10px;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          right: -5px;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 12px;
          background-color: #3B99FC;
        }

        &:last-of-type::after {
          display: block; // Keep divider for the next element (Greeting/Login)
        }

        &:hover {
          color: #2a88eb;
          text-decoration: underline;
        }
      }

      .greeting {
        font-size: 14px;
        color: #666666;
        margin-left: 10px;
        
        .username {
          color: #2196f3;
          font-weight: 500;
        }
      }

      .separator {
        color: #cccccc;
        font-size: 14px;
        margin: 0 5px;
      }

      .link-btn {
        font-size: 14px;
        text-decoration: none;
        padding: 0 10px;
        transition: all 0.3s;
        cursor: pointer;

        &.auth-btn {
          color: #999999;
          &:hover {
            color: #666666;
            text-decoration: underline;
          }
        }

        &.logout-btn {
          color: #3B99FC;
          padding: 0;
          &:hover {
            color: #2a88eb;
            text-decoration: underline;
          }
        }
      }
    }
  }
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .top-header .header-content {
    padding: 0 30px;
  }
  .search-box {
    max-width: 380px !important;
  }
}

@media (max-width: 1024px) {
  .top-header {
    height: auto;
    padding: 10px 0;
  }
  .top-header .header-content {
    flex-wrap: wrap;
    gap: 15px;
  }
  .search-box {
    max-width: 300px !important;
  }
}
</style>
