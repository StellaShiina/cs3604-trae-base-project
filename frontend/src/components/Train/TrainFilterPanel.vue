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
    <div class="filter-panel-container" :class="{ collapsed: isCollapsed }">
      <!-- 车次类型行 -->
      <div class="filter-row">
        <div class="filter-label">车次类型：</div>
        <div class="filter-content">
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
              @change="handleTimeRangeChange"
              class="time-dropdown"
            >
              <option value="00:00--24:00">00:00--24:00</option>
              <option value="00:00--06:00">00:00--06:00</option>
              <option value="06:00--12:00">06:00--12:00</option>
              <option value="12:00--18:00">12:00--18:00</option>
              <option value="18:00--24:00">18:00--24:00</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 出发车站行 -->
      <div v-if="departureStations.length > 0" class="filter-row">
        <div class="filter-label">出发车站：</div>
        <div class="filter-content">
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
      </div>

      <!-- 到达车站行 -->
      <div v-if="arrivalStations.length > 0" class="filter-row">
        <div class="filter-label">到达车站：</div>
        <div class="filter-content">
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

      <!-- 车次席别行 -->
      <div class="filter-row">
        <div class="filter-label">车次席别：</div>
        <div class="filter-content">
          <button 
            :class="getSelectAllButtonClass(selectedSeatTypes.length, seatTypeOptions.length)" 
            @click="handleSeatTypesSelectAll"
          >
            全部
          </button>
          <div class="filter-options">
            <label v-for="type in seatTypeOptions" :key="type" class="filter-checkbox">
              <input
                type="checkbox"
                :checked="selectedSeatTypes.includes(type)"
                @change="handleSeatTypeToggle(type)"
              />
              <span class="checkbox-label">{{ type }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 筛选按钮 -->
      <div class="filter-action">
        <button class="filter-toggle-btn" @click="toggleCollapse">
          筛选 <span class="arrow-icon" :class="{ up: !isCollapsed, down: isCollapsed }">▲</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getLocalDateString } from '@/utils/date';

const props = defineProps<{
  departureStations: string[];
  arrivalStations: string[];
  seatTypes: string[];
  departureDate?: string;
  isHighSpeed?: boolean;
}>();

const emit = defineEmits<{
  (e: 'filter-change', filters: any): void;
  (e: 'date-change', date: string): void;
}>();

// State
const selectedDate = ref('');
const selectedTrainTypes = ref<string[]>([]);
const selectedDepartureStations = ref<string[]>([]);
const selectedArrivalStations = ref<string[]>([]);
const selectedSeatTypes = ref<string[]>([]);
const departureTimeRange = ref('00:00--24:00');
const isInitialized = ref(false);
const isCollapsed = ref(false);

// Constants
const trainTypeOptions = [
  { key: 'GC', label: 'GC-高铁/城际', types: ['G', 'C'] },
  { key: 'D', label: 'D-动车', types: ['D'] },
  { key: 'Z', label: 'Z-直达', types: ['Z'] },
  { key: 'T', label: 'T-特快', types: ['T'] },
  { key: 'K', label: 'K-快速', types: ['K'] },
  { key: 'OTHER', label: '其他', types: ['OTHER'] },
  { key: 'FUXING', label: '复兴号', types: ['FUXING'] },
  { key: 'SMART', label: '智能动车组', types: ['SMART'] },
];

const seatTypeOptions = [
  '商务座', '一等座', '二等座', '软卧', '软座', '二等卧', '一等卧', '硬卧', '硬座'
];

const totalTrainTypesCount = computed(() => trainTypeOptions.flatMap(opt => opt.types).length);

// Methods
const generateDateTabs = () => {
  const tabs = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = getLocalDateString(date);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    
    tabs.push({
      date: dateStr,
      display: `${month}-${day}`,
      weekDay: weekDay,
    });
  }
  return tabs;
};

const dateTabs = generateDateTabs();

const triggerFilterChange = (updates: any) => {
  emit('filter-change', {
    trainTypes: updates.trainTypes !== undefined ? updates.trainTypes : selectedTrainTypes.value,
    departureStations: updates.departureStations !== undefined ? updates.departureStations : selectedDepartureStations.value,
    arrivalStations: updates.arrivalStations !== undefined ? updates.arrivalStations : selectedArrivalStations.value,
    seatTypes: updates.seatTypes !== undefined ? updates.seatTypes : selectedSeatTypes.value,
    departureTimeRange: updates.departureTimeRange !== undefined ? updates.departureTimeRange : departureTimeRange.value,
  });
};

