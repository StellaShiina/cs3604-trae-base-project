<script setup lang="ts">
import { ref, watch } from 'vue'
import CityInput from './CityInput.vue'
import { getTodayString } from '@/utils/date'

const props = defineProps<{
  initialDepartureStation: string
  initialArrivalStation: string
  initialDepartureDate: string
}>()

const emit = defineEmits<{
  (e: 'search', params: any): void
  (e: 'date-update', date: string): void
}>()

const tripType = ref<'single' | 'round'>('single')
const ticketType = ref<'normal' | 'student'>('normal')
const departureStation = ref(props.initialDepartureStation)
const arrivalStation = ref(props.initialArrivalStation)
const departureDate = ref(props.initialDepartureDate || getTodayString())
const returnDate = ref(getTodayString())
const errors = ref<{ [key: string]: string }>({})
const isLoading = ref(false)

watch(() => props.initialDepartureStation, (val) => {
  if (val) departureStation.value = val
})

watch(() => props.initialArrivalStation, (val) => {
  if (val) arrivalStation.value = val
})

watch(() => props.initialDepartureDate, (val) => {
  if (val) departureDate.value = val
})

const handleSwapStations = () => {
  const temp = departureStation.value
  departureStation.value = arrivalStation.value
  arrivalStation.value = temp
}

const handleSearch = () => {
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
  
  emit('search', {
    departureStation: departureStation.value,
    arrivalStation: arrivalStation.value,
    departureDate: departureDate.value,
    tripType: tripType.value,
    ticketType: ticketType.value
  })
}

// Update city values
const updateDepartureStation = (val: string) => {
  departureStation.value = val
}

const updateArrivalStation = (val: string) => {
  arrivalStation.value = val
}

// We don't have a date picker in this bar according to the React component (it just uses input date or similar? No, it uses DatePicker).
// But in the inline style, we need to check how DatePicker fits. 
// The React component imports DatePicker. 
// Let's assume our DatePicker works fine here too.
</script>

<template>
  <div class="train-search-bar">
    <div class="search-bar-container">
      <!-- Trip Type -->
      <div class="trip-type-selector">
        <label class="radio-option">
          <input type="radio" v-model="tripType" value="single" />
          <span class="radio-label">单程</span>
        </label>
        <label class="radio-option">
          <input type="radio" v-model="tripType" value="round" />
          <span class="radio-label">往返</span>
        </label>
      </div>

      <div class="vertical-divider-blue"></div>

      <!-- Departure -->
      <div class="search-field-inline">
        <label class="search-field-label-inline">出发地</label>
        <div style="width: 120px;">
          <CityInput
            :value="departureStation"
            placeholder="出发地"
            type="departure"
            @update:value="updateDepartureStation"
          />
        </div>
        <div v-if="errors.departureStation" class="field-error">{{ errors.departureStation }}</div>
      </div>

      <!-- Swap Button -->
      <button class="swap-stations-btn" @click="handleSwapStations" title="互换出发/到达城市">
        <span class="swap-icon"></span>
      </button>

      <!-- Arrival -->
      <div class="search-field-inline">
        <label class="search-field-label-inline">到达地</label>
        <div style="width: 120px;">
          <CityInput
            :value="arrivalStation"
            placeholder="到达地"
            type="arrival"
            @update:value="updateArrivalStation"
          />
        </div>
        <div v-if="errors.arrivalStation" class="field-error">{{ errors.arrivalStation }}</div>
      </div>

      <!-- Departure Date -->
      <div class="search-field-inline">
        <label class="search-field-label-inline">出发日</label>
        <div style="width: 140px;">
           <!-- Need a simple input or date picker. Reusing DatePicker but need to ensure it fits inline styles -->
           <input 
             type="date" 
             v-model="departureDate" 
             class="simple-date-input"
             @change="emit('date-update', departureDate)"
           />
        </div>
      </div>

      <!-- Return Date (Disabled for single trip) -->
      <div class="search-field-inline">
        <label class="search-field-label-inline return-label">返程日</label>
        <div style="width: 140px;">
           <input 
             type="date" 
             v-model="returnDate" 
             class="simple-date-input"
             :disabled="tripType === 'single'"
           />
        </div>
      </div>

      <div class="vertical-divider-blue"></div>

      <!-- Ticket Type -->
      <div class="ticket-type-selector">
        <label class="radio-option">
          <input type="radio" v-model="ticketType" value="normal" />
          <span class="radio-label">普通</span>
        </label>
        <label class="radio-option">
          <input type="radio" v-model="ticketType" value="student" />
          <span class="radio-label">学生</span>
        </label>
      </div>

      <!-- Search Button -->
      <button class="search-submit-btn" @click="handleSearch" :disabled="isLoading">
        查询
      </button>
    </div>
    
    <div v-if="errors.general" class="search-error-message">{{ errors.general }}</div>
  </div>
</template>

<style scoped lang="scss">
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

  input[type="radio"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    margin: 0;
    accent-color: #2196f3;
  }
}

.radio-label {
  font-size: 14px;
  color: #000000;
  cursor: pointer;
  white-space: nowrap;
}

.vertical-divider-blue {
  width: 1px;
  height: 40px;
  background-color: #5ba3e0;
  align-self: center;
  margin: 0px 8px 0px 8px;
}

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

.simple-date-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #d0d5e8;
  border-radius: 3px;
  font-size: 13px;
  color: #333333;
  transition: border-color 0.2s;
  background-color: #ffffff;
  height: 30px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #5ba3e0;
    box-shadow: 0 0 0 2px rgba(91, 163, 224, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #bbb;
    cursor: not-allowed;
  }
}

.field-error {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 2px;
  font-size: 12px;
  color: #d32f2f;
  white-space: nowrap;
  z-index: 10;
}

.swap-stations-btn {
  width: 30px;
  height: 30px;
  min-width: 30px;
  padding: 0;
  background-color: #eff1f9;
  color: #5ba3e0;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f0f7ff;
    border-color: #1976d2;
    box-shadow: 0 2px 5px rgba(33, 150, 243, 0.3);
  }

  &:active {
    transform: scale(0.95);
    background-color: #e3f2fd;
  }

  .swap-icon {
    width: 20px;
    height: 20px;
    display: block;
    background-color: currentColor;
    mask: url('/images/转换.svg') no-repeat center / contain;
    -webkit-mask: url('/images/转换.svg') no-repeat center / contain;
  }
}

.search-submit-btn {
  padding: 6px 30px;
  background: #ff8001;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  height: 30px;
  margin-left: 6px;

  &:hover {
    background: #f7920a;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
}

.search-error-message {
  width: 100%;
  color: #d32f2f;
  font-size: 13px;
  margin-top: 10px;
  padding: 8px 20px;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>
