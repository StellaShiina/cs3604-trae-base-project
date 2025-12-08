<template>
  <div class="train-list-top-bar">
    <div class="train-list-top-container">
      <!-- Logo区域 -->
      <div class="train-list-logo-section" @click="handleLogoClick">
        <img 
          src="/images/logo.png" 
          alt="中国铁路12306" 
          class="train-list-logo-image"
        />
        <div class="train-list-logo-text">
          <div class="train-list-logo-chinese">中国铁路12306</div>
          <div class="train-list-logo-english">12306 CHINA RAILWAY</div>
        </div>
      </div>

      <!-- 搜索框 -->
      <div class="train-list-search-box">
        <input
          type="text"
          class="train-list-search-input"
          placeholder="搜索车票、餐饮、常旅客、相关规章"
          :value="searchText"
          @input="e => searchText = (e.target as HTMLInputElement).value"
          @keypress="handleSearchKeyPress"
        />
        <button class="train-list-search-button" @click="handleSearch">
          <img src="/images/search.svg" alt="搜索" class="train-list-search-icon" />
        </button>
      </div>

      <!-- 右侧链接区域 -->
      <div class="train-list-top-links">
        <a href="#" class="train-list-top-link">无障碍</a>
        <a href="#" class="train-list-top-link">敬老版</a>
        <a href="#" class="train-list-top-link">English</a>
        <a href="#" class="train-list-top-link" @click="handleMy12306Click">我的12306</a>
        
        <template v-if="!isLoggedIn">
          <span class="train-list-welcome-text">
            您好，请<router-link to="/login" class="train-list-auth-link">登录</router-link>
          </span>
          <router-link to="/register" class="train-list-auth-link">注册</router-link>
        </template>
        <template v-else>
          <span class="train-list-welcome-text">
            您好，<span class="train-list-username">{{ username }}</span>
          </span>
          <span class="train-list-divider">|</span>
          <button class="train-list-logout-button" @click="handleLogout">退出</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  isLoggedIn: boolean;
  username?: string;
}>();

const emit = defineEmits<{
  (e: 'logout'): void;
  (e: 'my12306Click'): void;
}>();

const router = useRouter();
const searchText = ref('');

const handleLogoClick = () => {
  router.push('/');
};

const handleSearch = () => {
  if (searchText.value.trim()) {
    console.log('搜索:', searchText.value);
  }
};

const handleSearchKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSearch();
  }
};

const handleLogout = () => {
  emit('logout');
};

const handleMy12306Click = (e: Event) => {
  e.preventDefault();
  emit('my12306Click');
};
</script>

<style>
/* 车次列表页顶部栏样式 - 基于HomeTopBar，宽度稍小 */
.train-list-top-bar {
  width: 100%;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 101;
}

.train-list-top-container {
  max-width: 1300px;  /* 比首页的1400px小一些 */
  margin: 0 auto;
  padding: 12px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo区域 */
.train-list-logo-section {
  display: flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  flex-shrink: 0;
  margin-right: 20px;
}

.train-list-logo-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.train-list-logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.train-list-logo-chinese {
  font-size: 22px;
  font-weight: bold;
  color: #333333;
  letter-spacing: 1.3px;
  line-height: 1.2;
}

.train-list-logo-english {
  font-size: 15px;
  color: #999999;
  letter-spacing: 0.1px;
  line-height: 1.2;
}

/* 搜索框 */
.train-list-search-box {
  flex: 1;
  max-width: 420px;
  display: flex;
  align-items: center;
  position: relative;
  margin: 0 auto;
}

.train-list-search-input {
  width: 100%;
  height: 36px;
  padding: 0 50px 0 16px;
  border: 1px solid #d0d0d0;
  border-radius: 0px;
  font-size: 13px;
  color: #333333;
  outline: none;
  transition: all 0.3s;
}

.train-list-search-input::placeholder {
  color: #999999;
  font-size: 13px;
}

.train-list-search-input:focus {
  border-color: #3B99FC;
  box-shadow: 0 0 0 2px rgba(59, 153, 252, 0.1);
}

.train-list-search-button {
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
}

.train-list-search-button:hover {
  background: #0082fc;
}

.train-list-search-button:active {
  background: #2a88eb;
}

.train-list-search-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
  background-color: #3B99FC;
}

/* 右侧链接区域 */
.train-list-top-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.train-list-top-link {
  color: #3B99FC;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
  white-space: nowrap;
  padding: 0 10px;
  position: relative;
}

.train-list-top-link::after {
  content: '';
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 12px;
  background-color: #3B99FC;
}

.train-list-top-link:last-of-type::after {
  display: block;
}

.train-list-top-link:hover {
  color: #2a88eb;
  text-decoration: underline;
}

/* 欢迎文本和认证链接 */
.train-list-welcome-text {
  font-size: 14px;
  color: #666666;
  margin-left: 8px;
  margin-right: 0;
}

.train-list-username {
  font-size: 14px;
  color: #2196f3;
  font-weight: 500;
  margin: 0 4px 0 0;
}

.train-list-divider {
  font-size: 14px;
  color: #333333;
  margin: 0 4px;
}

.train-list-logout-button {
  background: none;
  border: none;
  color: #3B99FC;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
  white-space: nowrap;
}

.train-list-logout-button:hover {
  color: #2a88eb;
  text-decoration: underline;
}

.train-list-logout-button:active {
  color: #1976d2;
}

.train-list-auth-link {
  color: #2196f3;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  padding: 0 4px;
  transition: all 0.2s;
  white-space: nowrap;
}

.train-list-auth-link:hover {
  color: #1976d2;
  text-decoration: underline;
}

.train-list-auth-link:active {
  color: #0d47a1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .train-list-top-bar {
    padding: 12px 0;
  }

  .train-list-top-container {
    padding: 0 15px;
  }

  .train-list-logo-image {
    width: 40px;
    height: 40px;
  }

  .train-list-logo-chinese {
    font-size: 16px;
  }

  .train-list-logo-english {
    font-size: 11px;
  }

  .train-list-welcome-text,
  .train-list-username,
  .train-list-auth-link,
  .train-list-top-link {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .train-list-top-bar {
    padding: 10px 0;
  }

  .train-list-top-container {
    padding: 0 10px;
  }

  .train-list-logo-section {
    gap: 8px;
  }

  .train-list-logo-image {
    width: 36px;
    height: 36px;
  }

  .train-list-logo-chinese {
    font-size: 14px;
  }

  .train-list-logo-english {
    font-size: 10px;
  }

  .train-list-welcome-text {
    display: none;
  }

  .train-list-auth-link,
  .train-list-top-link {
    font-size: 12px;
    padding: 3px 8px;
  }
}
</style>
