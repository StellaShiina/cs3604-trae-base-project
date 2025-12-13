<template>
  <div class="train-search-bar">
    <div class="search-form">
      <!-- 出发地 -->
      <div class="form-item">
        <label>出发地</label>
        <el-input v-model="form.departureStation" placeholder="简拼/全拼/汉字" clearable>
          <template #prefix>
            <el-icon><Location /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 切换按钮 -->
      <div class="exchange-icon" @click="exchangeStations">
        <el-icon><Switch /></el-icon>
      </div>

      <!-- 到达地 -->
      <div class="form-item">
        <label>到达地</label>
        <el-input v-model="form.arrivalStation" placeholder="简拼/全拼/汉字" clearable>
          <template #prefix>
            <el-icon><Location /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 出发日期 -->
      <div class="form-item">
        <label>出发日期</label>
        <el-date-picker
          v-model="form.departureDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
        />
      </div>

      <!-- 查询按钮 -->
      <div class="search-btn">
        <el-button type="warning" size="large" @click="handleSearch" :loading="loading">查询</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Location, Switch } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  initialDepartureStation?: string
  initialArrivalStation?: string
  initialDepartureDate?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'search', params: any): void
}>()

const form = reactive({
  departureStation: props.initialDepartureStation || '',
  arrivalStation: props.initialArrivalStation || '',
  departureDate: props.initialDepartureDate || new Date().toISOString().split('T')[0]
})

// 监听 props 变化
watch(() => props.initialDepartureStation, (val) => {
  if (val) form.departureStation = val
})
watch(() => props.initialArrivalStation, (val) => {
  if (val) form.arrivalStation = val
})
watch(() => props.initialDepartureDate, (val) => {
  if (val) form.departureDate = val
})

const exchangeStations = () => {
  const temp = form.departureStation
  form.departureStation = form.arrivalStation
  form.arrivalStation = temp
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // 禁止选择今天之前的日期
}

const handleSearch = () => {
  if (!form.departureStation) {
    ElMessage.warning('请输入出发地')
    return
  }
  if (!form.arrivalStation) {
    ElMessage.warning('请输入到达地')
    return
  }
  if (!form.departureDate) {
    ElMessage.warning('请选择出发日期')
    return
  }

  emit('search', { ...form })
}
</script>

<style scoped>
.train-search-bar {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: flex-end;
  gap: 15px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.form-item label {
  font-size: 14px;
  color: #666;
}

.exchange-icon {
  margin-bottom: 10px;
  cursor: pointer;
  color: #999;
  font-size: 20px;
}

.exchange-icon:hover {
  color: #0078d7;
}

.search-btn {
  width: 120px;
}

.search-btn button {
  width: 100%;
}
</style>
