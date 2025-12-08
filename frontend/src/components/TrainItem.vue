<template>
  <div class="train-item" :class="rowIndex % 2 === 0 ? 'train-item-even' : 'train-item-odd'">
    <!-- 车次号 - 带下拉箭头 -->
    <div class="train-item-cell align-left">
      <div class="train-number-container">
        <span class="train-number">{{ train.trainNo || '--' }}</span>
        <svg class="train-dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 8L2 4H10L6 8Z" fill="#2196f3"/>
        </svg>
      </div>
      <!-- 可以在这里添加车次类型标签 -->
      <div class="train-badges">
        <span v-if="train.trainNo?.startsWith('G')" class="train-badge">高</span>
        <span v-if="train.trainNo?.startsWith('D')" class="train-badge">动</span>
      </div>
    </div>
    
    <!-- 出发站/到达站 -->
    <div class="train-item-cell">
      <div class="train-stations-vertical">
        <div class="station-name-with-badge">
          <span class="station-badge station-badge-start">始</span>
          <span class="station-name">{{ train.departureStation || train.from || '--' }}</span>
        </div>
        <div class="station-name-with-badge">
          <span class="station-badge station-badge-end">终</span>
          <span class="station-name">{{ train.arrivalStation || train.to || '--' }}</span>
        </div>
      </div>
    </div>
    
    <!-- 出发/到达时间 -->
    <div class="train-item-cell">
      <div class="train-times-vertical">
        <div class="train-time train-time-departure">{{ train.departureTime || train.startTime || '--' }}</div>
        <div class="train-time train-time-arrival">{{ train.arrivalTime || train.endTime || '--' }}</div>
      </div>
    </div>
    
    <!-- 历时 -->
    <div class="train-item-cell">
      <div class="train-duration">{{ formatDuration(train.duration) }}</div>
      <div class="train-arrival-date">
        <span class="arrival-day-tag">{{ arrivalDayTag }}</span>
      </div>
    </div>
    
    <!-- 商务座/特等座 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.business)">
        {{ formatSeatStatus(availableSeats.business) }}
      </div>
    </div>
    
    <!-- 优选/一等座 -->
    <div class="train-item-cell">
      <div class="seat-info">--</div>
    </div>
    
    <!-- 一等座 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.firstClass)">
        {{ formatSeatStatus(availableSeats.firstClass) }}
      </div>
    </div>
    
    <!-- 二等座/二等包座 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.secondClass)">
        {{ formatSeatStatus(availableSeats.secondClass) }}
      </div>
    </div>
    
    <!-- 高级/软卧 -->
    <div class="train-item-cell">
      <div class="seat-info">--</div>
    </div>
    
    <!-- 软卧/动卧/一等卧 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.softSleeper)">
        {{ formatSeatStatus(availableSeats.softSleeper) }}
      </div>
    </div>
    
    <!-- 硬卧/二等卧 -->
    <div class="train-item-cell">
      <div class="seat-info" :class="getSeatClass(availableSeats.hardSleeper)">
        {{ formatSeatStatus(availableSeats.hardSleeper) }}
      </div>
    </div>
    
    <!-- 软座 -->
    <div class="train-item-cell">
      <div class="seat-info">--</div>
    </div>
    
    <!-- 硬座 -->
    <div class="train-item-cell">
      <div class="seat-info">--</div>
    </div>
    
    <!-- 无座 -->
    <div class="train-item-cell">
      <div class="seat-info">--</div>
    </div>
    
    <!-- 其他 -->
    <div class="train-item-cell">
      <div class="seat-info">--</div>
    </div>
    
    <!-- 备注 -->
    <div class="train-item-cell train-reserve-cell">
      <ReserveButton
        :trainNo="train.trainNo"
        :departureStation="train.departureStation || train.from"
        :arrivalStation="train.arrivalStation || train.to"
        :departureDate="queryDate"
        :departureTime="train.departureTime || train.startTime"
        :hasSoldOut="isAllSoldOut"
        :isLoggedIn="isLoggedIn"
        :queryTimestamp="queryTimestamp"
        @reserve="handleReserve"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ReserveButton from './ReserveButton.vue'
