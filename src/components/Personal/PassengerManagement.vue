<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPassengers, addPassenger, updatePassenger, deletePassenger, type Passenger } from '@/api/passenger'

const passengers = ref<Passenger[]>([])
const loading = ref(false)
const showForm = ref(false)
const isEdit = ref(false)
const formError = ref('')
const searchName = ref('')
const showSuccess = ref(false)
const successMessage = ref('')
const showError = ref(false)
const errorMessage = ref('')
const errorTitle = ref('')

const showDeleteConfirm = ref(false)
const deleteTarget = ref<{ id: string; name: string } | null>(null)

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

const getMaskedCardNo = (p: Passenger) => {
  if (!p.card_no) return ''
  if (p.card_type !== 'id_card') return p.card_no
  const chars = Array.from(p.card_no)
  const start = 4
  const end = Math.min(14, chars.length - 1)
  if (end < start) return p.card_no
  for (let i = start; i <= end; i += 1) {
    chars[i] = '*'
  }
  return chars.join('')
}

const fetchPassengers = async (name?: string) => {
  loading.value = true
  try {
    const response = await getPassengers({ name })
    passengers.value = response.data.map((p: any) => {
      // Map backend Chinese values to frontend English enums
      let mappedType = 'adult'
      if (p.passenger_type === '成人') mappedType = 'adult'
      else if (p.passenger_type === '学生') mappedType = 'student'
      else if (p.passenger_type === '儿童') mappedType = 'child'
      
      let mappedCardType = 'id_card'
      if (p.card_type === '居民身份证') mappedCardType = 'id_card'
      else if (p.card_type === '护照') mappedCardType = 'passport'
      
      return {
        ...p,
        type: mappedType,
        card_type: mappedCardType
      }
    }).sort((a: Passenger, b: Passenger) => {
      const aDefault = a.is_default ? 1 : 0
      const bDefault = b.is_default ? 1 : 0
      if (aDefault !== bDefault) return bDefault - aDefault
      return (a.name || '').localeCompare(b.name || '')
    })
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  await fetchPassengers(searchName.value)
}

const handleClearSearch = async () => {
  if (!searchName.value) return
  searchName.value = ''
  await fetchPassengers()
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

const openDeleteConfirm = (p: Passenger) => {
  if (!p.id) return
  deleteTarget.value = { id: p.id, name: p.name || '' }
  showDeleteConfirm.value = true
}

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  try {
    await deletePassenger(deleteTarget.value.id)
    closeDeleteConfirm()
    fetchPassengers(searchName.value)
  } catch (err: any) {
    errorTitle.value = '删除乘车人'
    errorMessage.value = err.response?.data?.error || '删除失败'
    showError.value = true
    closeDeleteConfirm()
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
      successMessage.value = '修改成功!'
    } else {
      await addPassenger(formData.value)
      successMessage.value = '保存成功!'
    }
    showForm.value = false
    fetchPassengers(searchName.value)
    showSuccess.value = true
  } catch (err: any) {
    const status = err.response?.status
    const backendError = err.response?.data?.error
    if (status === 409 || backendError === 'Passenger already exists') {
      errorMessage.value = '该联系人已存在，请使用不同的姓名和证件'
      showError.value = true
      return
    }
    formError.value = backendError || '保存失败'
  }
}

const handleCloseSuccess = () => {
  showSuccess.value = false
  successMessage.value = ''
}

const handleCloseError = () => {
  showError.value = false
  errorMessage.value = ''
  errorTitle.value = ''
}

onMounted(() => {
  fetchPassengers()
})
</script>

