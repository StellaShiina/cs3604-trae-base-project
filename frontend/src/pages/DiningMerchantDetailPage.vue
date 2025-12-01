<template>
  <div class="min-h-screen bg-gray-50">
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

    <!-- Breadcrumb -->
    <div class="bg-white border-b py-3">
      <div class="max-w-7xl mx-auto px-6 text-sm text-gray-600">
        <span>商旅服务 > 餐饮·特产 > 肯德基（北京南站店）</span>
      </div>
    </div>

    <!-- Merchant Info Card -->
    <div v-if="merchant" class="max-w-7xl mx-auto px-6 py-6">
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <div class="flex items-start justify-between">
          <div class="flex items-start gap-4">
            <div class="relative">
              <img :src="merchant.logo" :alt="merchant.name" class="w-24 h-24 object-cover" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900 mb-2">{{ merchant.name }}</h1>
              <div class="flex items-center gap-1 mb-2">
                <svg v-for="i in 5" :key="i" class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-600">
                <span>📞 {{ merchant.phone || '021-59097750' }}</span>
                <span>⏰ 营业时间：10:00-20:00</span>
              </div>
            </div>
          </div>
          <div class="text-right text-sm">
            <div class="flex gap-8 mb-3">
              <div>
                <span class="text-gray-600">起送费</span>
                <p class="text-lg font-bold">¥ {{ merchant.minOrder?.toFixed(0) || '0' }}</p>
              </div>
              <div>
                <span class="text-gray-600">配送费</span>
                <p class="text-lg font-bold">¥ {{ merchant.deliveryFee?.toFixed(0) || '8' }}</p>
              </div>
            </div>
            <div class="text-gray-600 space-y-1">
              <p>下单截止 11-30 05:20</p>
              <p>退单截止 11-30 05:20</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-6">
      <div class="bg-white border border-gray-200 rounded-t-lg mt-4">
        <div class="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <div class="flex gap-8 text-sm">
            <button 
              @click="activeTab = 'products'" 
              class="py-2 font-medium transition"
              :class="activeTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'"
            >
              所有商品
            </button>
            <button 
              @click="activeTab = 'reviews'" 
              class="py-2 font-medium transition"
              :class="activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'"
            >
              评价
            </button>
            <button 
              @click="activeTab = 'info'" 
              class="py-2 font-medium transition"
              :class="activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'"
            >
              商家
            </button>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <button class="text-blue-600">默认排序</button>
            <button class="text-gray-600">价格</button>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="px-6 py-3 border-b border-gray-200 flex gap-4 overflow-x-auto text-sm">
          <button 
            v-for="cat in categories" 
            :key="cat.value"
            @click="selectedCategory = cat.value"
            class="px-4 py-1 whitespace-nowrap transition"
            :class="selectedCategory === cat.value ? 'bg-blue-600 text-white rounded' : 'text-gray-700'"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Products Content -->
        <div class="p-6" v-if="activeTab === 'products'">
          <div v-if="selectedCategory === 'new'" class="mb-8">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">新品</h2>
            <div class="grid grid-cols-4 gap-6">
              <div 
                v-for="product in newProducts" 
                :key="product.id"
                class="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-md transition"
              >
                <img :src="product.image" :alt="product.name" class="w-full h-48 object-contain bg-gray-50" />
                <div class="p-4">
                  <h3 class="text-sm font-medium text-gray-800 mb-2">{{ product.name }}</h3>
                  <div class="flex items-center justify-between">
                    <span class="text-red-600 font-bold text-lg">¥ {{ product.price.toFixed(2) }}</span>
                    <button 
                      class="bg-gray-200 text-gray-600 px-4 py-1 rounded text-sm hover:bg-gray-300 transition"
                    >
                      未供应
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-4 gap-6">
            <div 
              v-for="product in filteredProducts" 
              :key="product.id"
              class="bg-white border border-gray-200 rounded overflow-hidden hover:shadow-md transition"
            >
              <img :src="product.image" :alt="product.name" class="w-full h-48 object-contain bg-gray-50" />
              <div class="p-4">
                <h3 class="text-sm font-medium text-gray-800 mb-2">{{ product.name }}</h3>
                <div class="flex items-center justify-between">
                  <span class="text-red-600 font-bold text-lg">¥ {{ product.price.toFixed(2) }}</span>
                  <button 
                    class="bg-gray-200 text-gray-600 px-4 py-1 rounded text-sm hover:bg-gray-300 transition"
                  >
                    未供应
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12 text-gray-500">
            该分类暂无商品
          </div>
        </div>

        <!-- Reviews Tab -->
        <div v-if="activeTab === 'reviews'" class="p-6 text-center text-gray-500">
          暂无评价
        </div>

        <!-- Info Tab -->
        <div v-if="activeTab === 'info' && merchant" class="p-6">
          <div class="space-y-3 text-sm">
            <div class="flex">
              <span class="w-24 text-gray-600">商家名称：</span>
              <span>{{ merchant.name }}</span>
            </div>
            <div class="flex">
              <span class="w-24 text-gray-600">站点：</span>
              <span>{{ merchant.station }}站</span>
            </div>
            <div class="flex">
              <span class="w-24 text-gray-600">电话：</span>
              <span>{{ merchant.phone }}</span>
            </div>
            <div class="flex">
              <span class="w-24 text-gray-600">营业时间：</span>
              <span>10:00-20:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : ''

const merchant = ref<any>(null)
const activeTab = ref('products')
const selectedCategory = ref('new')

const categories = [
  { label: '全部', value: 'all' },
  { label: '新品', value: 'new' },
  { label: '热销', value: 'hot' },
  { label: '单人餐三件套', value: 'set3' },
  { label: '单人餐四件套', value: 'set4' },
  { label: '多人餐', value: 'family' },
  { label: '汉堡', value: 'burger' },
  { label: '小食', value: 'snacks' },
  { label: '甜品', value: 'dessert' },
  { label: '咖啡', value: 'coffee' },
  { label: '饮料', value: 'drinks' },
]

const newProducts = computed(() => {
  if (!merchant.value?.products) return []
  return merchant.value.products.filter((p: any) => p.category === 'new')
})

const filteredProducts = computed(() => {
  if (!merchant.value?.products) return []
  if (selectedCategory.value === 'all') return merchant.value.products
  return merchant.value.products.filter((p: any) => p.category === selectedCategory.value)
})

async function fetchMerchantDetail() {
  const id = route.params.id
  try {
    const res = await fetch(`${API_BASE}/api/v1/dining/merchants/${id}`, { credentials: 'include' })
    if (res.ok) {
      merchant.value = await res.json()
    } else {
      console.error('Merchant not found')
    }
  } catch (error) {
    console.error('Failed to fetch merchant detail:', error)
  }
}

onMounted(() => {
  fetchMerchantDetail()
})
</script>

