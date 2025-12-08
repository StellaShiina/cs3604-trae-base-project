<template>
  <div class="date-picker" ref="calendarRef">
    <input
      type="text"
      :value="displayDate"
      readonly
      :disabled="disabled"
      placeholder="请选择日期"
      @click="toggleCalendar"
      class="date-input"
      :class="{ disabled: disabled }"
    />
    
    <div v-if="showCalendar" class="calendar-dropdown">
      <!-- Calendar Header -->
      <div class="calendar-header">
        <button class="calendar-nav-btn" @click.stop="handlePrevMonth">&lt;</button>
        <div class="calendar-month-year">{{ currentYear }}年{{ currentMonth + 1 }}月</div>
        <button class="calendar-nav-btn" @click.stop="handleNextMonth">&gt;</button>
      </div>
      
      <!-- Weekdays -->
      <div class="calendar-weekdays">
        <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="calendar-weekday">
          {{ day }}
        </div>
      </div>
      
      <!-- Days Grid -->
      <div class="calendar-days">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            'selectable': day.isSelectable,
            'disabled': !day.isSelectable,
            'today': day.isToday,
            'selected': day.isSelected
          }"
          @click.stop="handleDateClick(day)"
        >
          {{ day.day }}
        </div>
      </div>
      
      <!-- Footer -->
      <div class="calendar-footer">
        <button class="calendar-today-btn" @click.stop="handleToday">今天</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const showCalendar = ref(false);
const currentMonthDate = ref(new Date());
const calendarRef = ref<HTMLElement | null>(null);

// Format date for display
const displayDate = computed(() => {
  if (!props.modelValue) return '';
  const date = new Date(props.modelValue);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 ${weekday}`;
});

const currentYear = computed(() => currentMonthDate.value.getFullYear());
const currentMonth = computed(() => currentMonthDate.value.getMonth());

// Helper to format YYYY-MM-DD
const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate selectable range
const getSelectableRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let min: Date;
  if (props.minDate) {
    min = new Date(props.minDate);
    min.setHours(0, 0, 0, 0);
  } else {
    min = today;
  }
  
  let max: Date;
  if (props.maxDate) {
    max = new Date(props.maxDate);
    max.setHours(0, 0, 0, 0);
  } else {
    max = new Date(today);
    max.setDate(today.getDate() + 14);
  }
  
  return { min, max };
};

interface CalendarDay {
  date: Date;
  dateStr: string;
  day: number;
  isCurrentMonth: boolean;
  isSelectable: boolean;
  isSelected: boolean;
  isToday: boolean;
}

const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const days: CalendarDay[] = [];
  const { min, max } = getSelectableRange();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateString(today);
  
  // Previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);
    const dateStr = formatDateString(date);
    days.push({
      date,
      dateStr,
      day,
      isCurrentMonth: false,
      isSelectable: date >= min && date <= max,
      isSelected: props.modelValue === dateStr,
      isToday: dateStr === todayStr
    });
  }
  
  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = formatDateString(date);
    days.push({
      date,
      dateStr,
      day,
      isCurrentMonth: true,
      isSelectable: date >= min && date <= max,
      isSelected: props.modelValue === dateStr,
      isToday: dateStr === todayStr
    });
  }
  
  // Next month
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    const dateStr = formatDateString(date);
    days.push({
      date,
      dateStr,
      day,
      isCurrentMonth: false,
      isSelectable: date >= min && date <= max,
      isSelected: props.modelValue === dateStr,
      isToday: dateStr === todayStr
    });
  }
  
  return days;
});

const toggleCalendar = () => {
  if (!props.disabled) {
    showCalendar.value = !showCalendar.value;
  }
};

const handleDateClick = (day: CalendarDay) => {
  if (day.isSelectable && !props.disabled) {
    emit('update:modelValue', day.dateStr);
    showCalendar.value = false;
  }
};

const handlePrevMonth = () => {
  currentMonthDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
};

const handleNextMonth = () => {
  currentMonthDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
};

const handleToday = () => {
  const today = new Date();
  currentMonthDate.value = today;
  emit('update:modelValue', formatDateString(today));
  showCalendar.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (calendarRef.value && !calendarRef.value.contains(event.target as Node)) {
    showCalendar.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<style>
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
}

.date-input::placeholder {
  color: #bbb;
  font-size: 12px;
}

.date-input:focus {
  outline: none;
  border-color: #5ba3e0;
  box-shadow: 0 0 0 2px rgba(91, 163, 224, 0.1);
}

.date-input.disabled {
  background-color: #f5f5f5;
  color: #bbb;
  cursor: not-allowed;
  border-color: #e0e0e0;
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
}

.calendar-nav-btn:hover {
  color: #5ba3e0;
  background-color: #f5f5f5;
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
}

.calendar-day.other-month {
  color: #bbb;
}

.calendar-day.selectable {
  cursor: pointer;
  color: #333;
}

.calendar-day.selectable:hover {
  background-color: #e6f2ff;
  color: #5ba3e0;
}

.calendar-day.disabled {
  color: #d0d0d0;
  cursor: not-allowed;
}

.calendar-day.today {
  border: 1px solid #5ba3e0;
}

.calendar-day.selected {
  background-color: #5ba3e0;
  color: white;
  font-weight: 600;
}

.calendar-day.selected:hover {
  background-color: #4a92d0;
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
}

.calendar-today-btn:hover {
  background-color: #5ba3e0;
  color: white;
}
</style>
