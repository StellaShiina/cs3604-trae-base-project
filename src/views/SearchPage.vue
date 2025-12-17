<template>
  <div class="search-page">
    <TopHeader />
    
    <div class="search-content">
      <!-- 搜索栏 -->
      <TrainSearchBar
        :initial-departure-station="searchParams.departureStation"
        :initial-arrival-station="searchParams.arrivalStation"
        :initial-departure-date="searchParams.departureDate"
        @search="handleSearch"
        @date-update="handleDateUpdate"
      />

      <!-- 筛选面板 -->
      <TrainFilterPanel
        :departure-stations="availableDepartureStations"
        :arrival-stations="availableArrivalStations"
        :seat-types="availableSeatTypes"
        :departure-date="searchParams.departureDate"
        @filter-change="handleFilterChange"
        @date-change="handleDateUpdate"
      />

      <!-- 列表区域 -->
      <div class="train-list-wrapper">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在查询车次信息...</p>
        </div>
        
        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>

        <TrainList
          v-else
          :trains="filteredTrains"
          :is-logged-in="isLoggedIn"
          :query-timestamp="queryTimestamp"
          :departure-city="searchParams.departureStation"
          :arrival-city="searchParams.arrivalStation"
          :departure-date="searchParams.departureDate"
          @reserve="handleReserve"
        />
      </div>
    </div>

    <ConfirmModal
      :is-visible="showLoginModal"
      title="提示"
      confirm-text="登录"
      cancel-text="取消"
      :on-confirm="goToLogin"
      :on-cancel="() => showLoginModal = false"
    >
      您尚未登录，请先登录后再进行预订。
    </ConfirmModal>

    <BottomFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import TopHeader from '@/components/Common/TopHeader.vue';
import BottomFooter from '@/components/Common/BottomFooter.vue';
import TrainSearchBar from '@/components/Train/TrainSearchBar.vue';
import TrainFilterPanel from '@/components/Train/TrainFilterPanel.vue';
import TrainList from '@/components/Train/TrainList.vue';
import ConfirmModal from '@/components/Train/ConfirmModal.vue';
import { searchTrains } from '@/api/train';
import { getTodayString } from '@/utils/date';

// 路由
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 状态
const loading = ref(false);
const error = ref('');
const trains = ref<any[]>([]);
const isLoggedIn = computed(() => authStore.isAuthenticated);
const showLoginModal = ref(false);
const queryTimestamp = ref(new Date().toISOString());

const searchParams = ref({
  departureStation: (route.query.departureStation as string) || (route.query.from as string) || '北京',
  arrivalStation: (route.query.arrivalStation as string) || (route.query.to as string) || '上海',
  departureDate: (route.query.departureDate as string) || (route.query.date as string) || getTodayString(),
  tripType: 'single',
  ticketType: 'normal'
});

const filters = ref({
  trainTypes: [] as string[],
  departureStations: [] as string[],
  arrivalStations: [] as string[],
  seatTypes: [] as string[],
  departureTimeRange: '00:00--24:00'
});

// 计算属性：提取可用筛选选项
const availableDepartureStations = computed(() => {
  const stations = new Set<string>();
  trains.value.forEach(train => stations.add(train.departureStation));
  return Array.from(stations);
});

const availableArrivalStations = computed(() => {
  const stations = new Set<string>();
  trains.value.forEach(train => stations.add(train.arrivalStation));
  return Array.from(stations);
});

const availableSeatTypes = computed(() => {
  const types = new Set<string>();
  trains.value.forEach(train => {
    Object.keys(train.availableSeats || {}).forEach(type => types.add(type));
  });
  return Array.from(types);
});

// 筛选逻辑
const filteredTrains = computed(() => {
  return trains.value.filter(train => {
    // 1. 车次类型筛选
    if (filters.value.trainTypes.length > 0) {
      const typeCode = train.trainNo.charAt(0);
      const isMatch = filters.value.trainTypes.some(type => {
        if (type === 'OTHER') return !['G', 'D', 'C', 'Z', 'T', 'K'].includes(typeCode);
        if (type === 'GC') return ['G', 'C'].includes(typeCode);
        return typeCode === type; // D, Z, T, K
      });
      if (!isMatch) return false;
    }

    // 2. 出发站筛选
    if (filters.value.departureStations.length > 0) {
      if (!filters.value.departureStations.includes(train.departureStation)) return false;
    }

    // 3. 到达站筛选
    if (filters.value.arrivalStations.length > 0) {
      if (!filters.value.arrivalStations.includes(train.arrivalStation)) return false;
    }

    // 4. 发车时间筛选
    if (filters.value.departureTimeRange && filters.value.departureTimeRange !== '00:00--24:00') {
      const parts = filters.value.departureTimeRange.split('--');
      if (parts.length === 2) {
        const start = parts[0]!;
        const end = parts[1]!;
        if (train.departureTime < start || train.departureTime >= end) return false;
      }
    }

    // 5. 席别筛选
    if (filters.value.seatTypes.length > 0) {
      const hasSeat = filters.value.seatTypes.some(type => {
        const count = train.availableSeats[type];
        return count !== undefined && count !== '--' && count !== '无';
      });
      if (!hasSeat) return false;
    }

    return true;
  });
});

// 方法
const fetchTrainsData = async () => {
  loading.value = true;
  error.value = '';
  trains.value = [];
  queryTimestamp.value = new Date().toISOString();

  try {
    const results = await searchTrains(
      searchParams.value.departureStation,
      searchParams.value.arrivalStation,
      searchParams.value.departureDate
    );
    trains.value = results;
  } catch (err: any) {
    error.value = err.message || '查询失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

const handleSearch = (params: any) => {
  searchParams.value = { ...searchParams.value, ...params };
  // 更新 URL 查询参数
  router.push({
    query: {
      from: params.departureStation,
      to: params.arrivalStation,
      date: params.departureDate
    }
  });
  fetchTrainsData();
};

const handleDateUpdate = (date: string) => {
  searchParams.value.departureDate = date;
  router.push({
    query: {
      ...route.query,
      date
    }
  });
  fetchTrainsData();
};

const handleFilterChange = (newFilters: any) => {
  filters.value = { ...filters.value, ...newFilters };
};

const handleReserve = (trainNo: string, departureStation: string, arrivalStation: string, departureDate: string) => {
  if (!isLoggedIn.value) {
    showLoginModal.value = true;
    return;
  }
  
  router.push({
    name: 'Order',
    query: {
      trainNo,
      departureStation,
      arrivalStation,
      departureDate
    }
  });
};

const goToLogin = () => {
  showLoginModal.value = false;
  router.push('/login');
};

// 初始化
onMounted(() => {
  if (searchParams.value.departureStation && searchParams.value.arrivalStation) {
    fetchTrainsData();
  }
});

// 监听路由参数变化（例如点击浏览器后退按钮）
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.from && newQuery.to && newQuery.date) {
      searchParams.value.departureStation = newQuery.from as string;
      searchParams.value.arrivalStation = newQuery.to as string;
      searchParams.value.departureDate = newQuery.date as string;
      // 只有当参数真正改变时才重新查询，避免重复查询（handleSearch 已经调用了 fetchTrainsData）
      // 这里简化处理，可以加判断
    }
  }
);
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.search-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.train-list-wrapper {
  margin-top: 20px;
  min-height: 400px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b99fc;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.error-message {
  padding: 20px;
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  border-radius: 4px;
  text-align: center;
  margin-top: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
