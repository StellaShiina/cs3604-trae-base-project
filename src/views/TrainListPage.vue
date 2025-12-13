<template>
  <div class="train-list-page">
    <TopNavigation />

    <div class="main-container">
      <TrainSearchBar 
        :initial-departure-station="searchParams.departureStation"
        :initial-arrival-station="searchParams.arrivalStation"
        :initial-departure-date="searchParams.departureDate"
        :loading="loading"
        @search="handleSearch"
      />
      
      <TrainFilterPanel @change="handleFilterChange" />
      
      <TrainList 
        :trains="filteredTrains"
        @reserve="handleReserve"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { searchTrains, type Train } from '../services/trainService'
import TrainSearchBar from '../components/TrainSearchBar.vue'
import TrainFilterPanel from '../components/TrainFilterPanel.vue'
import TrainList from '../components/TrainList.vue'
import TopNavigation from '../components/TopNavigation.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
// const authStore = useAuthStore() // Not used in this file anymore if we remove logout

const loading = ref(false)
const trains = ref<Train[]>([])
const filterTypes = ref<string[]>([])

const searchParams = reactive({
  departureStation: '',
  arrivalStation: '',
  departureDate: ''
})

const filteredTrains = computed(() => {
  if (filterTypes.value.length === 0) return trains.value
  return trains.value.filter(t => {
    // 简单的类型匹配，例如 G123 匹配 G
    const firstLetter = t.trainNo.charAt(0).toUpperCase()
    // 处理 '其他' 类型 (O)
    if (filterTypes.value.includes('O') && !['G','D','Z','T','K'].includes(firstLetter)) {
       return true
    }
    return filterTypes.value.includes(firstLetter)
  })
})

const handleSearch = async (params: any) => {
  searchParams.departureStation = params.departureStation
  searchParams.arrivalStation = params.arrivalStation
  searchParams.departureDate = params.departureDate
  
  loading.value = true
  try {
    const res: any = await searchTrains(
      params.departureStation,
      params.arrivalStation,
      params.departureDate
    )
    
    // 适配后端返回结构
    if (res.success || Array.isArray(res)) {
      trains.value = res.trains || res // 根据实际 API 返回调整
    } else {
      trains.value = []
      ElMessage.warning('未查询到车次信息')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('查询失败，切换为模拟数据演示')
    // Mock 数据用于展示
    trains.value = [
      {
        trainNo: 'G1234',
        startStation: '北京南',
        endStation: '上海虹桥',
        fromStation: '北京南',
        toStation: '上海虹桥',
        startTime: '09:00',
        endTime: '13:18',
        duration: '4小时18分',
        seatTypes: [
          { type: '商务座', price: 1748, count: 5 },
          { type: '一等座', price: 933, count: 12 },
          { type: '二等座', price: 553, count: 88 }
        ]
      },
      {
        trainNo: 'G101',
        startStation: '北京南',
        endStation: '上海虹桥',
        fromStation: '北京南',
        toStation: '上海虹桥',
        startTime: '10:00',
        endTime: '14:28',
        duration: '4小时28分',
        seatTypes: [
          { type: '商务座', price: 1748, count: 0 },
          { type: '一等座', price: 933, count: 5 },
          { type: '二等座', price: 553, count: 120 }
        ]
      }
    ] as any
  } finally {
    loading.value = false
  }
}

const handleFilterChange = (types: string[]) => {
  filterTypes.value = types
}

const handleReserve = (train: Train) => {
  if (!authStore.token) {
    ElMessage.warning('请先登录')
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }
  ElMessage.success(`正在预订 ${train.trainNo}`)
  // TODO: 跳转到订单确认页
}

// 初始化
onMounted(() => {
  const { departureStation, arrivalStation, departureDate } = route.query
  if (departureStation && arrivalStation) {
     searchParams.departureStation = departureStation as string
     searchParams.arrivalStation = arrivalStation as string
     searchParams.departureDate = (departureDate as string) || new Date().toISOString().split('T')[0]
     handleSearch(searchParams)
  }
})
</script>

<style scoped>
.train-list-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.top-nav {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.nav-content {
  width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
  color: #0078d7;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #333;
}

.nav-links a.active {
  color: #0078d7;
  font-weight: bold;
}

.divider { color: #ddd; }

.main-container {
  width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}
</style>
