<template>
  <div class="register-page">
    <div class="header">
      <h1>账户注册</h1>
    </div>
    <RegisterForm @submit="handleRegister" />
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/components/RegisterForm.vue'
import request from '@/utils/request'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const handleRegister = async (formData: any) => {
  try {
    // Assuming backend endpoint /auth/register
    await request.post('/auth/register', formData)
    ElMessage.success('Registration successful')
    router.push('/login')
  } catch (error) {
    ElMessage.error('Registration failed')
  }
}
</script>
