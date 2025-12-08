<template>
  <div class="train-list-page">
    <TrainListTopBar 
      :isLoggedIn="isLoggedIn" 
      :username="username"
      @logout="handleLogout"
      @my12306Click="handleMy12306Click"
    />
    
    <MainNavigation />
    
    <div class="train-list-content">
      <!-- 搜索栏 -->
      <TrainSearchBar
        :initialDepartureStation="searchParams.departureStation"
        :initialArrivalStation="searchParams.arrivalStation"
        :initialDepartureDate="searchParams.departureDate"
        @search="handleSearch"
        @dateUpdate="handleDateUpdate"
      />
      
      <!-- 筛选面板 -->
      <TrainFilterPanel
        v-if="trains.length > 0"
        :departureStations="filterOptions.departureStations"
        :arrivalStations="filterOptions.arrivalStations"
        :seatTypes="filterOptions.seatTypes"
        :departureDate="searchParams.departureDate"
        :isHighSpeed="searchParams.isHighSpeed"
        @filterChange="handleFilterChange"
        @dateChange="handleDateChange"
      />
      
      <!-- 错误提示 -->
      <div v-if="error" class="train-list-error-message">
        {{ error }}
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading">
        正在查询车次信息...
      </div>
      
      <!-- 车次列表 -->
      <TrainResultList
        v-else
        :trains="filteredTrains"
        :departureCity="displayedQueryParams.departureStation"
        :arrivalCity="displayedQueryParams.arrivalStation"
        :departureDate="displayedQueryParams.departureDate"
        :isLoggedIn="isLoggedIn"
        :queryTimestamp="queryTimestamp"
        @reserve="handleReserve"
      />
    </div>
    
    <BottomNavigation />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { searchTrains } from '../api/train'
import { getStationsByCity } from '../api/station'
import { getTodayString } from '../utils/dateUtils'

// Components
import TrainListTopBar from '../components/TrainListTopBar.vue'
import MainNavigation from '../components/MainNavigation.vue'
import TrainSearchBar from '../components/TrainSearchBar.vue'
import TrainFilterPanel from '../components/TrainFilterPanel.vue'
import TrainResultList from '../components/TrainResultList.vue'
import BottomNavigation from '../components/BottomNavigation.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// State
const isLoggedIn = computed(() => userStore.isLoggedIn)
const username = computed(() => userStore.user?.name || userStore.user?.username || '用户')

const searchParams = reactive({
  departureStation: (route.query.from as string) || '',
  arrivalStation: (route.query.to as string) || '',
  departureDate: (route.query.date as string) || getTodayString(),
  isHighSpeed: route.query.isHighSpeed === 'true'
})

const displayedQueryParams = reactive({
  departureStation: '',
  arrivalStation: '',
  departureDate: ''
})

const trains = ref<any[]>([])
const filteredTrains = ref<any[]>([])
const filterOptions = reactive({
  departureStations: [] as string[],
  arrivalStations: [] as string[],
  seatTypes: [] as string[]
})

const isLoading = ref(false)
const error = ref('')
const queryTimestamp = ref(Date.now().toString()) // Use string for timestamp prop

// Methods
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const handleMy12306Click = () => {
  if (isLoggedIn.value) {
    router.push('/personal-info')
  } else {
    router.push('/login')
  }
}

const handleSearch = (params: any) => {
  searchParams.departureStation = params.departureStation
  searchParams.arrivalStation = params.arrivalStation
  searchParams.departureDate = params.departureDate
  fetchTrains(searchParams)
}

const handleDateUpdate = (date: string) => {
  searchParams.departureDate = date
}

const handleDateChange = (date: string) => {
  searchParams.departureDate = date
  fetchTrains(searchParams)
}

