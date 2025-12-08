<template>
  <div class="train-search-form">
    <!-- 左侧三栏 - 横向显示文字 -->
    <div class="form-sidebar">
      <button class="sidebar-tab active">
        <span class="sidebar-icon sidebar-icon-train" aria-hidden="true" />
        <span>车票</span>
      </button>
      <button class="sidebar-tab">
        <span class="sidebar-icon sidebar-icon-query" aria-hidden="true" />
        <span>常用查询</span>
      </button>
      <button class="sidebar-tab">
        <span class="sidebar-icon sidebar-icon-meal" aria-hidden="true" />
        <span>订餐</span>
      </button>
    </div>
    
    <div class="search-form-container">
      <!-- 车票内四个选项卡 -->
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
          <span>中转换乘</span>
        </button>
        <button class="form-tab-button">
          <span class="form-tab-icon form-tab-icon-ticket" aria-hidden="true" />
          <span>退改签</span>
        </button>
      </div>
      
      <!-- 城市选择区域 -->
      <div class="stations-container">
        <!-- 出发城市 -->
        <div class="train-search-row-horizontal">
          <label class="field-label-left">出发城市</label>
          <div class="input-with-icon">
            <CityInput
              v-model="departureStation"
              placeholder="请选择城市"
              type="departure"
              @select="(val) => departureStation = val"
            />
            <svg class="location-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#cccccc"/>
            </svg>
          </div>
        </div>

        <!-- 灰色折线和转换按钮 -->
        <div class="connector-wrapper">
          <svg class="connector-line" width="40" height="90" viewBox="0 0 40 90">
            <path d="M0 10 H25 V80 H0" stroke="#e5e5e5" strokeWidth="2" fill="none"/>
          </svg>
          <button class="swap-button-center" @click="handleSwapStations" aria-label="交换出发城市和到达城市">
            <span class="swap-icon" aria-hidden="true" />
          </button>
        </div>

        <!-- 到达城市 -->
        <div class="train-search-row-horizontal">
          <label class="field-label-left">到达城市</label>
          <div class="input-with-icon">
            <CityInput
              v-model="arrivalStation"
              placeholder="请选择城市"
              type="arrival"
              @select="(val) => arrivalStation = val"
            />
            <svg class="location-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#cccccc"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- 出发日期 -->
      <div class="train-search-row-horizontal date-row">
        <label class="field-label-left">出发日期</label>
        <div class="input-with-icon">
          <DatePicker
            v-model="departureDate"
            :min-date="getTodayString()"
            :max-date="getDateAfterDays(14)"
          />
          <svg class="calendar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" fill="#cccccc"/>
          </svg>
        </div>
      </div>

      <!-- 两个勾选框居中 -->
      <div class="train-search-row checkbox-row">
        <label class="checkbox-label">
          <span>学生</span>
          <input
            type="checkbox"
            v-model="isStudent"
          />
        </label>
        <label class="checkbox-label">
          <span>高铁/动车</span>
          <input
            type="checkbox"
            v-model="isHighSpeed"
          />
        </label>
      </div>

      <!-- 错误消息 -->
      <div v-if="errors.general" class="train-search-error-message">{{ errors.general }}</div>

      <!-- 查询按钮 -->
      <div class="train-search-row">
        <button class="search-button" @click="handleSearch">
          查    询
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CityInput from './CityInput.vue';
import DatePicker from './DatePicker.vue';
import { validateCity } from '../api/station';
import { getTodayString, getDateAfterDays } from '../utils/dateUtils';

const router = useRouter();

const departureStation = ref('');
const arrivalStation = ref('');
const departureDate = ref(getTodayString());
const isStudent = ref(false);
const isHighSpeed = ref(false);
const errors = ref<{ [key: string]: string }>({});

const handleSwapStations = () => {
  const temp = departureStation.value;
  departureStation.value = arrivalStation.value;
  arrivalStation.value = temp;
};

const handleSearch = async () => {
  const newErrors: { [key: string]: string } = {};

  if (!departureStation.value || departureStation.value.trim() === '') {
    newErrors.departure = '请选择出发城市';
    errors.value = { ...newErrors, general: '请选择出发城市' };
    return;
  }

  if (!arrivalStation.value || arrivalStation.value.trim() === '') {
    newErrors.arrival = '请选择到达城市';
    errors.value = { ...newErrors, general: '请选择到达城市' };
    return;
  }

  // Validate Departure
  const departureResult = await validateCity(departureStation.value);
  if (!departureResult.valid) {
    if (departureResult.error === '验证城市失败，请稍后重试') {
      errors.value = { general: '查询失败，请稍后重试' };
      return;
    }
    errors.value = {
      departure: departureResult.error || '无法匹配该出发城市',
      general: departureResult.error || '无法匹配该出发城市'
    };
    return;
  }

  // Validate Arrival
  const arrivalResult = await validateCity(arrivalStation.value);
  if (!arrivalResult.valid) {
    if (arrivalResult.error === '验证城市失败，请稍后重试') {
      errors.value = { general: '查询失败，请稍后重试' };
      return;
    }
    errors.value = {
      arrival: arrivalResult.error || '无法匹配该到达城市',
      general: arrivalResult.error || '无法匹配该到达城市'
    };
    return;
  }

  errors.value = {};
  
  // Navigate to TrainList
  router.push({
    path: '/trains',
    query: {
      from: departureStation.value,
      to: arrivalStation.value,
      date: departureDate.value,
      highSpeed: isHighSpeed.value ? 'true' : 'false'
    }
  });
};
</script>

