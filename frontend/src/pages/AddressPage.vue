<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-6xl mx-auto flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="logo" class="h-8 w-auto" />
          <nav class="hidden md:flex items-center gap-6 text-sm">
            <a class="text-gray-700" href="#" @click.prevent="$router.push('/')">Home</a>
            <a class="text-gray-700" href="#" @click.prevent="$router.push('/booking')">Booking</a>
            <a class="text-blue-700" href="#">Common Address</a>
          </nav>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <a href="#" @click.prevent="$router.push('/login')" class="text-gray-700">Login</a>
          <a href="#" @click.prevent="$router.push('/register')" class="text-gray-700">Register</a>
        </div>
      </div>
      <div class="h-2 bg-blue-600"></div>
    </header>

    <section class="max-w-6xl mx-auto mt-6">
      <div class="bg-white rounded shadow p-6">
        <div class="flex items-baseline justify-between">
          <h3 class="text-lg font-semibold">Create Common Address</h3>
          <span class="text-xs text-red-600">* Required</span>
        </div>
        <div class="mt-3 grid grid-cols-1 gap-4 text-sm">
          <div>
            <div class="text-gray-700 mb-1">Location</div>
            <div class="flex flex-wrap gap-2">
              <select v-model="addr.province" class="border rounded px-3 py-2 min-w-[160px]">
                <option value="">Select province</option>
                <option v-for="p in provinceOptions" :key="p" :value="p">{{p}}</option>
              </select>
              <select v-model="addr.city" class="border rounded px-3 py-2 min-w-[160px]">
                <option value="">Select city</option>
                <option v-for="c in cityOptions" :key="c" :value="c">{{c}}</option>
              </select>
              <select v-model="addr.district" class="border rounded px-3 py-2 min-w-[160px]">
                <option value="">Select district/county</option>
                <option v-for="d in districtOptions" :key="d" :value="d">{{d}}</option>
              </select>
              <select v-model="addr.town" class="border rounded px-3 py-2 min-w-[160px]">
                <option value="">Select town</option>
                <option v-for="t in townOptions" :key="t" :value="t">{{t}}</option>
              </select>
              <select v-model="addr.nearby" class="border rounded px-3 py-2 min-w-[160px]">
                <option value="">Select nearby area</option>
                <option v-for="n in nearbyOptions" :key="n" :value="n">{{n}}</option>
              </select>
            </div>
            <p class="text-xs text-gray-500 mt-1">Fill according to address writing rules</p>
          </div>
          <div>
            <div class="text-gray-700 mb-1">Detailed address</div>
            <input v-model="addr.detail" class="w-full border rounded px-3 py-2" placeholder="Street, building, apartment" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div class="text-gray-700 mb-1">Recipient</div>
              <input v-model="addr.recipient" class="w-full border rounded px-3 py-2" placeholder="Full name" />
            </div>
            <div>
              <div class="text-gray-700 mb-1">Mobile number</div>
              <input v-model="addr.mobile" class="w-full border rounded px-3 py-2" placeholder="Mobile number" />
            </div>
          </div>
          <div>
            <label class="text-gray-700"><input type="checkbox" v-model="addr.default" class="mr-2"/> Set as default address</label>
          </div>
          <div class="flex gap-3">
            <button class="px-6 py-2 rounded border" @click="resetAddr">Cancel</button>
            <button class="px-6 py-2 rounded bg-orange-500 text-white" @click="saveAddr">Save</button>
          </div>
          <p v-if="addrError" class="text-xs text-red-600">{{addrError}}</p>
        </div>
        <div class="mt-4 bg-orange-50 text-orange-700 text-xs px-3 py-2">
          <p>Tips:</p>
          <p>1. You can add up to 20 addresses. An address used for payment cannot be deleted or modified within 30 days.</p>
          <p>2. Please fill in the recipient name and mobile number accurately and keep the phone reachable to avoid missing delivery or notice.</p>
        </div>
      </div>

      <div v-if="addresses.length" class="bg-white rounded shadow p-6 mt-4">
        <h4 class="text-md font-semibold mb-2">Saved Addresses</h4>
        <ul class="text-sm">
          <li v-for="a in addresses" :key="a.id" class="py-2 border-t flex items-center justify-between">
            <div class="mr-3">
              <span class="mr-2">{{a.province}} {{a.city}} {{a.district}} {{a.town}} {{a.nearby}}</span>
              <span class="mr-2">{{a.detail}}</span>
              <span class="mr-2">{{a.recipient}}</span>
              <span class="text-gray-500">{{a.mobile}}</span>
            </div>
            <div class="flex items-center gap-3">
              <span v-if="a.default" class="text-orange-600">Default</span>
              <button class="text-blue-600" @click="setDefault(a.id)">Set default</button>
              <button class="text-red-600" @click="removeAddr(a.id)">Delete</button>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'

