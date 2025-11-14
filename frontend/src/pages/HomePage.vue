<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-6xl mx-auto flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="logo" class="h-8 w-auto" />
          <nav class="hidden md:flex items-center gap-6 text-sm">
            <a class="text-blue-700" href="#" @click.prevent="$router.push('/')">Home</a>
            <a class="text-gray-700" href="#" @click.prevent="$router.push('/booking')">Booking</a>
            <a class="text-gray-700" href="#">Travel guides</a>
          </nav>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <a href="#" @click.prevent="$router.push('/login')" class="text-gray-700">Login</a>
          <a href="#" @click.prevent="$router.push('/register')" class="text-gray-700">Register</a>
          <a href="#" class="text-gray-700">My 12306</a>
          <a href="#" class="text-gray-700">简体中文</a>
          <a href="#" class="text-gray-700">Contact us</a>
        </div>
      </div>
      <div class="h-2 bg-blue-600"></div>
    </header>

    <section class="relative">
      <div class="overflow-hidden">
        <div class="w-full h-72 md:h-[420px] relative">
          <img :src="banners[current]" class="w-full h-full object-cover" alt="banner" />
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <button v-for="(b,i) in banners" :key="i" class="w-2.5 h-2.5 rounded-full" :class="i===current ? 'bg-white' : 'bg-gray-300'" @click="current=i"></button>
          </div>
        </div>
      </div>
      <div class="absolute left-1/2 -translate-x-1/2 top-10 md:top-20 w-[90%] max-w-3xl">
        <div class="bg-white/95 shadow rounded-lg p-4">
          <p class="text-xs text-gray-600 mb-2"><strong>The 12306.cn website provides information query and ticket refund services 24 hours a day, and the ticket sales and endorsement services from 5:00 to 1:00 the next day (5:00 to 23:30 on Tuesday).</strong></p>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <div class="text-gray-700 text-sm">From</div>
              <select v-model="fromId" class="mt-1 w-full border rounded px-3 py-2">
                <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.nameEn }} ({{ s.nameZh }})</option>
              </select>
            </div>
            <div>
              <div class="text-gray-700 text-sm">To</div>
              <select v-model="toId" class="mt-1 w-full border rounded px-3 py-2">
                <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.nameEn }} ({{ s.nameZh }})</option>
              </select>
            </div>
            <div>
              <div class="text-gray-700 text-sm">Date</div>
              <input type="date" v-model="date" class="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div class="flex md:block justify-between">
              <label class="text-sm text-gray-700 flex items-center gap-2 md:mb-2"><input type="checkbox" v-model="highSpeedOnly" /> High-speed trains only</label>
              <button class="bg-orange-500 text-white px-6 py-2 rounded" @click="goSearch">Search</button>
            </div>
          </div>
        </div>
      </div>
      
    </section>

    <section class="max-w-6xl mx-auto mt-10">
      <h3 class="text-lg font-semibold text-blue-700 mb-2">Quick Guide</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <ul class="list-disc pl-6 space-y-1">
          <li>What ID documents are accepted by 12306.cn English website?</li>
          <li>What services does 12306.cn English website provide?</li>
        </ul>
        <ul class="list-disc pl-6 space-y-1">
          <li>What is endorsement?</li>
          <li>What are the rules of ticket endorsement?</li>
        </ul>
        <div class="text-blue-600">More&gt;</div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const fromId = ref<string | number>('')
const toId = ref<string | number>('')
const date = ref<string>(new Date().toISOString().slice(0,10))
const highSpeedOnly = ref(false)
const banners = ['/banner1.png','/banner2.png','/banner3.png']
const current = ref(0)
const stations = ref<any[]>([])
const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : ''

function goSearch() {
  if (!fromId.value || !toId.value || String(fromId.value) === String(toId.value)) return
  return router.push({
    path: '/booking',
    query: {
      fromId: String(fromId.value),
      toId: String(toId.value),
      date: date.value,
      highSpeedOnly: String(highSpeedOnly.value)
    }
  })
}

fetch(`${API_BASE}/api/v1/stations`, { credentials: 'include' })
  .then(r => r.json())
  .then(list => {
    const arr = Array.isArray(list) ? list : []
    stations.value = arr.map((x:any)=>({
      id: x.ID || x.id,
      nameEn: x.NameEn || x.nameEn,
      nameZh: x.NameZh || x.nameZh,
      code: x.Code || x.code,
      pinyin: x.Pinyin || x.pinyin,
    }))
    if(!fromId.value && stations.value[0]) fromId.value = stations.value[0].id
    if(!toId.value && stations.value[1]) toId.value = stations.value[1].id
  })
</script>
<style scoped>
.nav{display:none}
.hero{display:none}
.quick{display:none}
</style>