<template>
  <div class="train-filter-panel">
    <!-- 日期筛选标签行 -->
    <div class="date-filter-tabs">
      <button
        v-for="tab in dateTabs"
        :key="tab.date"
        class="date-tab"
        :class="{ active: selectedDate === tab.date }"
        @click="handleDateSelect(tab.date)"
      >
        <div class="date-tab-date">{{ tab.display }}</div>
      </button>
    </div>

    <!-- 筛选条件面板 -->
    <div class="filter-panel-container">
      <!-- 车次类型行 -->
      <div class="filter-row">
        <div class="filter-label">车次类型：</div>
        <button 
          :class="getSelectAllButtonClass(selectedTrainTypes.length, totalTrainTypesCount)" 
          @click="handleTrainTypesSelectAll"
        >
          全部
        </button>
        <div class="filter-options">
          <label v-for="option in trainTypeOptions" :key="option.key" class="filter-checkbox">
            <input
              type="checkbox"
              :checked="isTrainTypeSelected(option.types)"
              @change="handleTrainTypeToggle(option.types)"
            />
            <span class="checkbox-label">{{ option.label }}</span>
          </label>
        </div>
        <div class="filter-time-select">
          <span class="time-label">发车时间：</span>
          <select
            v-model="departureTimeRange"
            class="time-dropdown"
            @change="triggerFilterChange"
          >
            <option value="00:00--24:00">00:00--24:00</option>
            <option value="00:00--06:00">00:00--06:00</option>
            <option value="06:00--12:00">06:00--12:00</option>
            <option value="12:00--18:00">12:00--18:00</option>
            <option value="18:00--24:00">18:00--24:00</option>
          </select>
        </div>
      </div>

      <!-- 出发车站行 -->
      <div v-if="departureStations.length > 0" class="filter-row">
        <div class="filter-label">出发车站：</div>
        <button 
          :class="getSelectAllButtonClass(selectedDepartureStations.length, departureStations.length)" 
          @click="handleDepartureStationsSelectAll"
        >
          全部
        </button>
        <div class="filter-options">
          <label v-for="station in departureStations" :key="station" class="filter-checkbox">
            <input
              type="checkbox"
              :checked="selectedDepartureStations.includes(station)"
              @change="handleDepartureStationToggle(station)"
            />
            <span class="checkbox-label">{{ station }}</span>
          </label>
        </div>
      </div>

      <!-- 到达车站行 -->
      <div v-if="arrivalStations.length > 0" class="filter-row">
        <div class="filter-label">到达车站：</div>
        <button 
          :class="getSelectAllButtonClass(selectedArrivalStations.length, arrivalStations.length)" 
          @click="handleArrivalStationsSelectAll"
        >
          全部
        </button>
        <div class="filter-options">
          <label v-for="station in arrivalStations" :key="station" class="filter-checkbox">
            <input
              type="checkbox"
              :checked="selectedArrivalStations.includes(station)"
              @change="handleArrivalStationToggle(station)"
            />
            <span class="checkbox-label">{{ station }}</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { getTodayString } from '../utils/dateUtils'

interface Props {
  departureStations: string[]
  arrivalStations: string[]
  seatTypes: string[]
  departureDate?: string
  isHighSpeed?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'filterChange', filters: any): void
  (e: 'dateChange', date: string): void
}>()

const selectedDate = ref('')
const selectedTrainTypes = ref<string[]>([])
const selectedDepartureStations = ref<string[]>([])
const selectedArrivalStations = ref<string[]>([])
const selectedSeatTypes = ref<string[]>([])
const departureTimeRange = ref('00:00--24:00')
const isInitialized = ref(false)

// 生成日期标签
const dateTabs = computed(() => {
  const tabs = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    
    // YYYY-MM-DD
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    // M-D
    const display = `${date.getMonth() + 1}-${date.getDate()}`
    
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[date.getDay()]
    
    tabs.push({
      date: dateStr,
      display: `${display} ${weekDay}`
    })
  }
  return tabs
})

// 车次类型选项
const trainTypeOptions = [
  { key: 'GC', label: 'GC-高铁/城际', types: ['G', 'C'] },
  { key: 'D', label: 'D-动车', types: ['D'] },
  { key: 'Z', label: 'Z-直达', types: ['Z'] },
  { key: 'T', label: 'T-特快', types: ['T'] },
  { key: 'K', label: 'K-快速', types: ['K'] },
  { key: 'OTHER', label: '其他', types: ['OTHER'] },
  { key: 'FUXING', label: '复兴号', types: ['FUXING'] },
  { key: 'SMART', label: '智能动车组', types: ['SMART'] },
]

const totalTrainTypesCount = computed(() => {
  return trainTypeOptions.flatMap(opt => opt.types).length
})

// Watch props
watch(() => props.departureDate, (newVal) => {
  if (newVal) {
    selectedDate.value = newVal
  }
})

watch(() => props.isHighSpeed, (newVal) => {
  if (!isInitialized.value && newVal) {
    const initialTypes = ['G', 'C', 'D']
    selectedTrainTypes.value = initialTypes
    isInitialized.value = true
    triggerFilterChange()
  }
})

onMounted(() => {
  if (props.departureDate) {
    selectedDate.value = props.departureDate
  }
  if (props.isHighSpeed && !isInitialized.value) {
    selectedTrainTypes.value = ['G', 'C', 'D']
    isInitialized.value = true
    triggerFilterChange()
  }
})

const handleDateSelect = (date: string) => {
  selectedDate.value = date
  emit('dateChange', date)
}

const isTrainTypeSelected = (types: string[]) => {
  return types.every(t => selectedTrainTypes.value.includes(t))
}

