<template>
  <div class="passenger-form">
    <h3>{{ isEdit ? '编辑乘客' : '添加乘客' }}</h3>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">姓名 *</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          placeholder="请输入乘客姓名"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="idCard">身份证号 *</label>
        <input
          id="idCard"
          v-model="formData.idCard"
          type="text"
          placeholder="请输入身份证号"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="phone">手机号</label>
        <input
          id="phone"
          v-model="formData.phone"
          type="tel"
          placeholder="请输入手机号"
        />
      </div>
      
      <div class="form-group">
        <label for="type">乘客类型 *</label>
        <select id="type" v-model="formData.type" required>
          <option value="adult">成人</option>
          <option value="child">儿童</option>
          <option value="student">学生</option>
        </select>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="handleCancel" class="cancel-btn">
          取消
        </button>
        <button type="submit" :disabled="isLoading" class="submit-btn">
          {{ isLoading ? '保存中...' : (isEdit ? '更新' : '添加') }}
        </button>
      </div>
    </form>
    
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface PassengerFormData {
  name: string
  idCard: string
  phone: string
  type: 'adult' | 'child' | 'student'
}

interface Passenger extends PassengerFormData {
  id: number
}

const props = defineProps<{
  passenger?: Passenger
  isEdit?: boolean
}>()

const emit = defineEmits<{
  submit: [data: PassengerFormData]
  cancel: []
}>()

const formData = ref<PassengerFormData>({
  name: '',
  idCard: '',
  phone: '',
  type: 'adult'
})

const isLoading = ref(false)
const errorMessage = ref('')

// Watch for passenger prop changes to populate form
watch(() => props.passenger, (newPassenger) => {
  if (newPassenger) {
    formData.value = {
      name: newPassenger.name,
      idCard: newPassenger.idCard,
      phone: newPassenger.phone || '',
      type: newPassenger.type
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  // TODO: Implement form submission logic
  // - Validate form data
  // - Call appropriate API (add or update)
  // - Handle success/error responses
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('submit', formData.value)
    console.log('Passenger form submission not implemented yet', formData.value)
    errorMessage.value = 'Passenger form submission not implemented yet'
  } catch (error) {
    errorMessage.value = 'Failed to save passenger'
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.passenger-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 1rem;
  text-align: center;
}
</style>