const handleDateSelect = (date: string) => {
  selectedDate.value = date;
  emit('date-change', date);
};

// Train Types Logic
const isTrainTypeSelected = (types: string[]) => {
  return types.every(t => selectedTrainTypes.value.includes(t));
};

const handleTrainTypeToggle = (types: string[]) => {
  let newTypes = [...selectedTrainTypes.value];
  const allSelected = types.every(t => newTypes.includes(t));
  
  if (allSelected) {
    newTypes = newTypes.filter(t => !types.includes(t));
  } else {
    types.forEach(t => {
      if (!newTypes.includes(t)) {
        newTypes.push(t);
      }
    });
  }
  
  selectedTrainTypes.value = newTypes;
  triggerFilterChange({ trainTypes: newTypes });
};

const handleTrainTypesSelectAll = () => {
  const allTypes = trainTypeOptions.flatMap(opt => opt.types);
  if (selectedTrainTypes.value.length === allTypes.length) {
    selectedTrainTypes.value = [];
    triggerFilterChange({ trainTypes: [] });
  } else {
    selectedTrainTypes.value = allTypes;
    triggerFilterChange({ trainTypes: allTypes });
  }
};

// Departure Stations Logic
const handleDepartureStationToggle = (station: string) => {
  let newStations = [...selectedDepartureStations.value];
  if (newStations.includes(station)) {
    newStations = newStations.filter(s => s !== station);
  } else {
    newStations.push(station);
  }
  selectedDepartureStations.value = newStations;
  triggerFilterChange({ departureStations: newStations });
};

const handleDepartureStationsSelectAll = () => {
  if (selectedDepartureStations.value.length === props.departureStations.length) {
    selectedDepartureStations.value = [];
    triggerFilterChange({ departureStations: [] });
  } else {
    selectedDepartureStations.value = [...props.departureStations];
    triggerFilterChange({ departureStations: [...props.departureStations] });
  }
};

// Arrival Stations Logic
const handleArrivalStationToggle = (station: string) => {
  let newStations = [...selectedArrivalStations.value];
  if (newStations.includes(station)) {
    newStations = newStations.filter(s => s !== station);
  } else {
    newStations.push(station);
  }
  selectedArrivalStations.value = newStations;
  triggerFilterChange({ arrivalStations: newStations });
};

const handleArrivalStationsSelectAll = () => {
  if (selectedArrivalStations.value.length === props.arrivalStations.length) {
    selectedArrivalStations.value = [];
    triggerFilterChange({ arrivalStations: [] });
  } else {
    selectedArrivalStations.value = [...props.arrivalStations];
    triggerFilterChange({ arrivalStations: [...props.arrivalStations] });
  }
};

// Seat Types Logic
const handleSeatTypeToggle = (type: string) => {
  let newTypes = [...selectedSeatTypes.value];
  if (newTypes.includes(type)) {
    newTypes = newTypes.filter(t => t !== type);
  } else {
    newTypes.push(type);
  }
  selectedSeatTypes.value = newTypes;
  triggerFilterChange({ seatTypes: newTypes });
};

const handleSeatTypesSelectAll = () => {
  if (selectedSeatTypes.value.length === seatTypeOptions.length) {
    selectedSeatTypes.value = [];
    triggerFilterChange({ seatTypes: [] });
  } else {
    selectedSeatTypes.value = [...seatTypeOptions];
    triggerFilterChange({ seatTypes: [...seatTypeOptions] });
  }
};

// Time Range Logic
const handleTimeRangeChange = () => {
  triggerFilterChange({ departureTimeRange: departureTimeRange.value });
};

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const getSelectAllButtonClass = (selectedCount: number, totalCount: number) => {
  if (selectedCount === 0 || selectedCount === totalCount) {
    return 'filter-all-btn';
  }
  return 'filter-all-btn partial';
};

// Watchers
watch(() => props.departureDate, (newDate) => {
  if (newDate) {
    selectedDate.value = newDate;
  }
}, { immediate: true });

watch(() => props.isHighSpeed, (newVal) => {
  if (!isInitialized.value && newVal) {
    const initialTypes = ['G', 'C', 'D'];
    selectedTrainTypes.value = initialTypes;
    isInitialized.value = true;
  }
}, { immediate: true });
</script>

