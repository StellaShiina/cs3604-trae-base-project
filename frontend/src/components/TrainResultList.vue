<template>
  <div class="train-list">
    <!-- 查询结果提示信息 - 始终显示 -->
    <div v-if="departureCity && arrivalCity" class="train-list-info">
      <div class="train-list-summary">
        <span class="summary-route">{{ departureCity }} → {{ arrivalCity }} </span>
        <span class="summary-date">({{ formatDate(departureDate) }})</span>
        <span class="summary-count"> 共{{ sortedTrains.length }}个车次</span>
        <span class="summary-transfer">您可使用<span class="transfer-highlight">中转换乘</span>功能，查询途中换乘一次的部分列车余票情况。</span>
      </div>
      <div class="train-list-hints">
        <label class="hint-checkbox">
          <input type="checkbox" />
          <span>显示折扣车次</span>
        </label>
        <label class="hint-checkbox">
          <input type="checkbox" />
          <span>显示积分兑换车次</span>
        </label>
        <label class="hint-checkbox">
          <input type="checkbox" />
          <span>显示全部可预订车次</span>
        </label>
      </div>
    </div>
    
    <div class="train-list-container">
      <div class="train-list-header">
        <div class="train-list-header-cell">车次</div>
        <div class="train-list-header-cell">
          出发站
          <br />
          到达站
        </div>
        <div class="train-list-header-cell">
          <span 
            class="header-line sortable-line"
            @click="handleSort('departureTime')"
          >
            出发时间 <span v-html="renderSortIcon('departureTime')"></span>
          </span>
          <span 
            class="header-line sortable-line"
            @click="handleSort('arrivalTime')"
          >
            到达时间 <span v-html="renderSortIcon('arrivalTime', true)"></span>
          </span>
        </div>
        <div 
          class="train-list-header-cell sortable"
          @click="handleSort('duration')"
        >
          <span class="header-line">历时 <span v-html="renderSortIcon('duration')"></span></span>
        </div>
        <div class="train-list-header-cell">
          商务座
          <br />
          特等座
        </div>
        <div class="train-list-header-cell">
          优选
          <br />
          一等座
        </div>
        <div class="train-list-header-cell">一等座</div>
        <div class="train-list-header-cell">
          二等座
          <br />
          二等包座
        </div>
        <div class="train-list-header-cell">
          高级
          <br />
          软卧
        </div>
        <div class="train-list-header-cell">
          软卧/动卧
          <br />
          一等卧
        </div>
        <div class="train-list-header-cell">
          硬卧
          <br />
          二等卧
        </div>
        <div class="train-list-header-cell">软座</div>
        <div class="train-list-header-cell">硬座</div>
        <div class="train-list-header-cell">无座</div>
        <div class="train-list-header-cell">其他</div>
        <div class="train-list-header-cell">备注</div>
      </div>
      
      <div v-if="sortedTrains.length === 0" class="train-list-empty">
        <div class="train-list-empty-icon">🚄</div>
        <div class="train-list-empty-text">暂无符合条件的车次</div>
        <div class="train-list-empty-hint">请尝试修改筛选条件或查询日期</div>
      </div>
      
      <div v-else class="train-list-body">
        <TrainItem
          v-for="(train, index) in sortedTrains"
          :key="train.trainNo"
          :train="train"
          :rowIndex="index"
          :isLoggedIn="isLoggedIn"
          :queryTimestamp="queryTimestamp"
          :queryDate="departureDate || ''"
          @reserve="handleReserve"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TrainItem from './TrainItem.vue'
import './TrainResultList.css'

interface Seat {
  type: string
  left: number
  bookable: boolean
  price: number
}

interface Train {
  trainNo: string
  from: string
  to: string
  startTime: string
  endTime: string
  seats: Seat[]
  departureStation?: string
  arrivalStation?: string
  departureTime?: string
  arrivalTime?: string
  duration?: number
  availableSeats?: Record<string, number | null>
  departureDate?: string
}

const props = defineProps<{
  trains: Train[]
  isLoggedIn: boolean
  queryTimestamp: string
  departureCity?: string
  arrivalCity?: string
  departureDate?: string
}>()

const emit = defineEmits<{
  (e: 'reserve', trainNo: string): void
}>()

const handleReserve = (trainNo: string) => {
  emit('reserve', trainNo)
}

type SortField = 'departureTime' | 'arrivalTime' | 'duration' | null
type SortOrder = 'asc' | 'desc'

const sortField = ref<SortField>(null)
const sortOrder = ref<SortOrder>('desc')

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  
  return `${month}月${day}日 ${weekday}`
}

const handleSort = (field: SortField) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const calculateDurationMinutes = (start: string, end: string) => {
  if (!start || !end) return 0
  const s = start.split(':').map(Number)
  const e = end.split(':').map(Number)
  let startMin = s[0]! * 60 + s[1]!
  let endMin = e[0]! * 60 + e[1]!
  if (endMin < startMin) endMin += 24 * 60
  return endMin - startMin
}

const sortedTrains = computed(() => {
  const list = [...props.trains]
  if (!sortField.value) return list
  
  return list.sort((a, b) => {
    let comparison = 0
    if (sortField.value === 'departureTime') {
      comparison = (a.startTime || '').localeCompare(b.startTime || '')
    } else if (sortField.value === 'arrivalTime') {
      comparison = (a.endTime || '').localeCompare(b.endTime || '')
    } else if (sortField.value === 'duration') {
      const durA = a.duration ?? calculateDurationMinutes(a.startTime, a.endTime)
      const durB = b.duration ?? calculateDurationMinutes(b.startTime, b.endTime)
      comparison = durA - durB
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})

const renderSortIcon = (field: SortField, isArrival: boolean = false) => {
  if (sortField.value !== field) {
    return `<span class="sort-icon neutral">${isArrival ? '▼' : '▲'}</span>`
  }
  return sortOrder.value === 'asc' ? 
    `<span class="sort-icon asc">▲</span>` : 
    `<span class="sort-icon desc">▼</span>`
}
</script>

<style>
/* Styles imported in script */
</style>
