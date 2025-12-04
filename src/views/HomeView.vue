<script setup lang="ts">
import { ref } from 'vue'
import SearchForm from '../components/SearchForm.vue'
import TrainList from '../components/TrainList.vue'
import { searchTrains, type Train } from '../services/trainService'

const trains = ref<Train[]>([])
const loading = ref(false)
const error = ref('')

const handleSearch = async (payload: { from: string; to: string; date: string }) => {
  loading.value = true
  error.value = ''
  try {
    trains.value = await searchTrains(payload.from, payload.to, payload.date)
  } catch (e) {
    console.error(e)
    error.value = '查询失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const handleBook = (train: Train, seatType: string) => {
  console.log('Book:', train.trainNo, seatType)
  alert(`预订 ${train.trainNo} ${seatType} 成功 (演示)`)
}
</script>

<template>
  <main class="container mx-auto p-4">
    <div class="max-w-4xl mx-auto mt-10">
      <h1 class="text-3xl font-bold text-center text-blue-800 mb-8">12306 铁路购票服务</h1>
      <SearchForm @search="handleSearch" />
      
      <div class="mt-8">
        <div v-if="loading" class="text-center py-4 text-gray-600">查询中...</div>
        <div v-else-if="error" class="text-center py-4 text-red-600">{{ error }}</div>
        <TrainList v-else :trains="trains" @book="handleBook" />
      </div>

      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-4 rounded shadow hover:shadow-lg transition">
          <h3 class="font-bold text-lg mb-2">温馨提示</h3>
          <p class="text-gray-600 text-sm">本系统为演示版本，数据仅供测试使用。支持查询 14 天内的车次信息。</p>
        </div>
        <div class="bg-white p-4 rounded shadow hover:shadow-lg transition">
          <h3 class="font-bold text-lg mb-2">最新公告</h3>
          <p class="text-gray-600 text-sm">新版 12306 英文版测试上线，欢迎体验！</p>
        </div>
      </div>
    </div>
  </main>
</template>
