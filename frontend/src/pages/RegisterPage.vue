<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-6xl mx-auto flex items-center justify-between py-3">
        <div class="flex items-center gap-3">
          <img src="/logo.png" alt="logo" class="h-8 w-auto" />
          <nav class="hidden md:flex items-center gap-6 text-sm">
            <a class="text-gray-700" href="#" @click.prevent="$router.push('/')">Home</a>
            <a class="text-gray-700" href="#" @click.prevent="$router.push('/booking')">Booking</a>
            <a class="text-gray-700" href="#">Travel guides</a>
          </nav>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <a href="#" @click.prevent="$router.push('/login')" class="text-gray-700">Login</a>
          <a href="#" class="text-gray-700">Register</a>
        </div>
      </div>
      <div class="h-2 bg-blue-600"></div>
    </header>
    <section class="max-w-4xl mx-auto mt-6 bg-white rounded shadow p-6">
      <h2 class="text-xl font-semibold mb-3">Create an account</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="text-sm text-gray-700">Nationality</label><select v-model="nationality" class="mt-1 w-full border rounded px-3 py-2"><option value="">Please select</option><option value="CN">China</option><option value="US">United States</option></select></div>
        <div class="text-xs text-gray-500">At present, only foreign passports are accepted for registration.</div>
        <div><label class="text-sm text-gray-700">Name</label><input v-model="name" class="mt-1 w-full border rounded px-3 py-2" placeholder="Name" /></div>
        <div><label class="text-sm text-gray-700">Passport number</label><input v-model="passportNumber" class="mt-1 w-full border rounded px-3 py-2" placeholder="Passport number" /></div>
        <div><label class="text-sm text-gray-700">Passport expiration date</label><input v-model="passportExpirationDate" type="date" class="mt-1 w-full border rounded px-3 py-2" /></div>
        <div><label class="text-sm text-gray-700">Date of birth</label><input v-model="dateOfBirth" type="date" class="mt-1 w-full border rounded px-3 py-2" /></div>
        <div class="flex items-center gap-6"><span class="text-sm text-gray-700">Gender</span><label><input type="radio" value="male" v-model="gender" /> Male</label><label><input type="radio" value="female" v-model="gender" /> Female</label></div>
        <div><label class="text-sm text-gray-700">Username</label><input v-model="username" class="mt-1 w-full border rounded px-3 py-2" placeholder="Username" /></div>
        <div><label class="text-sm text-gray-700">Password</label><input v-model="password" type="password" class="mt-1 w-full border rounded px-3 py-2" placeholder="Password" /></div>
        <div><label class="text-sm text-gray-700">Confirm Password</label><input v-model="confirmPassword" type="password" class="mt-1 w-full border rounded px-3 py-2" placeholder="Confirm Password" /></div>
        <div><label class="text-sm text-gray-700">Email address</label><input v-model="email" class="mt-1 w-full border rounded px-3 py-2" placeholder="Email address" /></div>
        <div class="md:col-span-2"><label class="text-sm text-gray-700"><input type="checkbox" v-model="agreeTerms" class="mr-2"/> I have read and agree to abide by Terms of Service and Privacy Policy of 12306.cn.</label></div>
      </div>
      <div class="mt-4">
        <button class="bg-orange-500 text-white px-6 py-2 rounded" @click="register">Next step</button>
        <p v-if="error" class="text-sm text-red-600 mt-2">{{error}}</p>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const nationality = ref('')
const name = ref('')
const passportNumber = ref('')
const passportExpirationDate = ref('')
const dateOfBirth = ref('')
const gender = ref('male')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const agreeTerms = ref(false)
const error = ref('')
async function register(){
  error.value=''
  if(password.value!==confirmPassword.value){ error.value='Passwords do not match'; return }
  const body = { nationality: nationality.value, name: name.value, passportNumber: passportNumber.value, passportExpirationDate: passportExpirationDate.value, dateOfBirth: dateOfBirth.value, gender: gender.value, username: username.value, password: password.value, email: email.value, agreeTerms: agreeTerms.value }
  const API_BASE = import.meta.env.DEV ? 'http://localhost:8080' : ''
  const res = await fetch(`${API_BASE}/api/v1/auth/register`,{ method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
  if(res.status===201){ router.push('/login') } else { const j = await res.json().catch(()=>({message:'Error'})); error.value = j.message || 'Register failed'}
}
</script>
<style scoped>
.nav{display:none}
</style>