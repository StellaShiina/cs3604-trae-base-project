<template>
  <div class="passenger-list-container">
    <!-- List View -->
    <div v-if="currentView === 'list'" class="passenger-list-panel">
      <div class="search-section">
        <div class="search-group">
          <div class="search-input-wrapper">
            <input
              type="text"
              class="search-input"
              v-model="searchKeyword"
              placeholder="请输入乘客姓名"
              @keyup.enter="handleSearch"
            />
            <button v-if="searchKeyword" class="clear-input-button" @click="handleClearSearch">
              ✕
            </button>
          </div>
          <button class="passenger-search-button" @click="handleSearch">
            查询
          </button>
        </div>
      </div>

      <div class="table-section">
        <div class="table-header-row">
          <table class="header-table">
            <thead>
              <tr>
                <th class="checkbox-index-header">序号</th>
                <th class="name-header">姓名</th>
                <th class="id-type-header">证件类型</th>
                <th class="id-number-header">证件号码</th>
                <th class="phone-header">手机/电话</th>
                <th class="verification-header">核验状态</th>
                <th class="action-header">操作</th>
              </tr>
            </thead>
          </table>
        </div>
        <div class="table-actions">
          <button class="add-button" @click="switchToAdd">
            <img src="/images/plus-circle-fill.svg" alt="添加" class="add-icon" />
            <span class="add-text">添加</span>
          </button>
          <button class="batch-delete-button" @click="handleBatchDelete">
            <img src="/images/删除.svg" alt="删除" class="delete-icon" />
            <span class="delete-text">批量删除</span>
          </button>
        </div>

        <PassengerTable
          :passengers="displayPassengers"
          :selectedIds="selectedPassengers"
          @select="handleSelectionChange"
          @edit="switchToEdit"
          @delete="handleSingleDelete"
        />
      </div>

      <ConfirmModal
        :isVisible="showDeleteModal"
        title="提示"
        :message="deleteModalMessage"
        confirmText="确定"
        cancelText="取消"
        @confirm="confirmDelete"
        @cancel="showDeleteModal = false"
      />
    </div>

    <!-- Add View -->
    <AddPassengerPanel
      v-if="currentView === 'add'"
      @submit="handleAddSubmit"
      @cancel="switchToList"
    />

    <!-- Edit View -->
    <EditPassengerPanel
      v-if="currentView === 'edit' && editingPassenger"
      :passenger="editingPassenger"
      @submit="handleEditSubmit"
      @cancel="switchToList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getPassengers, addPassenger, updatePassenger, deletePassenger } from '../api/passenger'
import type { Passenger } from '../api/passenger'
import PassengerTable from '../components/PassengerTable.vue'
import AddPassengerPanel from '../components/AddPassengerPanel.vue'
import EditPassengerPanel from '../components/EditPassengerPanel.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { toast } from '../utils/toast'

