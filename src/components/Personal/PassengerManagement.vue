<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPassengers, addPassenger, updatePassenger, deletePassenger, type Passenger } from '@/api/passenger'

const passengers = ref<Passenger[]>([])
const loading = ref(false)
const showForm = ref(false)
const isEdit = ref(false)
const formError = ref('')

const formData = ref<Passenger>({
  name: '',
  card_type: 'id_card',
  card_no: '',
  phone: '',
  type: 'adult'
})

const idTypeMap: Record<string, string> = {
  id_card: '身份证',
  passport: '护照'
}

const typeMap: Record<string, string> = {
  adult: '成人',
  student: '学生',
  child: '儿童'
}

const fetchPassengers = async () => {
  loading.value = true
  try {
    const response = await getPassengers()
    passengers.value = response.data.map((p: any) => ({
      ...p,
      type: p.passenger_type // Map backend passenger_type to type
    }))
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  formData.value = {
    name: '',
    card_type: 'id_card',
    card_no: '',
    phone: '',
    type: 'adult'
  }
  showForm.value = true
  formError.value = ''
}

const handleEdit = (p: Passenger) => {
  isEdit.value = true
  formData.value = { ...p }
  showForm.value = true
  formError.value = ''
}

const handleDelete = async (id: string) => {
  if (!confirm('确定要删除该乘车人吗？')) return
  try {
    await deletePassenger(id)
    fetchPassengers()
  } catch (err: any) {
    alert(err.response?.data?.error || '删除失败')
  }
}

const handleSubmit = async () => {
  formError.value = ''
  if (!formData.value.name || !formData.value.card_no) {
    formError.value = '请填写完整信息'
    return
  }
  
  try {
    if (isEdit.value && formData.value.id) {
      await updatePassenger(formData.value.id, formData.value)
    } else {
      await addPassenger(formData.value)
    }
    showForm.value = false
    fetchPassengers()
  } catch (err: any) {
    formError.value = err.response?.data?.error || '保存失败'
  }
}

onMounted(() => {
  fetchPassengers()
})
</script>

<template>
  <div class="passenger-management">
    <div class="header">
      <h3>常用联系人</h3>
      <button class="btn-add" @click="handleAdd">+ 添加乘车人</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    
    <!-- List -->
    <div v-else class="passenger-list">
      <table class="p-table">
        <thead>
          <tr>
            <th>姓名</th>
            <th>证件类型</th>
            <th>证件号码</th>
            <th>手机号</th>
            <th>旅客类型</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in passengers" :key="p.id">
            <td>{{ p.name }}</td>
            <td>{{ idTypeMap[p.card_type] || p.card_type }}</td>
            <td>{{ p.card_no }}</td>
            <td>{{ p.phone || '-' }}</td>
            <td>{{ typeMap[p.type || ''] || p.type }}</td>
            <td class="actions">
              <button @click="handleEdit(p)" class="btn-edit">编辑</button>
              <button @click="p.id && handleDelete(p.id)" class="btn-delete">删除</button>
            </td>
          </tr>
          <tr v-if="passengers.length === 0">
            <td colspan="6" class="empty">暂无乘车人信息</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showForm" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h4>{{ isEdit ? '编辑乘车人' : '添加乘车人' }}</h4>
          <span class="close" @click="showForm = false">&times;</span>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="formData.name" placeholder="请输入姓名" />
          </div>
          <div class="form-group">
            <label>证件类型</label>
            <select v-model="formData.card_type">
              <option value="id_card">身份证</option>
              <option value="passport">护照</option>
            </select>
          </div>
          <div class="form-group">
            <label>证件号码</label>
            <input v-model="formData.card_no" placeholder="请输入证件号码" />
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input v-model="formData.phone" placeholder="请输入手机号（选填）" />
          </div>
          <div class="form-group">
            <label>旅客类型</label>
            <select v-model="formData.type">
              <option value="adult">成人</option>
              <option value="student">学生</option>
              <option value="child">儿童</option>
            </select>
          </div>
          <div v-if="formError" class="form-error">{{ formError }}</div>
        </div>
        <div class="modal-footer">
          <button @click="showForm = false" class="btn-cancel">取消</button>
          <button @click="handleSubmit" class="btn-save">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.passenger-management {
  padding: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 { margin: 0; }
  
  .btn-add {
    background: #007bff;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    
    &:hover { background: #0056b3; }
  }
}

.p-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    border: 1px solid #eee;
    padding: 12px;
    text-align: left;
  }
  
  th {
    background: #f8f9fa;
    font-weight: bold;
  }
  
  .actions {
    button {
      margin-right: 10px;
      cursor: pointer;
      background: none;
      border: none;
      
      &.btn-edit { color: #007bff; }
      &.btn-delete { color: #dc3545; }
    }
  }
  
  .empty { text-align: center; color: #999; padding: 30px; }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h4 { margin: 0; }
  .close { cursor: pointer; font-size: 24px; color: #999; }
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input, select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
}

.form-error {
  color: red;
  font-size: 14px;
  margin-top: 10px;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  text-align: right;
  
  button {
    padding: 8px 20px;
    border-radius: 4px;
    margin-left: 10px;
    cursor: pointer;
    border: none;
  }
  
  .btn-cancel {
    background: #f5f5f5;
    color: #333;
    &:hover { background: #e9ecef; }
  }
  
  .btn-save {
    background: #ff9a00;
    color: #fff;
    &:hover { background: #e68a00; }
  }
}
</style>
