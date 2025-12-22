<script setup lang="ts">
import { ref } from 'vue'
import CityInput from './CityInput.vue'
import DatePicker from './DatePicker.vue'
import { validateCity } from '@/api/station'
import { getTodayString } from '@/utils/date'

const emit = defineEmits<{
  (e: 'search', params: any): void
}>()

const departureStation = ref('')
const arrivalStation = ref('')
const departureDate = ref(getTodayString())
const isStudent = ref(false)
const isHighSpeed = ref(false)
const errors = ref<{ [key: string]: string }>({})

// Handle swapping stations
const handleSwapStations = () => {
  const temp = departureStation.value
  departureStation.value = arrivalStation.value
  arrivalStation.value = temp
}

// Handle search
const handleSearch = async () => {
  const newErrors: { [key: string]: string } = {}

  if (!departureStation.value || departureStation.value.trim() === '') {
    newErrors.departure = '请选择出发城市'
    errors.value = { ...newErrors, general: '请选择出发城市' }
    return
  }

  if (!arrivalStation.value || arrivalStation.value.trim() === '') {
    newErrors.arrival = '请选择到达城市'
    errors.value = { ...newErrors, general: '请选择到达城市' }
    return
  }

  const departureResult = await validateCity(departureStation.value)
  if (!departureResult.valid) {
    if (departureResult.error === '验证城市失败，请稍后重试') {
      errors.value = { general: '查询失败，请稍后重试' }
      return
    }
    errors.value = {
      departure: departureResult.error || '无法匹配该出发城市',
      general: departureResult.error || '无法匹配该出发城市'
    }
    return
  }

  const arrivalResult = await validateCity(arrivalStation.value)
  if (!arrivalResult.valid) {
    if (arrivalResult.error === '验证城市失败，请稍后重试') {
      errors.value = { general: '查询失败，请稍后重试' }
      return
    }
    errors.value = {
      arrival: arrivalResult.error || '无法匹配该到达城市',
      general: arrivalResult.error || '无法匹配该到达城市'
    }
    return
  }

  errors.value = {}
  
  // Emit search event or navigate directly
  emit('search', {
    departureStation: departureStation.value,
    arrivalStation: arrivalStation.value,
    departureDate: departureDate.value,
    isHighSpeed: isHighSpeed.value,
    isStudent: isStudent.value
  })
}

// Update city values
const updateDepartureStation = (val: string) => {
  departureStation.value = val
}

const updateArrivalStation = (val: string) => {
  arrivalStation.value = val
}

const updateDepartureDate = (val: string) => {
  departureDate.value = val
}
</script>

