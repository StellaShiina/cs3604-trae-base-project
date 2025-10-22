<template>
  <div class="user-profile">
    <h3>个人信息</h3>
    
    <div v-if="isLoading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="userProfile" class="profile-content">
      <div class="profile-item">
        <label>用户名：</label>
        <span>{{ userProfile.username }}</span>
      </div>
      
      <div class="profile-item">
        <label>邮箱：</label>
        <span>{{ userProfile.email }}</span>
      </div>
      
      <div class="profile-item">
        <label>手机号：</label>
        <span>{{ userProfile.phone || '未设置' }}</span>
      </div>
      
      <div class="profile-item">
        <label>真实姓名：</label>
        <span>{{ userProfile.realName || '未设置' }}</span>
      </div>
      
      <div class="profile-item">
        <label>身份证号：</label>
        <span>{{ userProfile.idCard || '未设置' }}</span>
      </div>
      
      <div class="profile-item">
        <label>注册时间：</label>
        <span>{{ formatDate(userProfile.createdAt) }}</span>
      </div>
      
      <button @click="editProfile" class="edit-btn">
        编辑个人信息
      </button>
    </div>
    
    <div v-else class="error">
      {{ errorMessage || '加载用户信息失败' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface User {
  id?: number
  userId?: string
  username: string
  email: string
  phoneNumber?: string
  phone?: string
  realName?: string
  idNumber?: string
  createdAt?: string
}

interface UserProfile {
  id: number | string
  username: string
  email: string
  phone?: string
  realName?: string
  idCard?: string
  createdAt: string
}

const props = defineProps<{
  user?: User | null
}>()

const userProfile = ref<UserProfile | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const loadUserProfile = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 优先使用props传入的用户信息
    if (props.user) {
      console.log('Props user data:', props.user)
      userProfile.value = {
        id: props.user.id || props.user.userId || '',
        username: props.user.username,
        email: props.user.email,
        phone: props.user.phoneNumber || props.user.phone,
        realName: props.user.realName || '未设置',
        idCard: props.user.idNumber,
        createdAt: props.user.createdAt || '2024/1/1'
      }
    } else {
      // 从localStorage获取用户信息
      const userStr = localStorage.getItem('user')
      console.log('LocalStorage user string:', userStr)
      if (userStr && userStr !== 'undefined') {
        const user = JSON.parse(userStr)
        console.log('Parsed user data:', user)
        userProfile.value = {
          id: user.id || user.userId || '',
          username: user.username,
          email: user.email,
          phone: user.phoneNumber || user.phone,
          realName: user.realName || '未设置',
          idCard: user.idNumber,
          createdAt: user.createdAt || '2024/1/1'
        }
      } else {
        errorMessage.value = '未找到用户信息，请重新登录'
      }
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
    errorMessage.value = '加载用户信息失败'
  } finally {
    isLoading.value = false
  }
}

// 监听props变化
watch(() => props.user, () => {
  loadUserProfile()
}, { immediate: true })

const editProfile = () => {
  // TODO: Implement edit profile logic
  console.log('Edit profile not implemented yet')
}

const formatDate = (dateString: string) => {
  // TODO: Implement proper date formatting
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  if (!props.user) {
    loadUserProfile()
  }
})
</script>

<style scoped>
.user-profile {
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.profile-content {
  max-width: 600px;
}

.profile-item {
  display: flex;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.profile-item label {
  width: 120px;
  font-weight: bold;
  color: #666;
}

.profile-item span {
  flex: 1;
}

.edit-btn {
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  text-align: center;
  padding: 2rem;
}
</style>