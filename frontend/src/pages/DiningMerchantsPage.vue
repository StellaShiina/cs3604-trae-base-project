<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between py-3 px-6">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="logo" class="h-12 w-auto cursor-pointer" @click="$router.push('/')" />
        </div>
        <div class="flex items-center gap-6 text-sm">
          <a href="#" class="text-gray-700 hover:text-blue-600">登录</a>
          <a href="#" class="text-gray-700 hover:text-blue-600">注册</a>
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
          <a href="#" class="py-4 bg-blue-700 px-3 font-medium">商旅服务</a>
          <a href="#" class="py-4 hover:bg-blue-700 px-3">出行指南</a>
        </div>
      </div>
    </nav>

    <!-- Search Bar -->
    <div class="bg-white border-b shadow-sm py-4">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700">乘车日期:</span>
            <input 
              type="date" 
              v-model="query.date" 
              class="border-2 border-dashed border-gray-400 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700">车次</span>
            <input 
              type="text" 
              v-model="query.trainNo" 
              class="border border-gray-300 rounded px-3 py-1.5 text-sm w-24 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700">乘车站</span>
            <span class="font-medium text-sm">{{ query.fromStation }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-700">到达站</span>
            <span class="font-medium text-sm">{{ query.toStation }}</span>
          </div>
          <button 
            @click="fetchData" 
            class="bg-orange-500 text-white px-8 py-1.5 rounded border-2 border-dashed border-orange-600 hover:bg-orange-600 transition font-medium"
          >
            搜索
          </button>
        </div>
      </div>
    </div>

    <!-- Station Filter Bar -->
    <div class="bg-white border-b py-3">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-700">配送站:</span>
            <button 
              @click="selectedDeliveryStation = 'all'"
              class="px-4 py-1 rounded text-sm transition"
              :class="selectedDeliveryStation === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
            >
              全部
            </button>
            <label v-for="station in uniqueStations" :key="station" class="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                :value="station"
                v-model="selectedStations"
                class="rounded"
              />
              <span class="text-gray-700">{{ station }}</span>
            </label>
          </div>
          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="availableOnly" 
              v-model="availableOnly" 
              @change="fetchData" 
              class="rounded"
            />
            <label for="availableOnly" class="text-sm text-gray-700">显示可预订商家</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-6">
      <!-- Train Products Section -->
      <div class="mb-8 bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center gap-2 mb-6">
          <div class="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-800">列车自营商品</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="product in products" :key="product.id" class="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded transition">
            <img :src="product.image" :alt="product.name" class="w-32 h-32 object-contain flex-shrink-0" />
            <div class="flex-1">
              <p class="text-base font-medium text-gray-800 mb-2">{{ product.name }}</p>
              <p class="text-red-600 font-bold text-xl">¥ {{ product.price.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Merchants by Station -->
      <div v-for="(group, station) in filteredMerchantsByStation" :key="station" class="mb-8 bg-white rounded-lg border border-gray-200 p-6">
        <div class="flex items-center gap-2 mb-6">
          <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          <h3 class="text-lg font-semibold text-blue-900">{{ station }} <span class="text-gray-600 text-base">{{ group.departureTime ? `(${group.departureTime}开车)` : '(终点站)' }}</span></h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="merchant in group.merchants" 
            :key="merchant.id"
            @click="goToMerchant(merchant.id)"
            class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer relative"
          >
            <div class="flex items-start gap-4 mb-4">
              <img :src="merchant.logo" :alt="merchant.name" class="w-20 h-20 object-cover flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h4 class="text-base font-bold text-gray-900 mb-1">{{ merchant.name }}</h4>
                <p class="text-sm text-gray-600 mb-2">（{{ merchant.station }}站）</p>
                <p class="text-xs text-gray-500">
                  起送：<span class="text-gray-700">¥ {{ merchant.minOrder.toFixed(2) }}</span> | 
                  配送费：<span class="text-gray-700">¥ {{ merchant.deliveryFee.toFixed(2) }}</span>
                </p>
              </div>
              <div v-if="merchant.status === 'closed'" class="flex-shrink-0">
                <img src="/notinservice.png" alt="休息中" class="w-20 h-20 object-contain" />
              </div>
            </div>
            <div class="pt-3 border-t border-gray-200">
              <div class="flex items-center justify-between text-sm text-gray-600">
                <span>{{ merchant.openTime || '11-16起售' }}</span>
                <span>11-30 05:20截止下单</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Merchants Message -->
      <div v-if="Object.keys(filteredMerchantsByStation).length === 0 && !loading" class="max-w-2xl mx-auto mt-12">
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-yellow-800 mb-2">未找到商家</h3>
              <p class="text-yellow-700 mb-3">
                车次 <strong>{{ query.trainNo }}</strong> 在此日期没有餐饮服务。
              </p>
              <div class="mt-4">
                <button 
                  @click="$router.push('/dining/search')" 
                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium transition"
                >
                  ← 返回搜索
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : ''

const query = ref({
  date: route.query.date as string || new Date().toISOString().slice(0, 10),
  trainNo: route.query.trainNo as string || 'G1',
  fromStation: route.query.fromStation as string || 'Beijing',
  toStation: route.query.toStation as string || 'Shanghai'
})

const availableOnly = ref(false)
const selectedDeliveryStation = ref('all')
const selectedStations = ref<string[]>([])
const products = ref<any[]>([])
const merchants = ref<any[]>([])
const loading = ref(false)

const uniqueStations = computed(() => {
  const stations = new Set<string>()
  merchants.value.forEach(m => stations.add(m.station))
  return Array.from(stations)
})

const merchantsByStation = computed(() => {
  const grouped: Record<string, any> = {}
  merchants.value.forEach(m => {
    const station = m.station || 'Other'
    if (!grouped[station]) {
      grouped[station] = {
        merchants: [],
        departureTime: m.departureTime || ''
      }
    }
    grouped[station].merchants.push(m)
  })
  return grouped
})

const filteredMerchantsByStation = computed(() => {
  if (selectedDeliveryStation.value === 'all' && selectedStations.value.length === 0) {
    return merchantsByStation.value
  }
  
  const filtered: Record<string, any> = {}
  Object.entries(merchantsByStation.value).forEach(([station, data]: [string, any]) => {
    if (selectedStations.value.length === 0 || selectedStations.value.includes(station)) {
      filtered[station] = data
    }
  })
  return filtered
})

async function fetchData() {
  loading.value = true
  try {
    // Fetch train products
    const productsRes = await fetch(`${API_BASE}/api/v1/dining/products`, { credentials: 'include' })
    products.value = await productsRes.json()

    // Fetch merchants
    const params = new URLSearchParams({
      trainNo: query.value.trainNo,
      date: query.value.date,
      availableOnly: availableOnly.value.toString()
    })
    const merchantsRes = await fetch(`${API_BASE}/api/v1/dining/merchants?${params}`, { credentials: 'include' })
    const data = await merchantsRes.json()
    merchants.value = data.merchants || []
  } catch (error) {
    console.error('Failed to fetch dining data:', error)
  } finally {
    loading.value = false
  }
}

function goToMerchant(id: string) {
  router.push(`/dining/merchants/${id}`)
}

onMounted(() => {
  fetchData()
})
</script>