const handleTrainTypeToggle = (types: string[]) => {
  const current = selectedTrainTypes.value
  const allSelected = types.every(t => current.includes(t))
  
  let newTypes: string[]
  if (allSelected) {
    newTypes = current.filter(t => !types.includes(t))
  } else {
    newTypes = [...current]
    types.forEach(t => {
      if (!newTypes.includes(t)) {
        newTypes.push(t)
      }
    })
  }
  selectedTrainTypes.value = newTypes
  triggerFilterChange()
}

const handleTrainTypesSelectAll = () => {
  const allTypes = trainTypeOptions.flatMap(opt => opt.types)
  if (selectedTrainTypes.value.length === allTypes.length) {
    selectedTrainTypes.value = []
  } else {
    selectedTrainTypes.value = allTypes
  }
  triggerFilterChange()
}

const handleDepartureStationToggle = (station: string) => {
  const current = selectedDepartureStations.value
  if (current.includes(station)) {
    selectedDepartureStations.value = current.filter(s => s !== station)
  } else {
    selectedDepartureStations.value = [...current, station]
  }
  triggerFilterChange()
}

const handleDepartureStationsSelectAll = () => {
  if (selectedDepartureStations.value.length === props.departureStations.length) {
    selectedDepartureStations.value = []
  } else {
    selectedDepartureStations.value = [...props.departureStations]
  }
  triggerFilterChange()
}

const handleArrivalStationToggle = (station: string) => {
  const current = selectedArrivalStations.value
  if (current.includes(station)) {
    selectedArrivalStations.value = current.filter(s => s !== station)
  } else {
    selectedArrivalStations.value = [...current, station]
  }
  triggerFilterChange()
}

const handleArrivalStationsSelectAll = () => {
  if (selectedArrivalStations.value.length === props.arrivalStations.length) {
    selectedArrivalStations.value = []
  } else {
    selectedArrivalStations.value = [...props.arrivalStations]
  }
  triggerFilterChange()
}

const triggerFilterChange = () => {
  emit('filterChange', {
    trainTypes: selectedTrainTypes.value,
    departureStations: selectedDepartureStations.value,
    arrivalStations: selectedArrivalStations.value,
    seatTypes: selectedSeatTypes.value, // Not implemented in UI yet but kept for structure
    departureTimeRange: departureTimeRange.value
  })
}

const getSelectAllButtonClass = (selectedCount: number, totalCount: number) => {
  if (selectedCount === 0 || selectedCount === totalCount) {
    return 'filter-all-btn'
  }
  return 'filter-all-btn partial'
}
</script>

<style>
/* 车次信息筛选区域样式 */
.train-filter-panel {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  overflow: visible;
  position: relative;
}

/* 日期筛选标签行 */
.date-filter-tabs {
  display: flex;
  overflow: hidden;
  border-bottom: none;
  background-color: transparent;
  padding: 0;
  gap: 0;
}

.date-tab {
  flex: 1;
  padding: 8px 16px;
  background: linear-gradient(to bottom, #f9f9f9 0%, #e7e7e7 100%);
  border: 1px solid transparent;
  border-radius: 0;
  border-right: 1px solid #d0d0d0;
  border-bottom: 1px solid #569ecf;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #333333;
  white-space: nowrap;
  font-weight: 500;
  position: relative;
  outline: none;
}

.date-tab:last-child {
  border-right: 1px solid transparent;
}

.date-tab:hover {
  background: linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%);
}

.date-tab.active {
  background-color: #ffffff !important;
  background-image: none !important;
  color: #499bd5;
  font-weight: 1000;
  border-top: 1px solid #569ecf !important;
  border-left: 1px solid #569ecf !important;
  border-right: 1px solid #569ecf !important;
  border-bottom: none !important;
  z-index: 1;
}

.date-tab-date {
  font-size: 13px;
}

/* 筛选条件面板 */
.filter-panel-container {
  padding: 16px 20px;
  border: 1px solid #569ecf;
  border-top: none;
  margin: -1px;
  background-color: #ffffff;
}

/* 筛选行 */
.filter-row {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 10px;
  align-items: start;
  margin-bottom: 14px;
  padding-bottom: 0;
  border-bottom: none;
}

.filter-row:last-child {
  margin-bottom: 0;
}

/* 筛选标签 */
.filter-label {
  font-size: 14px;
  font-weight: 800;
  color: #000000;
  white-space: nowrap;
  line-height: 28px;
}

/* 全部按钮 */
.filter-all-btn {
  padding: 0px 8px;
  background-color: #8ea7d4;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  height: 25px;
  border: 1px solid #8ea7d4;
  text-align: center;
  line-height: 23px;
}

.filter-all-btn:hover {
  background-color: #7a95c5;
}

.filter-all-btn:active {
  transform: scale(0.95);
}

/* 全部按钮 - 部分选择状态 */
.filter-all-btn.partial {
  background-color: white;
  color: #999999;
  border: 1px solid #8ea7d4;
}

/* 筛选选项容器 */
.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  align-items: center;
}

/* 筛选复选框 */
.filter-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  min-width: 110px;
}

.filter-checkbox input[type="checkbox"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
  margin: 0;
  accent-color: #8fc0e5;
}

.checkbox-label {
  font-size: 12px;
  color: #333333;
}

/* 发车时间下拉框 */
.filter-time-select {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
}

.time-label {
  font-size: 12px;
  color: #666666;
}

.time-dropdown {
  padding: 2px 6px;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
  font-size: 12px;
  color: #333333;
  outline: none;
}
</style>
