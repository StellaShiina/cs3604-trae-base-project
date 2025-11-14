<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-6xl mx-auto flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="logo" class="h-8 w-auto" />
          <nav class="hidden md:flex items-center gap-6 text-sm">
            <a class="text-gray-700" href="#" @click.prevent="$router.push('/')">Home</a>
            <a class="text-gray-700" href="#" @click.prevent="$router.push('/booking')">Booking</a>
          </nav>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <a href="#" class="text-gray-700">Login</a>
          <a href="#" @click.prevent="$router.push('/register')" class="text-gray-700">Register</a>
        </div>
      </div>
      <div class="h-2 bg-blue-600"></div>
    </header>
    <div class="relative">
      <img src="/banner1.png" class="w-full h-72 md:h-[420px] object-cover" alt="banner" />
      <section class="absolute right-8 md:right-24 top-10 md:top-16 bg-white rounded shadow p-6 w-[320px]">
        <h2 class="text-xl font-semibold mb-3">Login</h2>
        <input v-model="identifier" class="w-full border rounded px-3 py-2 mb-2" placeholder="Email/Username/Mobile number" />
        <input v-model="password" class="w-full border rounded px-3 py-2 mb-3" type="password" placeholder="Password" />
        <button class="w-full bg-orange-500 text-white py-2 rounded" @click="login">LOGIN</button>
        <p class="text-sm mt-2">No account yet? <a href="#" @click.prevent="$router.push('/register')" class="text-blue-600">Register now!</a></p>
        <p v-if="error" class="text-sm text-red-600 mt-2">{{error}}</p>
      </section>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const identifier = ref('')
const password = ref('')
const error = ref('')
async function login(){
  error.value = ''
  const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : ''
  const res = await fetch(`${API_BASE}/api/v1/auth/login`,{ method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({identifier: identifier.value, password: password.value}) })
  if(res.status===200){ router.push('/') } else { const j = await res.json().catch(()=>({message:'Error'})); error.value = j.message || 'Invalid credentials'}
}
</script>
<style scoped>
.nav{display:none}
</style>