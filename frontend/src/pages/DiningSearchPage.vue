<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between py-3 px-6">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="logo" class="h-12 w-auto cursor-pointer" @click="$router.push('/')" />
        </div>
        <div class="flex items-center gap-6 text-sm">
          <a href="#" class="text-blue-600 hover:underline">无障碍</a>
          <a href="#" class="text-blue-600 hover:underline">爱心版</a>
          <a href="#" @click.prevent="$router.push('/login')" class="text-gray-700 hover:text-blue-600">登录</a>
          <a href="#" @click.prevent="$router.push('/register')" class="text-gray-700 hover:text-blue-600">注册</a>
          <a href="#" class="text-gray-700 hover:text-blue-600">English</a>
          <a href="#" class="text-gray-700 hover:text-blue-600">我的12306</a>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="bg-blue-600 shadow">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center gap-8 text-white text-sm">
          <a href="#" @click.prevent="$router.push('/')" class="py-4 hover:bg-blue-700 px-3">首页</a>
          <a href="#" class="py-4 hover:bg-blue-700 px-3">车票</a>
          <a href="#" class="py-4 hover:bg-blue-700 px-3">团购服务</a>
          <a href="#" class="py-4 hover:bg-blue-700 px-3">会员服务</a>
          <a href="#" class="py-4 hover:bg-blue-700 px-3">站车服务</a>
          <a href="#" class="py-4 bg-blue-700 px-3 font-medium">商旅服务</a>
          <a href="#" class="py-4 hover:bg-blue-700 px-3">出行指南</a>
          <a href="#" class="py-4 hover:bg-blue-700 px-3">信息查询</a>
        </div>
      </div>
    </nav>

    <!-- Hero Section with Background -->
    <section class="relative h-[500px] overflow-hidden">
      <!-- Background Image (scaled larger) -->
      <div 
        class="absolute inset-0 bg-center scale-125" 
        style="background-image: url('/bg_search.jpg'); background-size: cover;"
      ></div>
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/30"></div>
      
      <!-- Content -->
      <div class="relative max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-30">
        <!-- Search Form -->
        <div class="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl p-6 max-w-5xl mx-auto w-full">
          <!-- Error Message -->
          <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-r">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>

          <div class="flex items-end gap-4">
            <!-- Date -->
            <div class="flex-1">
              <label class="block text-sm text-gray-600 mb-1">日期</label>
              <input 
                type="date" 
                v-model="searchForm.date" 
                class="w-full border border-gray-300 rounded px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- Train Number -->
            <div class="flex-1">
              <label class="block text-sm text-gray-600 mb-1">车次</label>
              <input 
                type="text" 
                v-model="searchForm.trainNo" 
                placeholder="如：G1"
                class="w-full border border-gray-300 rounded px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <!-- From Station -->
            <div class="flex-1">
              <label class="block text-sm text-gray-600 mb-1">乘车站</label>
              <select 
                v-model="searchForm.fromStation" 
                class="w-full border border-gray-300 rounded px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">请选择</option>
                <option v-for="s in stations" :key="'from-'+s.id" :value="s.nameEn">{{ s.nameZh }}</option>
              </select>
            </div>

            <!-- To Station -->
            <div class="flex-1">
              <label class="block text-sm text-gray-600 mb-1">到达站</label>
              <select 
                v-model="searchForm.toStation" 
                class="w-full border border-gray-300 rounded px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">请选择</option>
                <option v-for="s in stations" :key="'to-'+s.id" :value="s.nameEn">{{ s.nameZh }}</option>
              </select>
            </div>

            <!-- Search Button -->
            <div>
              <button 
                @click="handleSearch"
                :disabled="isValidating"
                class="bg-orange-500 hover:bg-orange-600 text-white px-12 py-2.5 rounded font-medium shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                <svg v-if="isValidating" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isValidating ? '验证中...' : '搜索' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : ''

const searchForm = ref({
  date: new Date().toISOString().slice(0, 10),
  trainNo: 'G1',
  fromStation: '',
  toStation: ''
})

const stations = ref<any[]>([])
const errorMessage = ref('')
const isValidating = ref(false)

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/v1/stations`, { credentials: 'include' })
    const list = await res.json()
    stations.value = (Array.isArray(list) ? list : []).map((x: any) => ({
      id: x.ID || x.id,
      nameEn: x.NameEn || x.nameEn,
      nameZh: x.NameZh || x.nameZh,
      code: x.Code || x.code,
    }))
    // 设置默认值为北京到上海
    const beijing = stations.value.find(s => s.nameEn === 'Beijing' || s.nameZh === '北京')
    const shanghai = stations.value.find(s => s.nameEn === 'Shanghai' || s.nameZh === '上海')
    
    if (beijing) {
      searchForm.value.fromStation = beijing.nameEn
    } else if (stations.value.length > 0) {
      searchForm.value.fromStation = stations.value[0].nameEn
    }
    
    if (shanghai) {
      searchForm.value.toStation = shanghai.nameEn
    } else if (stations.value.length > 1) {
      searchForm.value.toStation = stations.value[1].nameEn
    }
  } catch (error) {
    console.error('Failed to load stations:', error)
  }
})

async function handleSearch() {
  errorMessage.value = ''
  
  if (!searchForm.value.trainNo || !searchForm.value.fromStation || !searchForm.value.toStation) {
    errorMessage.value = 'Please fill in all fields'
    return
  }
  
  if (searchForm.value.fromStation === searchForm.value.toStation) {
    errorMessage.value = 'Departure and arrival stations cannot be the same'
    return
  }
  
  // 验证车次和站点
  isValidating.value = true
  try {
    const params = new URLSearchParams({
      trainNo: searchForm.value.trainNo,
      date: searchForm.value.date,
    })
    
    const res = await fetch(`${API_BASE}/api/v1/dining/merchants?${params}`, { 
      credentials: 'include' 
    })
    
    const data = await res.json()
    
    if (data.message || (data.merchants && data.merchants.length === 0)) {
      errorMessage.value = `Train ${searchForm.value.trainNo} not found or not in service on ${searchForm.value.date}. Please check the train number and date.`
      isValidating.value = false
      return
    }
    
    // 验证通过，跳转到商家列表页
    router.push({
      path: '/dining/merchants',
      query: {
        date: searchForm.value.date,
        trainNo: searchForm.value.trainNo,
        fromStation: searchForm.value.fromStation,
        toStation: searchForm.value.toStation
      }
    })
  } catch (error) {
    errorMessage.value = 'Failed to validate train information. Please try again.'
    console.error('Validation error:', error)
  } finally {
    isValidating.value = false
  }
}
</script>

