<template>
  <div class="train-search-bar">
    <div class="search-bar-container">
      <!-- 单程/往返选择 -->
      <div class="trip-type-selector">
        <label class="radio-option">
          <input
            type="radio"
            name="tripType"
            value="single"
            v-model="tripType"
          />
          <span class="radio-label">单程</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="tripType"
            value="round"
            v-model="tripType"
          />
          <span class="radio-label">往返</span>
        </label>
      </div>

      <!-- 竖线分隔 -->
      <div class="vertical-divider-blue"></div>

      <!-- 出发城市 -->
      <div class="search-field-inline">
        <label class="search-field-label-inline">出发城市</label>
        <CityInput
          :modelValue="departureStation"
          placeholder="请选择城市"
          type="departure"
          @update:modelValue="setDepartureStation"
          @select="setDepartureStation"
        />
        <div v-if="errors.departureStation" class="field-error">{{ errors.departureStation }}</div>
      </div>
      
      <!-- 交换按钮 - 蓝色icon -->
      <button 
        class="swap-stations-btn" 
        @click="handleSwapStations"
        aria-label="交换出发城市和到达城市"
      >
        <img src="/images/转换2.svg" alt="交换" class="swap-icon" />
      </button>
      
      <!-- 到达城市 -->
      <div class="search-field-inline">
        <label class="search-field-label-inline">目的城市</label>
        <CityInput
          :modelValue="arrivalStation"
          placeholder="请选择城市"
          type="arrival"
          @update:modelValue="setArrivalStation"
          @select="setArrivalStation"
        />
        <div v-if="errors.arrivalStation" class="field-error">{{ errors.arrivalStation }}</div>
      </div>
      
      <!-- 出发日期 -->
      <div class="search-field-inline">
        <label class="search-field-label-inline">出发日</label>
        <DatePicker
          :modelValue="departureDate"
          @update:modelValue="handleDepartureDateChange"
          :minDate="todayString"
          :maxDate="maxDateString"
        />
      </div>
      
      <!-- 返程日期 - 灰色禁用 -->
      <div class="search-field-inline">
        <label class="search-field-label-inline return-label">返回日</label>
        <input 
          type="text" 
          :value="returnDate" 
          disabled 
          class="date-input disabled" 
        />
      </div>

      <!-- 查询按钮 -->
      <button 
        class="search-btn-inline" 
        @click="handleSearch"
        :disabled="isLoading"
      >
        {{ isLoading ? '查询中...' : '查询' }}
      </button>
      
      <!-- 普通/学生票选择 -->
      <div class="ticket-type-selector">
        <label class="radio-option">
          <input
            type="radio"
            name="ticketType"
            value="normal"
            v-model="ticketType"
          />
          <span class="radio-label">普通</span>
        </label>
        <label class="radio-option">
          <input
            type="radio"
            name="ticketType"
            value="student"
            v-model="ticketType"
          />
          <span class="radio-label">学生</span>
        </label>
      </div>
    </div>
    
    <div v-if="errors.general" class="error-banner">
      {{ errors.general }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import CityInput from './CityInput.vue'
import DatePicker from './DatePicker.vue'
import { searchTrains } from '../api/train'
import { getTodayString, getDateAfterDays } from '../utils/dateUtils'

const props = defineProps<{
  initialDepartureStation: string
  initialArrivalStation: string
  initialDepartureDate: string
}>()

const emit = defineEmits<{
  (e: 'search', params: any): void
  (e: 'dateUpdate', date: string): void
}>()

const tripType = ref<'single' | 'round'>('single')
const ticketType = ref<'normal' | 'student'>('normal')
const departureStation = ref(props.initialDepartureStation)
const arrivalStation = ref(props.initialArrivalStation)
const departureDate = ref(props.initialDepartureDate || getTodayString())
const returnDate = ref(getTodayString())
const errors = ref<{ [key: string]: string }>({})
const isLoading = ref(false)

const todayString = getTodayString()
const maxDateString = getDateAfterDays(14)

// Watch for prop changes
watch(() => props.initialDepartureStation, (newVal) => {
  if (newVal) departureStation.value = newVal
})

watch(() => props.initialArrivalStation, (newVal) => {
  if (newVal) arrivalStation.value = newVal
})

watch(() => props.initialDepartureDate, (newVal) => {
  if (newVal) departureDate.value = newVal
})

const setDepartureStation = (val: string) => {
  departureStation.value = val
}

const setArrivalStation = (val: string) => {
  arrivalStation.value = val
}

const handleDepartureDateChange = (newDate: string) => {
  departureDate.value = newDate
  emit('dateUpdate', newDate)
}

const handleSwapStations = () => {
  const temp = departureStation.value
  departureStation.value = arrivalStation.value
  arrivalStation.value = temp
}

const handleSearch = async () => {
  const newErrors: { [key: string]: string } = {}

  if (!departureStation.value || departureStation.value.trim() === '') {
    newErrors.departureStation = '请输入出发城市'
    errors.value = newErrors
    return
  }

  if (!arrivalStation.value || arrivalStation.value.trim() === '') {
    newErrors.arrivalStation = '请输入到达城市'
    errors.value = newErrors
    return
  }

  errors.value = {}
  isLoading.value = true

  try {
    // 调用车次搜索API
    // Note: The React code calls searchTrains but ignores the result except for success check.
    // Here we just verify we can search.
    await searchTrains({
      from: departureStation.value,
      to: arrivalStation.value,
      date: departureDate.value
    })
    
    // API调用成功，通过回调传递搜索参数
    emit('search', {
      departureStation: departureStation.value,
      arrivalStation: arrivalStation.value,
      departureDate: departureDate.value
    })
  } catch (error: any) {
    errors.value = { general: error.message || '查询失败，请稍后重试' }
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
/* 车次搜索和查询区域样式 */
.train-search-bar {
  background-color: #eff1f9;
  border: 1px solid #bbd7ee;
  border-radius: 4px;
  padding: 16px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-bar-container {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* 单程/往返选择器 */
.trip-type-selector,
.ticket-type-selector {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.radio-option input[type="radio"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin: 0;
  accent-color: #2196f3;
}

.radio-label {
  font-size: 14px;
  color: #000000;
  cursor: pointer;
  white-space: nowrap;
}

/* 竖线分隔 - 蓝色 */
.vertical-divider-blue {
  width: 1px;
  height: 40px;
  background-color: #5ba3e0;
  align-self: center;
  margin: 0px 8px 0px 8px;
}

/* 搜索输入框 - 横向布局 */
.search-field-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  position: relative;
}

.search-field-label-inline {
  font-size: 13px;
  color: #000000;
  font-weight: 400;
  white-space: nowrap;
}

.return-label {
  color: #999999;
}

.search-field-inline input,
.search-field-inline select {
  width: 120px;
  padding: 6px 10px;
  border: 1px solid #d0d5e8;
  border-radius: 3px;
  font-size: 13px;
  color: #333333;
  transition: border-color 0.2s;
}

/* 禁用状态输入框 */
.date-input.disabled {
  background-color: #e0e0e0;
  color: #999999;
  cursor: not-allowed;
  border-color: #d0d0d0;
}

/* 交换按钮 */
.swap-stations-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
  margin: 0 4px;
}

.swap-stations-btn:hover {
  transform: rotate(180deg);
}

.swap-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* 查询按钮 */
.search-btn-inline {
  padding: 0 30px;
  height: 34px;
  background-color: #ff9a00;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 10px;
  white-space: nowrap;
}

.search-btn-inline:hover {
  background-color: #e68a00;
}

.search-btn-inline:disabled {
  background-color: #ffd699;
  cursor: not-allowed;
}

/* 错误信息 */
.field-error {
  position: absolute;
  bottom: -20px;
  left: 0;
  font-size: 12px;
  color: #ff4d4f;
  white-space: nowrap;
}

.error-banner {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 13px;
}
</style>