// State
const currentView = ref<'list' | 'add' | 'edit'>('list')
const passengers = ref<Passenger[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const selectedPassengers = ref<string[]>([])
const showDeleteModal = ref(false)
const deleteMode = ref<'single' | 'batch'>('batch')
const deleteTargetId = ref<string>('')
const editingPassenger = ref<Passenger | null>(null)

// Computed
const displayPassengers = computed(() => {
  if (!searchKeyword.value) return passengers.value
  return passengers.value.filter(p => p.name.includes(searchKeyword.value))
})

const deleteModalMessage = computed(() => {
  if (deleteMode.value === 'batch') {
    return `确定要删除选中的${selectedPassengers.value.length}个乘客吗？`
  } else {
    return '您确定要删除该乘客吗？'
  }
})

// Lifecycle
onMounted(() => {
  fetchPassengers()
})

// Methods
const fetchPassengers = async () => {
  loading.value = true
  try {
    passengers.value = await getPassengers()
  } catch (error) {
    console.error('Failed to fetch passengers:', error)
    toast.error('获取乘客列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // Search is handled by computed property
}

const handleClearSearch = () => {
  searchKeyword.value = ''
}

const switchToAdd = () => {
  currentView.value = 'add'
}

const switchToList = () => {
  currentView.value = 'list'
  editingPassenger.value = null
}

const switchToEdit = (passenger: Passenger) => {
  editingPassenger.value = passenger
  currentView.value = 'edit'
}

const handleSelectionChange = (ids: string[]) => {
  selectedPassengers.value = ids
}

const handleBatchDelete = () => {
  if (selectedPassengers.value.length === 0) {
    toast.warning('请选择要删除的乘客')
    return
  }
  deleteMode.value = 'batch'
  showDeleteModal.value = true
}

const handleSingleDelete = (id: string) => {
  deleteTargetId.value = id
  deleteMode.value = 'single'
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  showDeleteModal.value = false
  
  try {
    if (deleteMode.value === 'batch') {
      await Promise.all(selectedPassengers.value.map(id => deletePassenger(id)))
      toast.success('批量删除成功')
      selectedPassengers.value = []
    } else {
      await deletePassenger(deleteTargetId.value)
      toast.success('删除成功')
      // Remove from selected if present
      if (selectedPassengers.value.includes(deleteTargetId.value)) {
        selectedPassengers.value = selectedPassengers.value.filter(sid => sid !== deleteTargetId.value)
      }
    }
    await fetchPassengers()
  } catch (error) {
    console.error('Delete failed:', error)
    toast.error(deleteMode.value === 'batch' ? '批量删除失败' : '删除失败')
  }
}

const handleAddSubmit = async (data: any) => {
  try {
    const payload = {
      name: data.name,
      card_type: mapCardTypeToApi(data.type), // Note: AddPassengerPanel returns 'type' as card type name
      card_no: data.id_card, // AddPassengerPanel returns 'id_card'
      type: mapTypeToApi(data.discountType),
      phone: data.phone
    }
    
    await addPassenger(payload)
    toast.success('添加乘客成功')
    switchToList()
    await fetchPassengers()
  } catch (error) {
    console.error('Add passenger failed:', error)
    toast.error('添加乘客失败')
  }
}

const handleEditSubmit = async (data: any) => {
  if (!editingPassenger.value) return
  
  try {
    const payload = {
      name: editingPassenger.value.name,
      card_type: editingPassenger.value.card_type,
      card_no: editingPassenger.value.card_no,
      type: mapTypeToApi(data.discountType),
      phone: data.phone
    }
    
    await updatePassenger(editingPassenger.value.id, payload)
    toast.success('修改乘客成功')
    switchToList()
    await fetchPassengers()
  } catch (error) {
    console.error('Update passenger failed:', error)
    toast.error('修改乘客失败')
  }
}

// Helpers
const mapCardTypeToApi = (type: string) => {
  const map: Record<string, string> = {
    '居民身份证': 'id_card',
    '港澳居民来往内地通行证': 'passport',
    '台湾居民来往大陆通行证': 'passport',
    '护照': 'passport'
  }
  return map[type] || 'id_card'
}

const mapTypeToApi = (type: string) => {
  const map: Record<string, string> = {
    '成人': 'adult',
    '学生': 'student',
    '儿童': 'child',
    '残军': 'disability',
    '残疾军人': 'disability'
  }
  return map[type] || 'adult'
}
</script>

<style>
/* Main Container */
.passenger-list-container {
  max-width: 100%;
  margin: 0 auto;
}

/* Passenger List Panel Styles (from reference) */
.passenger-list-panel {
  background-color: #fff;
  margin: 15px 30px;
  border-radius: 0;
  box-shadow: none;
}

.search-section {
  padding: 20px 0px;
  background-color: #fff;
}

.search-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input-wrapper {
  position: relative;
  flex: 0 0 auto;
}

.search-input {
  width: 200px !important;
  padding: 7px 32px 7px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 0;
  font-size: 14px;
  outline: none;
}

.search-input::placeholder {
  color: #333;
}

.search-input:focus {
  border-color: #2876c8;
}

.clear-input-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ccc;
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  width: 18px;
  height: 18px;
  line-height: 18px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  z-index: 10;
}

.clear-input-button:hover {
  background-color: #999;
}

.passenger-search-button {
  padding: 6px 28px;
  background-color: #fff !important;
  border: 1px solid #d0d0d0 !important;
  border-radius: 2px;
  color: #333 !important;
  cursor: pointer;
  font-size: 14px !important;
  text-align: center;
  font-weight: 400 !important;
  transition: all 0.2s ease;
}

.passenger-search-button:hover {
  border-color: #ff8000 !important;
  color: #ff8000 !important;
}

.table-section {
  padding: 0;
}

.table-header-row {
  background-color: #f8f8f8;
  margin-bottom: 20px;
}

.header-table {
  width: 100%;
  border-collapse: collapse;
}

.header-table th {
  padding: 12px 0px;
  text-align: center;
  font-size: 14px;
  color: #444;
  font-weight: 500;
}

.checkbox-index-header {
  width: 100px;
  text-align: center;
}

.name-header {
  width: 120px;
}

.id-type-header {
  width: 150px;
}

.id-number-header {
  width: 200px;
}

.phone-header {
  width: 150px;
}

.verification-header {
  width: 120px;
  text-align: center;
}

.action-header {
  width: 100px;
  text-align: center;
}

.table-actions {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background-color: #f0f8ff;
  border-bottom: 1px solid #e8e8e8;
  gap: 20px;
  border: 1px solid #b1dbff;
  border-bottom: none;
  border-radius: 0;
}

.add-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;
}

.add-icon {
  width: 20px;
  height: 20px;
  filter: invert(54%) sepia(37%) saturate(530%) hue-rotate(93deg) brightness(97%) contrast(85%);
}

.add-text {
  font-weight: 400;
}

.add-button:hover {
  opacity: 0.8;
}

.batch-delete-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;
}

.delete-icon {
  width: 18px;
  height: 18px;
  filter: invert(35%) sepia(77%) saturate(6133%) hue-rotate(342deg) brightness(91%) contrast(84%);
}

.delete-text {
  font-weight: 400;
}

.batch-delete-button:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .passenger-list-panel {
    margin: 10px;
  }
  
  .search-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100% !important;
  }
  
  .passenger-search-button {
    width: 100%;
  }
}
</style>
