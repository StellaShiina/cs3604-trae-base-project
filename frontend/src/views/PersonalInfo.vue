<template>
  <div class="personal-info-page">
    <HomeTopBar 
      :isLoggedIn="userStore.isLoggedIn" 
      :username="username" 
      @logout="handleLogout"
      @my12306Click="handleMy12306Click"
    />
    <MainNavigation />
    
    <main class="main-content">
      <div class="content-area">
        <h2 style="padding: 20px; text-align: center;">个人中心功能开发中...</h2>
      </div>
    </main>
    
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import HomeTopBar from '../components/HomeTopBar.vue';
import MainNavigation from '../components/MainNavigation.vue';
import BottomNavigation from '../components/BottomNavigation.vue';

const router = useRouter();
const userStore = useUserStore();

const username = computed(() => {
  if (userStore.isLoggedIn && userStore.user) {
    return userStore.user.name || userStore.user.username || '用户';
  }
  return '';
});

const handleLogout = async () => {
  await userStore.logout();
  router.push('/login');
};

const handleMy12306Click = () => {
  // Already on personal info page or refresh
  router.push('/personal-info');
};
</script>

<style>
.personal-info-page {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background-color: #ffffff;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.content-area {
  padding: 20px;
}
</style>