<template>
  <div class="train-search-form">
    <!-- Sidebar -->
    <div class="form-sidebar">
      <button class="sidebar-tab active">
        <span class="sidebar-icon sidebar-icon-train" aria-hidden="true" />
        <span>车票</span>
      </button>
      <button class="sidebar-tab">
        <span class="sidebar-icon sidebar-icon-query" aria-hidden="true" />
        <span>查询</span>
      </button>
      <button class="sidebar-tab">
        <span class="sidebar-icon sidebar-icon-meal" aria-hidden="true" />
        <span>订餐</span>
      </button>
    </div>

    <!-- Form Container -->
    <div class="search-form-container">
      <!-- Tabs -->
      <div class="form-tabs">
        <button class="form-tab-button active">
          <span class="form-tab-icon form-tab-icon-single" aria-hidden="true" />
          <span>单程</span>
        </button>
        <button class="form-tab-button">
          <span class="form-tab-icon form-tab-icon-round" aria-hidden="true" />
          <span>往返</span>
        </button>
        <button class="form-tab-button">
          <span class="form-tab-icon form-tab-icon-transfer" aria-hidden="true" />
          <span>接续换乘</span>
        </button>
        <button class="form-tab-button">
          <span class="form-tab-icon form-tab-icon-ticket" aria-hidden="true" />
          <span>退改签</span>
        </button>
      </div>

      <!-- Stations Container -->
      <div class="stations-container">
        <!-- Departure Station -->
        <div class="train-search-row-horizontal">
          <label class="field-label-left">出发地</label>
          <div class="input-with-icon station-input-container">
            <CityInput
              :value="departureStation"
              placeholder="简拼/全拼/汉字"
              type="departure"
              @update:value="updateDepartureStation"
            />
            <svg class="location-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1C4.68629 1 2 3.68629 2 7C2 10.5 8 15 8 15C8 15 14 10.5 14 7C14 3.68629 11.3137 1 8 1ZM8 9C6.89543 9 6 8.10457 6 7C6 5.89543 6.89543 5 8 5C9.10457 5 10 5.89543 10 7C10 8.10457 9.10457 9 8 9Z" fill="#999"/>
            </svg>
          </div>
        </div>

        <!-- Connector -->
        <div class="connector-wrapper">
          <svg class="connector-line" width="40" height="80" viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M38 10H20V70H2" stroke="#d0d0d0" stroke-width="1"/>
          </svg>
          <button class="swap-button-center" @click="handleSwapStations" title="交换出发地和到达地">
            <span class="swap-icon" aria-hidden="true" />
          </button>
        </div>

        <!-- Arrival Station -->
        <div class="train-search-row-horizontal">
          <label class="field-label-left">到达地</label>
          <div class="input-with-icon station-input-container">
            <CityInput
              :value="arrivalStation"
              placeholder="简拼/全拼/汉字"
              type="arrival"
              @update:value="updateArrivalStation"
            />
            <svg class="location-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1C4.68629 1 2 3.68629 2 7C2 10.5 8 15 8 15C8 15 14 10.5 14 7C14 3.68629 11.3137 1 8 1ZM8 9C6.89543 9 6 8.10457 6 7C6 5.89543 6.89543 5 8 5C9.10457 5 10 5.89543 10 7C10 8.10457 9.10457 9 8 9Z" fill="#999"/>
            </svg>
          </div>
        </div>

        <!-- Date -->
        <div class="train-search-row-horizontal date-row">
          <label class="field-label-left">出发日期</label>
          <div class="input-with-icon station-input-container">
            <DatePicker
              :value="departureDate"
              @update:value="updateDepartureDate"
            />
          </div>
        </div>
      </div>

      <!-- Checkboxes -->
      <div class="train-search-row checkbox-row">
        <label class="checkbox-label">
          <input type="checkbox" v-model="isStudent" />
          <span>学生票</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="isHighSpeed" />
          <span>高铁/动车</span>
        </label>
      </div>

      <!-- Search Button -->
      <div class="train-search-row">
        <button class="search-button" @click="handleSearch">查询</button>
        <div v-if="errors.general" class="input-error" style="text-align: center; margin-top: 5px;">{{ errors.general }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* 车票查询表单样式 */
.train-search-form {
  width: 100%;
  max-width: 530px;
  display: flex;
  gap: 0;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border-radius: 0;
  overflow: visible;
  background: white;
}

/* 左侧三栏 - 横向显示 */
.form-sidebar {
  display: flex;
  flex-direction: column;
  background: #3B99FC;
  width: 100px;
  flex-shrink: 0;
}

.sidebar-tab {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 5px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-left: 3px solid transparent;
  border-radius: 0;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  padding: 20px 10px 20px 5px;
  font-size: 16px;
  line-height: 1.2;
  text-align: left;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: #ffffff;
    color: #3B99FC;
    border-left: 3px solid #3B99FC;
    border-radius: 0;
  }

  svg,
  .sidebar-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
}

.sidebar-icon {
  display: inline-block;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}

.sidebar-icon-train {
  background-color: currentColor;
  mask: url('/images/train.svg') no-repeat center / contain;
  -webkit-mask: url('/images/train.svg') no-repeat center / contain;
}

.sidebar-icon-query {
  background-color: currentColor;
  mask: url('/images/查询.svg') no-repeat center / contain;
  -webkit-mask: url('/images/查询.svg') no-repeat center / contain;
}

.sidebar-icon-meal {
  background-color: currentColor;
  mask: url('/images/订餐.svg') no-repeat center / contain;
  -webkit-mask: url('/images/订餐.svg') no-repeat center / contain;
}

.sidebar-tab span {
  writing-mode: horizontal-tb;
  white-space: nowrap;
  font-weight: bold;
}

.search-form-container {
  flex: 1;
  background: #ffffff;
  padding: 0 24px 14px 24px;
  display: flex;
  flex-direction: column;
}