import './TrainItem.css'

interface Seat {
  type: string
  left: number
  bookable: boolean
  price: number
}

// Update Train interface to include mapped fields
interface Train {
  trainNo: string
  from: string
  to: string
  startTime: string
  endTime: string
  seats?: Seat[]
  
  // Mapped fields from TrainList
  departureStation?: string
  arrivalStation?: string
  departureTime?: string
  arrivalTime?: string
  duration?: number
  availableSeats?: Record<string, number | null>
}

const props = defineProps<{
  train: Train
  rowIndex: number
  isLoggedIn: boolean
  queryTimestamp: string
  queryDate: string
}>()

const emit = defineEmits<{
  (e: 'reserve', trainNo: string): void
}>()

const handleReserve = (trainNo: string) => {
  emit('reserve', trainNo)
}

// Extract available seats from props.train.availableSeats (if exists) or map from seats array
const availableSeats = computed(() => {
  const map: Record<string, number | null> = {
    business: null,
    firstClass: null,
    secondClass: null,
    softSleeper: null,
    hardSleeper: null
  }
  
  // Prefer pre-calculated availableSeats map from parent
  if (props.train.availableSeats) {
    map.business = props.train.availableSeats['商务座'] ?? null
    map.firstClass = props.train.availableSeats['一等座'] ?? null
    map.secondClass = props.train.availableSeats['二等座'] ?? null
    map.softSleeper = props.train.availableSeats['软卧'] ?? null
    map.hardSleeper = props.train.availableSeats['硬卧'] ?? null
  } else if (props.train.seats) {
    // Fallback if needed
    props.train.seats.forEach(seat => {
      if (seat.type === '商务座') map.business = seat.left
      if (seat.type === '一等座') map.firstClass = seat.left
      if (seat.type === '二等座') map.secondClass = seat.left
      if (seat.type === '软卧') map.softSleeper = seat.left
      if (seat.type === '硬卧') map.hardSleeper = seat.left
    })
  }
  
  return map
})

const formatSeatStatus = (count: number | null | undefined) => {
  if (count === null || count === undefined) return '--'
  if (count === 0) return '无'
  if (count >= 20) return '有'
  return count.toString()
}

const getSeatClass = (count: number | null | undefined) => {
  if (count === null || count === undefined) return 'not-available'
  if (count === 0) return 'sold-out'
  if (count >= 20) return 'available'
  return 'limited'
}

const isAllSoldOut = computed(() => {
  // Use the computed availableSeats values
  const seats = availableSeats.value
  const values = Object.values(seats).filter(v => v !== null)
  
  if (values.length === 0) return false
  return values.every(v => v === 0)
})

// Format duration from minutes
const formatDuration = (minutes: number | undefined) => {
  if (!minutes && minutes !== 0) {
    // Fallback to calculation if duration not provided
    if (props.train.startTime && props.train.endTime) {
      const start = props.train.startTime.split(':').map(Number)
      const end = props.train.endTime.split(':').map(Number)
      let startMin = start[0]! * 60 + start[1]!
      let endMin = end[0]! * 60 + end[1]!
      if (endMin < startMin) endMin += 24 * 60
      minutes = endMin - startMin
    } else {
      return '--'
    }
  }
  
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const arrivalDayTag = computed(() => {
  const depTimeStr = props.train.departureTime || props.train.startTime
  const arrTimeStr = props.train.arrivalTime || props.train.endTime
  
  if (!depTimeStr || !arrTimeStr) return '当日到达'
  
  const start = depTimeStr.split(':').map(Number)
  const end = arrTimeStr.split(':').map(Number)
  
  const startMin = start[0]! * 60 + start[1]!
  const endMin = end[0]! * 60 + end[1]!
  
  return endMin < startMin ? '次日到达' : '当日到达'
})
</script>


