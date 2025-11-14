<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-6xl mx-auto flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="logo" class="h-8 w-auto" />
          <nav class="hidden md:flex items-center gap-6 text-sm">
            <a class="text-gray-700" href="#" @click.prevent="$router.push('/')">Home</a>
            <a class="text-blue-700" href="#" @click.prevent="$router.push('/booking')">Booking</a>
            <a class="text-gray-700" href="#">Travel guides</a>
          </nav>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <a href="#" @click.prevent="$router.push('/login')" class="text-gray-700">Login</a>
          <a href="#" @click.prevent="$router.push('/register')" class="text-gray-700">Register</a>
        </div>
      </div>
      <div class="h-2 bg-blue-600"></div>
    </header>
    <section class="max-w-6xl mx-auto mt-4 bg-white rounded shadow p-4">
      <div class="flex flex-wrap items-end gap-3">
        <div class="flex-1 min-w-[200px]"><div class="text-sm text-gray-700">From</div>
          <select v-model="fromId" class="mt-1 w-full border rounded px-3 py-2">
            <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.nameEn }} ({{ s.nameZh }})</option>
          </select>
        </div>
        <div class="flex-1 min-w-[200px]"><div class="text-sm text-gray-700">To</div>
          <select v-model="toId" class="mt-1 w-full border rounded px-3 py-2">
            <option v-for="s in stations" :key="s.id" :value="s.id">{{ s.nameEn }} ({{ s.nameZh }})</option>
          </select>
        </div>
        <div class="min-w-[200px]"><div class="text-sm text-gray-700">Date</div><input type="date" v-model="date" class="mt-1 w-full border rounded px-3 py-2"/></div>
        <button class="bg-orange-500 text-white px-5 py-2 rounded" @click="fetchTrains">Search</button>
      </div>
      <div class="mt-3 flex items-center gap-4 text-sm">
        <label class="flex items-center gap-2"><input type="checkbox" v-model="highSpeedOnly"/> High-speed only</label>
        <label class="flex items-center gap-2">Departure Time <input v-model="departStart" type="time" class="border rounded px-2 py-1"/> - <input v-model="departEnd" type="time" class="border rounded px-2 py-1"/></label>
      </div>
    </section>
    <section class="max-w-6xl mx-auto mt-4">
      <div v-if="loading" class="text-center text-sm text-gray-600">Loading...</div>
      <div v-else-if="items.length===0" class="bg-white rounded shadow p-4 text-gray-700">No available trains for the selected date or filters</div>
      <div v-else class="bg-white rounded shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-100 text-xs">
            <tr><th class="px-3 py-2 text-left">Train No.</th><th class="px-3 py-2 text-left">Departure</th><th class="px-3 py-2 text-left">Arrival</th><th class="px-3 py-2 text-left">Seats</th><th class="px-3 py-2"></th></tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="it in items" :key="it.segment_id" class="border-t">
              <td class="px-3 py-2">{{it.train_no}}</td>
              <td class="px-3 py-2">{{it.depart_time}}</td>
              <td class="px-3 py-2">{{it.arrive_time}}</td>
              <td class="px-3 py-2">
                <span v-for="s in it.seatsParsed" :key="s.type" class="inline-block mr-3">{{s.type}}: {{(s.price/100).toFixed(2)}} CNY (left {{s.left}})</span>
              </td>
              <td class="px-3 py-2 text-right">
                <button :disabled="!it.bookable" class="px-4 py-1 rounded" :class="it.bookable ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'" @click="book(it)">{{ it.bookable ? 'Book' : 'Sold out' }}</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="bg-orange-50 text-orange-700 text-xs px-3 py-2">Tips: The sleeper ticket prices shown on the page are all for upper berth. The actual prices may vary among different berths.</div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const fromId = ref<string | number>('')
const toId = ref<string | number>('')
const date = ref<string>('')
const highSpeedOnly = ref(false)
const departStart = ref('00:00')
const departEnd = ref('24:00')
const loading = ref(false)
const items = ref<any[]>([])
const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : ''
const stations = ref<any[]>([])

function parseSeats(raw:any){
  if(Array.isArray(raw)) return raw
  try { return JSON.parse(raw) } catch { return [] }
}

async function fetchTrains(){
  if(!fromId.value || !toId.value || !date.value) return
  if(String(fromId.value) === String(toId.value)) return
  loading.value = true
  const url = `${API_BASE}/api/v1/trains/search?fromStationId=${fromId.value}&toStationId=${toId.value}&date=${date.value}&highSpeedOnly=${highSpeedOnly.value}&departTimeStart=${departStart.value}&departTimeEnd=${departEnd.value}`
  const res = await fetch(url, { credentials: 'include' })
  const data = await res.json()
  items.value = (data.items||[]).map((x:any)=>({ ...x, seatsParsed: parseSeats(x.seats) }))
  loading.value = false
}

async function book(it:any){
  const seat = it.seatsParsed.find((s:any)=>s.left>0)
  if(!seat) return
  await fetch(`${API_BASE}/api/v1/preorders`,{ method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
    trainNo: it.train_no, date: it.date, fromStationId: it.from_station_id, toStationId: it.to_station_id, seatType: seat.type
  })})
}

onMounted(()=>{
  const q = new URLSearchParams(location.search)
  fromId.value = q.get('fromId') || ''
  toId.value = q.get('toId') || ''
  date.value = q.get('date') || new Date().toISOString().slice(0,10)
  highSpeedOnly.value = q.get('highSpeedOnly') === 'true'
  fetch(`${API_BASE}/api/v1/stations`, { credentials: 'include' })
    .then(r=>r.json()).then(list=>{ 
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
      if(fromId.value && toId.value) fetchTrains()
    })
})
</script>
<style scoped>
.nav{display:none}
</style>