const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : ''
const addr = reactive({ province:'', city:'', district:'', town:'', nearby:'', detail:'', recipient:'', mobile:'', default:false })
const addrError = ref('')
const regionData = reactive({
  Beijing: { Beijing: { Chaoyang: { CBD: ['Railway Station Area','Airport Area'] }, Haidian: { Zhongguancun: ['University Area','Tech Park'] } } },
  Shanghai: { Shanghai: { Pudong: { Lujiazui: ['Financial District','Expo Area'] }, Huangpu: { 'Nanjing Road': ['Downtown','Bund Area'] } } },
  Guangdong: { Guangzhou: { Tianhe: { Zhujiang: ['East Railway Station','Sports Center'] }, Yuexiu: { 'Beijing Road': ['Downtown','Park Area'] } }, Shenzhen: { Nanshan: { 'High-Tech': ['Coastal Area','Tech Park'] }, Futian: { CBD: ['Convention Center','Shopping Area'] } } }
})
const provinceOptions = computed(()=>Object.keys(regionData))
const cityOptions = computed(()=>addr.province ? Object.keys((regionData as any)[addr.province]||{}) : [])
const districtOptions = computed(()=>addr.province && addr.city ? Object.keys(((regionData as any)[addr.province]||{})[addr.city]||{}) : [])
const townOptions = computed(()=>addr.province && addr.city && addr.district ? Object.keys((((regionData as any)[addr.province]||{})[addr.city]||{})[addr.district]||{}) : [])
const nearbyOptions = computed(()=>{
  if(addr.province && addr.city && addr.district && addr.town){
    const arr = ((((regionData as any)[addr.province]||{})[addr.city]||{})[addr.district]||{})[addr.town]
    return Array.isArray(arr) ? arr : []
  }
  return []
})
watch(()=>addr.province,()=>{ addr.city=''; addr.district=''; addr.town=''; addr.nearby='' })
watch(()=>addr.city,()=>{ addr.district=''; addr.town=''; addr.nearby='' })
watch(()=>addr.district,()=>{ addr.town=''; addr.nearby='' })
watch(()=>addr.town,()=>{ addr.nearby='' })
const addresses = ref<any[]>([])
async function loadAddresses(){
  const res = await fetch(`${API_BASE}/api/v1/addresses`, { credentials: 'include' })
  if(res.status === 401){ addrError.value = 'Login required'; return }
  const j = await res.json().catch(()=>({ items: [] }))
  const list = Array.isArray(j.items) ? j.items : []
  addresses.value = list.map((x:any)=>({
    id: x.id,
    province: x.province || '',
    city: x.city || '',
    district: x.district || '',
    town: x.town || '',
    nearby: x.nearby || '',
    detail: x.detail,
    recipient: x.recipient,
    mobile: x.mobile,
    default: !!x.default,
  }))
}
function resetAddr(){ addr.province=''; addr.city=''; addr.district=''; addr.town=''; addr.nearby=''; addr.detail=''; addr.recipient=''; addr.mobile=''; addr.default=false; addrError.value='' }
async function saveAddr(){
  addrError.value=''
  if(!addr.detail || !addr.recipient || !addr.mobile){ addrError.value='Please complete the required fields'; return }
  if(!/^\+?\d[\d\-\s]{5,20}$/.test(addr.mobile)){ addrError.value='Invalid mobile number'; return }
  const res = await fetch(`${API_BASE}/api/v1/addresses`,{ method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify(addr) })
  if(res.status===401){ addrError.value='Login required'; return }
  if(res.status!==201){ const j = await res.json().catch(()=>({message:'Error'})); addrError.value=j.message||'Save failed'; return }
  await loadAddresses()
  resetAddr()
}
async function setDefault(id:string){
  const res = await fetch(`${API_BASE}/api/v1/addresses/${id}/default`,{ method:'PATCH', credentials:'include' })
  if(res.status===200){ await loadAddresses() }
}
async function removeAddr(id:string){
  const res = await fetch(`${API_BASE}/api/v1/addresses/${id}`,{ method:'DELETE', credentials:'include' })
  if(res.status===204){ addresses.value = addresses.value.filter(x=>x.id!==id) }
}
loadAddresses()
</script>
<style scoped>
.nav{display:none}
</style>