<template>
  <div class="passenger-management">
    <div class="header">
      <!-- <h3>常用联系人</h3> -->
      <button class="btn-add" @click="handleAdd">+ 添加乘车人</button>
    </div>

    <div class="search-bar">
      <div class="search-input">
        <input
          v-model="searchName"
          type="text"
          placeholder="请输入乘客姓名"
          @keyup.enter="handleSearch"
        />
        <button class="btn-clear" v-if="searchName" @click="handleClearSearch">×</button>
      </div>
      <button class="btn-search" @click="handleSearch">查询</button>
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
            <td>{{ getMaskedCardNo(p) }}</td>
            <td>{{ p.phone || '-' }}</td>
            <td>{{ typeMap[p.type || ''] || p.type }}</td>
            <td class="actions">
              <template v-if="!p.is_default">
                <button @click="openDeleteConfirm(p)" class="btn-delete" aria-label="删除">
                  <span class="delete-icon" aria-hidden="true"></span>
                  <span class="sr-only">删除</span>
                </button>
                <button @click="handleEdit(p)" class="btn-edit" aria-label="编辑">
                  <span class="edit-icon" aria-hidden="true"></span>
                  <span class="sr-only">编辑</span>
                </button>
              </template>
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

    <div v-if="showSuccess" class="modal-overlay">
      <div class="modal-content success-modal">
        <div class="modal-header success-header">
          <h4>{{ isEdit ? '修改乘车人' : '新增乘车人' }}</h4>
          <span class="close" @click="handleCloseSuccess">&times;</span>
        </div>
        <div class="modal-body success-body">
          <div class="success-row">
            <span class="success-icon">✓</span>
            <span class="success-text">{{ successMessage }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="handleCloseSuccess" class="btn-save">确定</button>
        </div>
      </div>
    </div>

    <div v-if="showError" class="modal-overlay">
      <div class="modal-content error-modal">
        <div class="modal-header error-header">
          <h4>{{ errorTitle || (isEdit ? '修改乘车人' : '添加乘车人') }}</h4>
          <span class="close" @click="handleCloseError">&times;</span>
        </div>
        <div class="modal-body error-body">
          <div class="error-row">
            <span class="error-icon">×</span>
            <span class="error-text">{{ errorMessage }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="handleCloseError" class="btn-save">确定</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal-content delete-modal">
        <div class="modal-header delete-header">
          <h4>删除乘车人</h4>
          <span class="close delete-close" @click="closeDeleteConfirm">&times;</span>
        </div>
        <div class="modal-body delete-body">
          <div class="delete-row">
            <span class="delete-question">?</span>
            <span class="delete-text">您确定要删除选中的乘车人吗?</span>
          </div>
        </div>
        <div class="modal-footer delete-footer">
          <button @click="closeDeleteConfirm" class="btn-delete-cancel">取消</button>
          <button @click="confirmDelete" class="btn-delete-confirm">确定</button>
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

.search-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;

  .search-input {
    position: relative;
    flex: 1;

    input {
      width: 100%;
      padding: 8px 36px 8px 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .btn-clear {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      font-size: 18px;
      line-height: 18px;
      color: #999;
      cursor: pointer;
    }
  }

  .btn-search {
    background: #ff9a00;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: #e68a00;
    }
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
    display: flex;
    align-items: center;
    gap: 10px;

    button {
      cursor: pointer;
      background: none;
      border: none;
      
      &.btn-edit { color: #007bff; }
      &.btn-delete { color: #dc3545; }
    }

    .delete-icon {
      width: 18px;
      height: 18px;
      display: inline-block;
      vertical-align: middle;
      background-color: #dc3545;
      -webkit-mask-image: url('/images/删除.svg');
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-position: center;
      -webkit-mask-size: contain;
      mask-image: url('/images/删除.svg');
      mask-repeat: no-repeat;
      mask-position: center;
      mask-size: contain;
    }

    .edit-icon {
      width: 18px;
      height: 18px;
      display: inline-block;
      vertical-align: middle;
      background-color: #007bff;
      -webkit-mask-image: url('/images/修改.svg');
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-position: center;
      -webkit-mask-size: contain;
      mask-image: url('/images/修改.svg');
      mask-repeat: no-repeat;
      mask-position: center;
      mask-size: contain;
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

.delete-modal {
  width: 660px;
}

.delete-header {
  background: #3f8efc;
  color: #fff;
  border-bottom: none;
}

.delete-close {
  color: #fff;
}

.delete-body {
  padding: 26px 20px;
}

.delete-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.delete-question {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f4b400;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  line-height: 22px;
}

.delete-text {
  font-size: 18px;
  color: #333;
}

.delete-footer {
  text-align: center;
}

.btn-delete-cancel {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
}

.btn-delete-confirm {
  background: #ff9a00;
  color: #fff;
}

.btn-delete-confirm:hover {
  background: #e68a00;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.success-modal {
  width: 520px;
}

.success-header {
  background: #4fd3dd;
  color: #fff;
  border-bottom: none;
}

.success-body {
  padding: 26px 20px;
}

.success-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.success-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #2ecc71;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.success-text {
  font-size: 16px;
  color: #333;
}

.error-modal {
  width: 520px;
}

.error-header {
  background: #3f8efc;
  color: #fff;
  border-bottom: none;
}

.error-body {
  padding: 26px 20px;
}

.error-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e74c3c;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.error-text {
  font-size: 16px;
  color: #333;
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