<style>
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
}

.sidebar-tab:last-child {
  border-bottom: none;
}

.sidebar-tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-tab.active {
  background: #ffffff;
  color: #3B99FC;
  border-left: 3px solid #3B99FC;
  border-radius: 0;
}

.sidebar-tab svg,
.sidebar-tab .sidebar-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
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

/* 车票内四个选项卡 - 方框样式，只有下边框 */
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
}

.form-tab-button svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.form-tab-button:hover {
  color: #999999;
  background: transparent;
  border-bottom: 2px solid transparent;
  cursor: pointer;
}

.form-tab-button.active {
  color: #3B99FC;
  background: transparent;
  font-weight: normal;
  border-bottom: 2px solid #3B99FC;
  border-radius: 0;
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

/* 站点选择容器 - 包含出发地、到达地和连接线 */
.stations-container {
  padding: 20px 30px 0 30px;
  position: relative;
  padding-right: 70px;
}

/* 水平布局的表单行 - 标签在左，输入框在右 */
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

/* 连接器包装器 - 包含折线和转换按钮 */
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

/* 灰色连接折线 - Z字形：右-下-左 */
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
}

.swap-button-center:active {
  transform: scale(0.96);
}

.swap-button-center svg {
  width: 16px;
  height: 16px;
}

.swap-button-center .swap-icon {
  width: 18px;
  height: 18px;
  display: inline-block;
  background-color: #ffffff;
  mask: url('/images/转换.svg') no-repeat center / contain;
  -webkit-mask: url('/images/转换.svg') no-repeat center / contain;
}

/* 表单行 */
.train-search-row {
  margin-bottom: 0;
  padding: 15px 15px 15px 15px;
  position: relative;
}

/* 出发日期行 - 与站点输入框对齐 */
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

/* 复选框行 - 两个复选框居中 */
.checkbox-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 5px 5px !important;
}

/* 复选框样式 - 文字在左，勾选框在右 */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333333;
  flex-direction: row;
}

.checkbox-label span {
  user-select: none;
  order: 1;
}

.checkbox-label input[type="checkbox"] {
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
}

.checkbox-label input[type="checkbox"]:checked {
  background-color: #3B99FC;
  border-color: #3B99FC;
}

.checkbox-label input[type="checkbox"]:checked::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
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
}

.search-button:hover {
  background: #fd6900 !important;
  box-shadow: none !important;
  transform: none !important;
  border: none !important;
}

.search-button:active {
  transform: none !important;
  box-shadow: none !important;
}

.search-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* 错误消息样式 */
.train-search-error-message {
  color: #d32f2f;
  font-size: 13px;
  margin: 5px 15px;
  padding: 10px 0px;
  background-color: #ffebee;
  border-radius: 0;
  animation: slideIn 0.3s ease;
  text-align: center;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .train-search-form {
    max-width: 100%;
  }

  .form-sidebar {
    width: 65px;
  }

  .sidebar-tab {
    padding: 16px 8px;
    font-size: 12px;
  }

  .sidebar-tab svg {
    width: 16px;
    height: 16px;
  }

  .form-tab-button {
    padding: 12px 8px;
    font-size: 12px;
  }

  .train-search-row {
    padding: 0 18px;
  }

  .train-search-row:last-child {
    padding-bottom: 20px;
  }

  .train-search-row-horizontal {
    gap: 8px;
  }

  .field-label-left {
    min-width: 60px;
    font-size: 13px;
  }

  .stations-container {
    padding: 15px 18px 0 18px;
    padding-right: 60px;
  }

  .connector-wrapper {
    right: 15px;
    width: 35px;
    height: 85px;
  }

  .connector-line {
    width: 35px;
    height: 85px;
  }

  .swap-button-center {
    width: 32px;
    height: 32px;
  }

  .swap-button-center svg {
    width: 14px;
    height: 14px;
  }

  .date-row {
    padding: 0 18px;
  }

  .search-button {
    padding: 12px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .form-sidebar {
    width: 60px;
  }

  .sidebar-tab {
    padding: 14px 6px;
    font-size: 11px;
    gap: 4px;
  }

  .sidebar-tab svg {
    width: 14px;
    height: 14px;
  }

  .form-tab-button {
    font-size: 11px;
    padding: 10px 8px;
    gap: 4px;
  }

  .form-tab-button svg {
    width: 14px;
    height: 14px;
  }

  .train-search-row {
    padding: 0 15px;
  }

  .train-search-row:last-child {
    padding-bottom: 18px;
  }

  .train-search-row-horizontal {
    gap: 6px;
  }

  .field-label-left {
    min-width: 50px;
    font-size: 12px;
  }

  .stations-container {
    padding: 12px 15px 0 15px;
    padding-right: 55px;
  }

  .connector-wrapper {
    right: 12px;
    width: 30px;
    height: 80px;
  }

  .connector-line {
    width: 30px;
    height: 80px;
  }

  .swap-button-center {
    width: 30px;
    height: 30px;
  }

  .swap-button-center svg {
    width: 13px;
    height: 13px;
  }

  .date-row {
    padding: 0 15px;
  }
}
</style>
