<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  value: string
  minDate?: string
  maxDate?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:value', date: string): void
}>()

const showCalendar = ref(false)
const currentMonth = ref(new Date())
const calendarRef = ref<HTMLDivElement | null>(null)

const getSelectableRange = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let min: Date
  if (props.minDate && props.minDate.trim() !== '') {
    min = new Date(props.minDate)
    min.setHours(0, 0, 0, 0)
  } else {
    min = today
  }
  
  let max: Date
  if (props.maxDate && props.maxDate.trim() !== '') {
    max = new Date(props.maxDate)
    max.setHours(0, 0, 0, 0)
  } else {
    max = new Date(today)
    max.setDate(today.getDate() + 14)
  }
  
  return { min, max }
}

const formatDateString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${month}月${day}日 ${weekday}`
}

const handleClickOutside = (event: MouseEvent) => {
  if (calendarRef.value && !calendarRef.value.contains(event.target as Node)) {
    showCalendar.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()
  
  const days = []
  
  const { min, max } = getSelectableRange()
  const selectedDate = props.value ? new Date(props.value) : null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatDateString(today)
  
  // Previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(year, month - 1, day)
    const dateStr = formatDateString(date)
    days.push({
      date,
      dateStr,
      day,
      isCurrentMonth: false,
      isSelectable: date >= min && date <= max,
      isSelected: selectedDate ? dateStr === props.value : false,
      isToday: dateStr === todayStr
    })
  }
  
  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = formatDateString(date)
    days.push({
      date,
      dateStr,
      day,
      isCurrentMonth: true,
      isSelectable: date >= min && date <= max,
      isSelected: selectedDate ? dateStr === props.value : false,
      isToday: dateStr === todayStr
    })
  }
  
  // Next month
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    const dateStr = formatDateString(date)
    days.push({
      date,
      dateStr,
      day,
      isCurrentMonth: false,
      isSelectable: date >= min && date <= max,
      isSelected: selectedDate ? dateStr === props.value : false,
      isToday: dateStr === todayStr
    })
  }
  
  return days
})

const handleDateClick = (dateStr: string, isSelectable: boolean) => {
  if (isSelectable && !props.disabled) {
    emit('update:value', dateStr)
    showCalendar.value = false
  }
}

const handlePrevMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1)
}

const handleNextMonth = () => {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1)
}

const handleToday = () => {
  const today = new Date()
  currentMonth.value = today
  emit('update:value', formatDateString(today))
}

const monthYear = computed(() => {
  return `${currentMonth.value.getFullYear()}年${currentMonth.value.getMonth() + 1}月`
})

const toggleCalendar = () => {
  if (!props.disabled) {
    showCalendar.value = !showCalendar.value
  }
}
</script>

<template>
  <div class="date-picker" ref="calendarRef">
    <input
      type="text"
      :value="formatDisplayDate(value)"
      readonly
      :disabled="disabled"
      placeholder="请选择日期"
      @click="toggleCalendar"
      class="date-input"
      :class="{ disabled: disabled }"
    />
    <!-- Calendar Icon -->
    <svg class="calendar-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" stroke-width="1.5"/>
      <line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" stroke-width="1.5"/>
      <line x1="5" y1="1" x2="5" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="11" y1="1" x2="11" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    
    <div v-if="showCalendar && !disabled" class="calendar-dropdown">
      <div class="calendar-header">
        <button class="calendar-nav-btn" @click="handlePrevMonth" type="button">
          ‹
        </button>
        <div class="calendar-month-year">{{ monthYear }}</div>
        <button class="calendar-nav-btn" @click="handleNextMonth" type="button">
          ›
        </button>
      </div>
      <div class="calendar-weekdays">
        <div v-for="(day, index) in ['日', '一', '二', '三', '四', '五', '六']" :key="index" class="calendar-weekday">
          {{ day }}
        </div>
      </div>
      <div class="calendar-days">
        <div
          v-for="(dayInfo, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'other-month': !dayInfo.isCurrentMonth,
            'selected': dayInfo.isSelected,
            'today': dayInfo.isToday,
            'selectable': dayInfo.isSelectable,
            'disabled': !dayInfo.isSelectable
          }"
          @click="handleDateClick(dayInfo.dateStr, dayInfo.isSelectable)"
        >
          {{ dayInfo.day }}
        </div>
      </div>
      <div class="calendar-footer">
        <button class="calendar-today-btn" @click="handleToday" type="button">
          今天
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.date-picker {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.date-input {
  width: 100%;
  padding: 6px 32px 6px 10px;
  border: 1px solid #d0d5e8;
  border-radius: 3px;
  font-size: 13px;
  color: #333333;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
  height: 30px;
  box-sizing: border-box;

  &::placeholder {
    color: #bbb;
    font-size: 12px;
  }

  &:focus {
    outline: none;
    border-color: #5ba3e0;
    box-shadow: 0 0 0 2px rgba(91, 163, 224, 0.1);
  }

  &.disabled {
    background-color: #f5f5f5;
    color: #bbb;
    cursor: not-allowed;
    border-color: #e0e0e0;

    &::placeholder {
      color: #ccc;
    }
  }
}

.calendar-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
}

.date-input.disabled + .calendar-icon {
  color: #ccc;
}

.calendar-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: white;
  border: 1px solid #d0d5e8;
  border-radius: 4px;
  padding: 12px;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
}

.calendar-month-year {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.calendar-nav-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: color 0.2s, background-color 0.2s;
  border-radius: 4px;

  &:hover {
    color: #5ba3e0;
    background-color: #f5f5f5;
  }
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.calendar-weekday {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 8px 0;
  font-weight: 500;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  border-radius: 4px;
  transition: all 0.2s;
  cursor: default;
  user-select: none;

  &.other-month {
    color: #bbb;
  }

  &.selectable {
    cursor: pointer;
    color: #333;

    &:hover {
      background-color: #e6f2ff;
      color: #5ba3e0;
    }
  }

  &.disabled {
    color: #d0d0d0;
    cursor: not-allowed;
  }

  &.today {
    border: 1px solid #5ba3e0;
  }

  &.selected {
    background-color: #5ba3e0;
    color: white;
    font-weight: 600;

    &:hover {
      background-color: #4a92d0;
    }
  }
}

.calendar-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
}

.calendar-today-btn {
  background: none;
  border: 1px solid #5ba3e0;
  color: #5ba3e0;
  font-size: 13px;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #5ba3e0;
    color: white;
  }
}
</style>