const fetchTrains = async (params: any) => {
  if (!params.departureStation || !params.arrivalStation) return

  // Update displayed params
  displayedQueryParams.departureStation = params.departureStation
  displayedQueryParams.arrivalStation = params.arrivalStation
  displayedQueryParams.departureDate = params.departureDate

  isLoading.value = true
  error.value = ''
  
  try {
    // Construct train types filter if needed (currently backend might not support it directly in search, but frontend can filter)
    // The reference passes trainTypes to searchTrains, but our API adapter might need adjustment.
    // Our searchTrains in api/train.ts takes { from, to, date }.
    
    const result = await searchTrains({
      from: params.departureStation,
      to: params.arrivalStation,
      date: params.departureDate
    })
    
    // Transform backend result to match what UI expects
    // Backend returns Train[]: { trainNo, from, to, startTime, endTime, seats: [...] }
    // UI expects extra fields like duration, availableSeats map, etc.
    // TrainResultList and TrainItem handle some formatting, but let's ensure structure.
    
    const formattedTrains = result.map((t: any) => {
      // Create seats map
      const availableSeats: Record<string, number> = {}
      t.seats.forEach((s: any) => {
        availableSeats[s.type] = s.left
      })
      
      // Calculate duration
      let duration = 0
      if (t.startTime && t.endTime) {
        const [startH, startM] = t.startTime.split(':').map(Number)
        const [endH, endM] = t.endTime.split(':').map(Number)
        let diff = (endH * 60 + endM) - (startH * 60 + startM)
        if (diff < 0) diff += 24 * 60
        duration = diff
      }

      return {
        ...t,
        departureStation: t.from, // Map for UI
        arrivalStation: t.to,     // Map for UI
        departureTime: t.startTime,
        arrivalTime: t.endTime,
        duration: duration,
        availableSeats: availableSeats,
        // Ensure date is passed for booking
        departureDate: params.departureDate
      }
    })

    trains.value = formattedTrains
    
    // Initial filter (all)
    // Apply high speed filter if needed
    if (params.isHighSpeed) {
      filteredTrains.value = formattedTrains.filter((t: any) => 
        ['G', 'C', 'D'].includes(t.trainNo.charAt(0))
      )
    } else {
      filteredTrains.value = formattedTrains
    }
    
    queryTimestamp.value = Date.now().toString()

    // Fetch stations for filter options
    // Note: getStationsByCity might return empty if backend not implemented
    const depStations = await getStationsByCity(params.departureStation)
    const arrStations = await getStationsByCity(params.arrivalStation)
    
    // Extract seat types from results
    const seatTypesSet = new Set<string>()
    formattedTrains.forEach((t: any) => {
      Object.keys(t.availableSeats).forEach(type => seatTypesSet.add(type))
    })

    filterOptions.departureStations = depStations
    filterOptions.arrivalStations = arrStations
    filterOptions.seatTypes = Array.from(seatTypesSet)

  } catch (err: any) {
    console.error('Search failed:', err)
    error.value = '查询失败，请稍后重试'
    trains.value = []
    filteredTrains.value = []
  } finally {
    isLoading.value = false
  }
}

const handleFilterChange = (filters: any) => {
  let result = [...trains.value]

  // 1. Train Types
  if (filters.trainTypes && filters.trainTypes.length > 0) {
    result = result.filter(train => {
      const firstChar = train.trainNo.charAt(0)
      // Special handling for 'OTHER'
      if (filters.trainTypes.includes('OTHER')) {
         if (!['G', 'C', 'D', 'Z', 'T', 'K'].includes(firstChar)) return true
      }
      return filters.trainTypes.includes(firstChar)
    })
  }

  // 2. Departure Stations
  if (filters.departureStations && filters.departureStations.length > 0) {
    result = result.filter(train => 
      filters.departureStations.includes(train.departureStation)
    )
  }

  // 3. Arrival Stations
  if (filters.arrivalStations && filters.arrivalStations.length > 0) {
    result = result.filter(train => 
      filters.arrivalStations.includes(train.arrivalStation)
    )
  }

  // 4. Departure Time
  if (filters.departureTimeRange && filters.departureTimeRange !== '00:00--24:00') {
    const [start, end] = filters.departureTimeRange.split('--')
    result = result.filter(train => {
      if (!train.departureTime) return false
      return train.departureTime >= start && train.departureTime < end
    })
  }

  filteredTrains.value = result
}

const handleReserve = (trainNo: string) => {
  const train = trains.value.find(t => t.trainNo === trainNo)
  if (!train) return

  if (!isLoggedIn.value) {
    router.push({
      path: '/login',
      query: { redirect: route.fullPath }
    })
    return
  }

  // Navigate to order create page
  // The backend expects specific params for order creation, but the UI flow goes to a selection page first?
  // Reference goes to '/order' with state.
  // Our 'OrderCreate.vue' expects query params.
  
  router.push({
    path: '/order/create',
    query: {
      trainNo: train.trainNo,
      date: searchParams.departureDate,
      from: train.departureStation,
      to: train.arrivalStation
    },
    state: {
      train: JSON.stringify(train) // Pass full train object in state
    }
  })
}

// Initial fetch
onMounted(() => {
  if (searchParams.departureStation && searchParams.arrivalStation) {
    fetchTrains(searchParams)
  }
})
</script>

<style>
/* 车次列表页样式 */
.train-list-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
}

/* 内容区域 */
.train-list-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}

/* 加载和错误状态 */
.loading {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666666;
}

.train-list-error-message {
  text-align: center;
  padding: 10px;
  margin: 20px 0;
  background-color: #ffebee;
  border: 1px solid #ef5350;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .train-list-content {
    padding: 15px;
  }

  .loading {
    padding: 30px;
    font-size: 15px;
  }

  .train-list-error-message {
    padding: 15px;
    margin: 15px 0;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .train-list-content {
    padding: 10px;
  }

  .loading {
    padding: 25px;
    font-size: 14px;
  }

  .train-list-error-message {
    padding: 12px;
    margin: 12px 0;
    font-size: 12px;
  }
}
</style>