<style scoped lang="scss">
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

  &:last-child {
    border-right: 1px solid transparent;
  }

  &:hover {
    background: linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 100%);
  }

  &.active {
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

  &:last-child {
    margin-bottom: 0;
  }
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

  &:hover {
    background-color: #7a95c5;
  }

  &:active {
    transform: scale(0.95);
  }

  &.partial {
    background-color: white;
    color: #999999;
    border: 1px solid #8ea7d4;
  }
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

  input[type="checkbox"] {
    width: 14px;
    height: 14px;
    cursor: pointer;
    margin: 0;
    accent-color: #8fc0e5;
    appearance: none;
    -webkit-appearance: none;
    border: 1px solid #8fc0e5;
    border-radius: 2px;
    position: relative;
    background-color: white;

    &:checked {
      background-color: #8fc0e5;

      &::after {
        content: '✓';
        position: absolute;
        color: white;
        font-size: 12px;
        font-weight: bold;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    &:checked + .checkbox-label {
      color: #333333;
      font-weight: 400;
    }
  }
}

.checkbox-label {
  font-size: 13px;
  color: #000000;
  cursor: pointer;
  font-weight: 400;
}

/* 发车时间选择 */
.filter-time-select {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  height: 28px;
  justify-self: end;
}

.time-label {
  font-size: 13px;
  color: #000000;
  white-space: nowrap;
  line-height: 28px;
}

.time-dropdown {
  padding: 4px 10px;
  border: 1px solid #d0d0d0;
  border-radius: 3px;
  font-size: 13px;
  color: #000000;
  background-color: white;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
  height: 28px;

  &:hover {
    border-color: #2196f3;
  }

  &:focus {
    border-color: #2196f3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
  }

  option {
    color: #333333;
  }
}

/* 筛选摘要/清除按钮 */
.filter-summary {
  padding: 0;
  border-top: none;
  display: flex;
  justify-content: flex-end;
  margin: 0 -20px -16px 0;
  margin-top: 12px;
}

.clear-filters-btn {
  padding: 6px 24px;
  background: #ff7f02;
  color: white;
  border: none;
  border-radius: 0 0 0 0;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;

  &:hover {
    background: linear-gradient(to bottom, #ffaa44 0%, #ff8822 100%);
  }

  &:active {
    transform: scale(0.98);
  }
}

.clear-icon {
  font-size: 14px;
  font-weight: normal;
}

/* 筛选折叠/展开按钮 */
.filter-action {
  display: flex;
  justify-content: center;
  padding-top: 5px;
}

.filter-toggle-btn {
  border: 1px solid #dedede;
  background: #f7f7f7;
  color: #333;
  padding: 2px 15px;
  cursor: pointer;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.filter-toggle-btn:hover {
  background: #ffffff;
  color: #0077ff;
  border-color: #0077ff;
}

.arrow-icon {
  display: inline-block;
  font-size: 10px;
  transform-origin: center;
  transition: transform 0.3s;
}

.arrow-icon.up {
  transform: rotate(0deg);
}

.arrow-icon.down {
  transform: rotate(180deg);
}

.filter-panel-container.collapsed .filter-row {
  display: none;
}

.filter-panel-container.collapsed {
  padding-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .train-filter-panel {
    padding: 15px;
    margin-bottom: 15px;
  }

  .filter-panel-container {
    gap: 15px;
  }

  .filter-row {
    grid-template-columns: 1fr;
    gap: 10px;
    padding-bottom: 12px;
  }

  .filter-label {
    min-width: auto;
    padding-top: 0;
    font-size: 13px;
  }

  .filter-options {
    gap: 10px;
  }

  .filter-checkbox {
    min-width: auto;
  }

  .checkbox-label {
    font-size: 13px;
  }

  .filter-checkbox input[type="checkbox"] {
    width: 15px;
    height: 15px;
  }
}

@media (max-width: 480px) {
  .train-filter-panel {
    padding: 12px;
  }

  .filter-panel-container {
    gap: 12px;
  }

  .filter-label {
    font-size: 12px;
  }

  .filter-options {
    gap: 8px;
  }

  .checkbox-label {
    font-size: 12px;
  }

  .filter-checkbox input[type="checkbox"] {
    width: 14px;
    height: 14px;
  }

  .clear-filters-btn {
    padding: 4px 12px;
    font-size: 11px;
  }
}
</style>
