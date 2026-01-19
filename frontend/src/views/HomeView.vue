<template>
  <div class="home-page">
    <TopHeader />
    <MainNavigation />
    
    <main class="home-main">
      <div class="home-search-container">
        <div class="home-search-wrapper">
          <TrainSearchForm @search="handleSearch" />
        </div>
      </div>
      
      <!-- 中部7个快捷按钮 -->
      <section class="home-quick-buttons">
        <div class="home-quick-buttons-container">
          <img 
            src="/images/首页中部.png" 
            alt="快捷服务入口" 
            class="home-quick-buttons-image"
          />
        </div>
      </section>
      
      <!-- 宣传栏区域 - 使用真实图片 -->
      <section class="home-promo-section">
        <div class="home-promo-grid">
          <div class="home-promo-card">
            <img 
              src="/images/首页-会员服务-左上.jpg" 
              alt="会员服务" 
              class="home-promo-image"
            />
          </div>
          
          <div class="home-promo-card">
            <img 
              src="/images/首页-餐饮特产-右上.jpg" 
              alt="餐饮特产" 
              class="home-promo-image"
            />
          </div>
          
          <div class="home-promo-card">
            <img 
              src="/images/首页-铁路保险-左下.jpg" 
              alt="铁路保险" 
              class="home-promo-image"
            />
          </div>
          
          <div class="home-promo-card">
            <img 
              src="/images/首页-计次定期票-右下.png" 
              alt="计次定期票" 
              class="home-promo-image"
            />
          </div>
        </div>
      </section>

      <!-- 底部发布区域 -->
      <section class="home-info-section">
        <div class="home-info-container">
          <img 
            src="/images/首页-底部发布.png" 
            alt="最新发布" 
            class="home-info-image"
          />
        </div>
      </section>
    </main>
    
    <BottomFooter />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import TopHeader from '@/components/Common/TopHeader.vue';
import MainNavigation from '@/components/Common/MainNavigation.vue';
import BottomFooter from '@/components/Common/BottomFooter.vue';
import TrainSearchForm from '@/components/Train/TrainSearchForm.vue';

const router = useRouter();

const handleSearch = (searchParams: any) => {
  console.log('Search params:', searchParams);
  router.push({
    name: 'Search',
    query: searchParams
  });
};
</script>

<style lang="scss" scoped>
/* 首页查询页样式 */
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
}

/* 主内容区域 */
.home-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #ffffff;
}

/* 车票查询区域容器 - 包含背景图 */
.home-search-container {
  position: relative;
  width: 100%;
  min-height: 400px;
  background: url('/images/首页-背景图-1.png') center center / cover no-repeat;
  display: flex;
  align-items: center;
  padding: 60px 0;
}

/* 车票查询表单定位到左侧 */
.home-search-wrapper {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 80px;
  display: flex;
  justify-content: flex-start;
}

/* 中部快捷按钮区域 */
.home-quick-buttons {
  width: 100%;
  background-color: #ffffff;
  padding: 0;
  margin: 40px 0 0 0;
}

.home-quick-buttons-container {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.home-quick-buttons-image {
  width: 100%;
  height: auto;
  display: block;
}

/* 宣传栏区域 */
.home-promo-section {
  width: 100%;
  max-width: 1300px;
  margin: 30px auto;
  padding: 0 40px;
}

.home-promo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.home-promo-card {
  background: #ffffff;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.home-promo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.home-promo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 底部发布区域 */
.home-info-section {
  width: 100%;
  background-color: #ffffff;
  padding: 0;
  margin: 30px 0 40px 0;
}

.home-info-container {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.home-info-image {
  width: 100%;
  height: auto;
  display: block;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .home-search-wrapper {
    padding: 0 60px;
  }

  .home-promo-section {
    padding: 0 60px;
  }
}

@media (max-width: 1024px) {
  .home-search-container {
    min-height: 500px;
    padding: 40px 0;
  }

  .home-search-wrapper {
    padding: 0 40px;
  }

  .home-promo-section {
    padding: 0 40px;
    margin: 25px auto;
  }

  .home-promo-grid {
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .home-search-container {
    min-height: 400px;
    padding: 30px 0;
  }

  .home-search-wrapper {
    padding: 0 20px;
  }

  .home-promo-section {
    padding: 0 20px;
    margin: 20px auto;
  }

  .home-promo-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .home-search-container {
    min-height: 350px;
    padding: 20px 0;
  }

  .home-search-wrapper {
    padding: 0 15px;
  }

  .home-promo-section {
    padding: 0 15px;
    margin: 15px auto;
  }

  .home-promo-grid {
    gap: 12px;
  }
}
</style>
