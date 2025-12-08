<template>
  <Teleport to="body">
    <div v-if="isVisible" class="passenger-edit-modal">
      <div class="modal-overlay" @click="handleOverlayClick"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? '编辑乘车人' : '添加乘车人' }}</h3>
          <button class="close-button" @click="handleClose">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label class="form-label required">姓名</label>
              <input
                type="text"
                v-model="formData.name"
                class="form-input"
                placeholder="请输入姓名"
                :class="{ error: errors.name }"
              />
              <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
            </div>

            <div class="form-group">
              <label class="form-label required">证件类型</label>
              <SelectDropdown
                :options="idTypeOptions"
                :value="formData.card_type"
                placeholder="请选择证件类型"
                @update:value="val => formData.card_type = val"
              />
            </div>

            <div class="form-group">
              <label class="form-label required">证件号码</label>
              <input
                type="text"
                v-model="formData.card_no"
                class="form-input"
                placeholder="请输入证件号码"
                :class="{ error: errors.card_no }"
              />
              <span v-if="errors.card_no" class="error-text">{{ errors.card_no }}</span>
            </div>

            <div class="form-group">
              <label class="form-label required">旅客类型</label>
              <SelectDropdown
                :options="passengerTypeOptions"
                :value="formData.type"
                placeholder="请选择旅客类型"
                @update:value="val => formData.type = val"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">手机号码</label>
              <input
                type="text"
                v-model="formData.mobile"
                class="form-input"
                placeholder="请输入手机号码（选填）"
              />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="handleClose">取消</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? '保存中...' : '保存' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import SelectDropdown from './SelectDropdown.vue'
import type { AddPassengerRequest } from '../api/passenger'

interface Props {
  isVisible: boolean
  passenger?: any // Passenger object for edit
  isSubmitting?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: AddPassengerRequest): void
}>()

const isEdit = computed(() => !!props.passenger)

const formData = reactive({
  name: '',
  card_type: 'id_card',
  card_no: '',
  type: 'adult',
  mobile: ''
})

const errors = reactive({
  name: '',
  card_no: ''
})

const idTypeOptions = [
  { value: 'id_card', label: '中国居民身份证' },
  { value: 'passport', label: '护照' }
]

const passengerTypeOptions = [
  { value: 'adult', label: '成人' },
  { value: 'student', label: '学生' },
  { value: 'child', label: '儿童' },
  { value: 'soldier', label: '残疾军人' }
]

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    if (props.passenger) {
      formData.name = props.passenger.name
      formData.card_type = props.passenger.card_type || 'id_card'
      formData.card_no = props.passenger.card_no
      formData.type = props.passenger.type || 'adult'
      // formData.mobile = props.passenger.mobile || '' // Assuming mobile might be added later
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  formData.name = ''
  formData.card_type = 'id_card'
  formData.card_no = ''
  formData.type = 'adult'
  formData.mobile = ''
  errors.name = ''
  errors.card_no = ''
}

const validate = () => {
  let isValid = true
  errors.name = ''
  errors.card_no = ''

  if (!formData.name.trim()) {
    errors.name = '请输入姓名'
    isValid = false
  }

  if (!formData.card_no.trim()) {
    errors.card_no = '请输入证件号码'
    isValid = false
  } else if (formData.card_type === 'id_card' && !/^\d{17}[\dXx]$/.test(formData.card_no)) {
    errors.card_no = '请输入正确的身份证号码'
    isValid = false
  }

  return isValid
}

const handleSubmit = () => {
  if (!validate()) return

  emit('submit', {
    name: formData.name,
    card_type: formData.card_type,
    card_no: formData.card_no,
    type: formData.type
    // mobile: formData.mobile
  })
}

const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  // Optional: close on overlay click
  // emit('close')
}
</script>

<style>
.passenger-edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background-color: #ffffff;
  border-radius: 4px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 4px 4px 0 0;
}

.modal-title {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.close-button {
  border: none;
  background: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.close-button:hover {
  color: #666;
}

.modal-body {
  padding: 20px 40px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.form-label.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4px;
}

.form-input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input.error {
  border-color: #ff4d4f;
}

.error-text {
  display: block;
  margin-top: 5px;
  color: #ff4d4f;
  font-size: 12px;
}

.modal-footer {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.btn-secondary {
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  color: #666;
}

.btn-secondary:hover {
  background-color: #e6e6e6;
}

.btn-primary {
  background-color: #FF8001;
  color: white;
}

.btn-primary:hover {
  background-color: #ff9933;
}

.btn-primary:disabled {
  background-color: #ffcd99;
  cursor: not-allowed;
}
</style>
