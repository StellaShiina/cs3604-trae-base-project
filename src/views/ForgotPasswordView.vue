<template>
  <div class="forgot-password-page">
    <TopHeader 
      :isLoggedIn="isLoggedIn" 
      :username="username" 
      @my12306Click="handleMy12306Click" 
    />
    <MainNavigation />
    
    <div class="forgot-password-content">
      <div class="recovery-tabs">
        <button
          class="recovery-tab"
          :class="{ active: activeTab === 'face' }"
          @click="activeTab = 'face'"
        >
          <span class="tab-icon">👤</span>
          <span class="tab-text">人脸找回</span>
        </button>
        <button
          class="recovery-tab"
          :class="{ active: activeTab === 'phone' }"
          @click="activeTab = 'phone'"
        >
          <span class="tab-icon">📱</span>
          <span class="tab-text">手机找回</span>
        </button>
        <button
          class="recovery-tab"
          :class="{ active: activeTab === 'email' }"
          @click="activeTab = 'email'"
        >
          <span class="tab-icon">✉️</span>
          <span class="tab-text">邮箱找回</span>
        </button>
      </div>

      <div class="recovery-content-area">
        <PhoneRecovery v-if="activeTab === 'phone'" />
        
        <div v-if="activeTab === 'face'" class="placeholder-content">
          <p>人脸找回功能暂未开放</p>
        </div>
        
        <div v-if="activeTab === 'email'" class="placeholder-content">
          <p>邮箱找回功能暂未开放</p>
        </div>
      </div>
    </div>
    
    <BottomFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TopHeader from '@/components/Common/TopHeader.vue';
import MainNavigation from '@/components/Common/MainNavigation.vue';
import BottomFooter from '@/components/Common/BottomFooter.vue';
import PhoneRecovery from '@/components/ForgotPassword/PhoneRecovery.vue';

const router = useRouter();
const activeTab = ref<'face' | 'phone' | 'email'>('phone');
const isLoggedIn = ref(false);
const username = ref('');

onMounted(() => {
  const token = localStorage.getItem('authToken');
  isLoggedIn.value = !!token;
  if (isLoggedIn.value) {
    username.value = localStorage.getItem('username') || localStorage.getItem('userId') || '用户';
  }
});

const handleMy12306Click = () => {
  if (isLoggedIn.value) {
    router.push('/personal-info');
  } else {
    router.push('/login');
  }
};
</script>

<style lang="scss" scoped>
/* ==================== 密码找回页面容器 ==================== */
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* ==================== 内容区域 ==================== */
.forgot-password-content {
  width: 980px; /* 白色文本框宽度980px */
  height: 552px; /* 白色文本框高度552px */
  margin: 30px auto;
  background: white; /* 白色背景 */
  border-top: none; /* 上方不加边框 */
  border-left: 1px solid #3b99fc; /* 左侧蓝色细线边框 */
  border-right: 1px solid #3b99fc; /* 右侧蓝色细线边框 */
  border-bottom: 1px solid #3b99fc; /* 下侧蓝色细线边框 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* ==================== 导航标签容器 ==================== */
.recovery-tabs {
  display: flex;
  justify-content: space-between;
  gap: 0;
  background: transparent;
  border-radius: 0;
  overflow: hidden;
  width: 980px; /* 导航栏宽度980px */
  height: 70px; /* 导航栏高度70px */
  flex-shrink: 0;
}

/* ==================== 导航标签按钮 ==================== */
.recovery-tab {
  flex: 1; /* 三个按钮平分整个宽度（980px / 3 = 326.67px每个） */
  height: 70px; /* 按钮高度与导航栏一致 */
  padding: 0; /* 移除padding，使用flex居中 */
  background: #3b99fc; /* 未选中状态：深蓝色 */
  border: none;
  border-radius: 0; /* 保持直角，无弧度 */
  cursor: pointer;
  font-size: 20px;
  color: white; /* 白色文字 */
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  box-sizing: border-box;

  &:hover:not(.active) {
    background: #3b99fc; /* 保持深蓝色 */
    color: white;
  }

  &.active {
    background: #87ceeb; /* 选中状态：浅蓝色 */
    color: white;
    font-weight: 500;
  }
}

/* ==================== 标签图标 ==================== */
.tab-icon {
  font-size: 18px;
}

/* ==================== 标签文字 ==================== */
.tab-text {
  font-weight: inherit;
}

/* ==================== 内容显示区域 ==================== */
.recovery-content-area {
  flex: 1; /* 填充剩余空间（552px - 70px = 482px） */
  background: white;
  padding: 20px 40px; /* 减少padding，压缩间距 */
  overflow: hidden; /* 隐藏滚动条，避免出现拖拽按钮 */
  box-sizing: border-box;
}

/* ==================== 占位内容 ==================== */
.placeholder-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #999;
  font-size: 16px;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .recovery-tabs {
    flex-direction: row;
    overflow-x: auto;
  }

  .recovery-tab {
    min-width: 150px;
    padding: 15px 20px;
    font-size: 14px;
  }

  .recovery-content-area {
    padding: 30px 20px;
  }
}
</style>