/* 车票内四个选项卡 */
.form-tabs {
  display: flex;
  background: #ffffff;
  border-bottom: 2px solid #e0e0e0;
  padding: 20px 0 0 0;
  gap: 0;
}

.form-tab-button {
  flex: 1;
  padding: 10px 5px 8px 5px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  color: #999999;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: -2px;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &:hover {
    color: #999999;
    background: transparent;
    border-bottom: 2px solid transparent;
    cursor: pointer;
  }

  &.active {
    color: #3B99FC;
    background: transparent;
    font-weight: normal;
    border-bottom: 2px solid #3B99FC;
    border-radius: 0;
  }
}

.form-tab-button .form-tab-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  background-color: currentColor;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  flex-shrink: 0;
}

.form-tab-icon-single {
  mask-image: url('/images/单程.svg');
  -webkit-mask-image: url('/images/单程.svg');
}

.form-tab-icon-round {
  mask-image: url('/images/往返.svg');
  -webkit-mask-image: url('/images/往返.svg');
}

.form-tab-icon-transfer {
  mask-image: url('/images/换乘.svg');
  -webkit-mask-image: url('/images/换乘.svg');
}

.form-tab-icon-ticket {
  mask-image: url('/images/ticket.svg');
  -webkit-mask-image: url('/images/ticket.svg');
}

/* 站点选择容器 */
.stations-container {
  padding: 20px 30px 0 30px;
  position: relative;
  padding-right: 70px;
}

/* 水平布局的表单行 */
.train-search-row-horizontal {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

/* 左侧标签 */
.field-label-left {
  font-size: 14px;
  color: #333333;
  font-weight: normal;
  min-width: 56px;
  text-align: right;
  flex-shrink: 0;
}

/* 连接器包装器 */
.connector-wrapper {
  position: absolute;
  right: 25px;
  top: 18px;
  width: 40px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

/* 灰色连接折线 */
.connector-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 80px;
}

/* 中间的转换按钮 */
.swap-button-center {
  width: 20px;
  height: 20px;
  padding: 0;
  background-color: #ff7700;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
  transform: translateX(4px) translateY(-3px);

  &:active {
    transform: scale(0.96);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  .swap-icon {
    width: 18px;
    height: 18px;
    display: inline-block;
    background-color: #ffffff;
    mask: url('/images/转换.svg') no-repeat center / contain;
    -webkit-mask: url('/images/转换.svg') no-repeat center / contain;
  }
}

/* 表单行 */
.train-search-row {
  margin-bottom: 0;
  padding: 15px 15px 15px 15px;
  position: relative;
}

/* 出发日期行 */
.train-search-row-horizontal.date-row {
  padding: 0 30px;
  margin-bottom: 5px;
}

/* 带图标的输入框容器 */
.input-with-icon {
  position: relative;
  width: 100%;
}

/* 图标样式 */
.location-icon,
.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 1;
}

/* 站点输入框样式 */
.train-search-row .station-input-container {
  width: 100%;
}

/* 日期选择器行 */
.date-row {
  margin-bottom: 15px;
}

/* 复选框行 */
.checkbox-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 5px 5px !important;
}

/* 复选框样式 */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333333;
  flex-direction: row;

  span {
    user-select: none;
    order: 1;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    border-radius: 0;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border: 1px solid #d0d0d0;
    position: relative;
    order: 2;
    flex-shrink: 0;
    background-color: white;

    &:checked {
      background-color: #3B99FC;
      border-color: #3B99FC;

      &::after {
        content: '✓';
        position: absolute;
        color: white;
        font-size: 12px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: bold;
      }
    }
  }
}

/* 查询按钮样式 */
.search-button {
  width: 100%;
  padding: 5px;
  background: #FF8001 !important;
  color: white !important;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background 0.3s ease, box-shadow 0.3s ease;
  box-shadow: none;
  letter-spacing: 8px;
  text-indent: 8px;
  transform: none;

  &:hover {
    background: #fd6900 !important;
    box-shadow: none !important;
    transform: none !important;
    border: none !important;
  }

  &:active {
    transform: none !important;
    box-shadow: none !important;
  }
}

.input-error {
  color: #d32f2f;
  font-size: 12px;
}
</style>
